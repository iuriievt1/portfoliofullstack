//
//  RidesAPI.swift
//  TaxiVeziPassenger
//
//  Created by Iurii Evteev on 12/15/25.
//

import Foundation

private struct RideResponse: Codable {
    let success: Bool
    let message: String?
    let ride: Ride?
}

private struct RidesListResponse: Codable {
    let success: Bool
    let message: String?
    let rides: [Ride]?
}

enum RidesAPIError: Error, LocalizedError {
    case invalidURL
    case badResponse(String)
    case server(String)
    case noRide

    var errorDescription: String? {
        switch self {
        case .invalidURL: return "Invalid URL"
        case .badResponse(let msg): return msg
        case .server(let msg): return msg
        case .noRide: return "No ride in response"
        }
    }
}

struct RidesAPI {
    private let baseURL = APIConfig.baseURL

    private func makeRequest(
        path: String,
        method: String,
        token: String,
        body: Data? = nil
    ) async throws -> Data {
        guard let url = URL(string: path, relativeTo: baseURL) else {
            throw RidesAPIError.invalidURL
        }

        var request = URLRequest(url: url)
        request.httpMethod = method
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        request.httpBody = body

        let (data, response) = try await URLSession.shared.data(for: request)

        guard let http = response as? HTTPURLResponse else {
            throw RidesAPIError.badResponse("No HTTP response")
        }

        if !(200..<300).contains(http.statusCode) {
            // попробуем достать message
            if let decoded = try? JSONDecoder().decode(RideResponse.self, from: data),
               let msg = decoded.message {
                throw RidesAPIError.server(msg)
            }
            if let decoded2 = try? JSONDecoder().decode(RidesListResponse.self, from: data),
               let msg = decoded2.message {
                throw RidesAPIError.server(msg)
            }
            throw RidesAPIError.badResponse("HTTP \(http.statusCode)")
        }

        return data
    }

    func requestRide(
        token: String,
        pickupAddress: String,
        pickupLat: Double,
        pickupLng: Double,
        destinationAddress: String,
        destinationLat: Double,
        destinationLng: Double,
        carType: String
    ) async throws -> Ride {

        let payload: [String: Any] = [
            "pickupAddress": pickupAddress,
            "pickupLat": pickupLat,
            "pickupLng": pickupLng,
            "destinationAddress": destinationAddress,
            "destinationLat": destinationLat,
            "destinationLng": destinationLng,
            "carType": carType
        ]

        let body = try JSONSerialization.data(withJSONObject: payload, options: [])
        let data = try await makeRequest(path: "/rides/request", method: "POST", token: token, body: body)
        let decoded = try JSONDecoder().decode(RideResponse.self, from: data)

        if decoded.success == false {
            throw RidesAPIError.server(decoded.message ?? "Cannot create ride")
        }
        guard let ride = decoded.ride else { throw RidesAPIError.noRide }
        return ride
    }

    /// Было: /rides/passenger/active
    /// Но backend может вернуть "старую" активную (из-за in-memory и порядка).
    /// Поэтому мы будем использовать список /rides/passenger и выбирать последнюю активную по updatedAt/createdAt.
    func getBestActiveRide(token: String) async throws -> Ride? {
        let rides = try await getPassengerRides(token: token)

        let active = rides.filter { $0.status != .completed && $0.status != .canceled }

        // выбираем по updatedAt, иначе createdAt
        let sorted = active.sorted {
            ($0.updatedAt ?? $0.createdAt ?? "") > ($1.updatedAt ?? $1.createdAt ?? "")
        }

        return sorted.first
    }

    func cancelRide(token: String, rideId: String) async throws -> Ride {
        let data = try await makeRequest(path: "/rides/\(rideId)/cancel", method: "POST", token: token)
        let decoded = try JSONDecoder().decode(RideResponse.self, from: data)

        if decoded.success == false {
            throw RidesAPIError.server(decoded.message ?? "Cannot cancel ride")
        }
        guard let ride = decoded.ride else { throw RidesAPIError.noRide }
        return ride
    }

    func getPassengerRides(token: String) async throws -> [Ride] {
        let data = try await makeRequest(path: "/rides/passenger", method: "GET", token: token)
        let decoded = try JSONDecoder().decode(RidesListResponse.self, from: data)

        if decoded.success == false {
            throw RidesAPIError.server(decoded.message ?? "Cannot load rides")
        }
        return decoded.rides ?? []
    }

    func advanceRideStatus(token: String, rideId: String) async throws -> Ride {
        let data = try await makeRequest(path: "/rides/\(rideId)/next-status", method: "POST", token: token)
        let decoded = try JSONDecoder().decode(RideResponse.self, from: data)

        if decoded.success == false {
            throw RidesAPIError.server(decoded.message ?? "Cannot change status")
        }
        guard let ride = decoded.ride else { throw RidesAPIError.noRide }
        return ride
    }
}
