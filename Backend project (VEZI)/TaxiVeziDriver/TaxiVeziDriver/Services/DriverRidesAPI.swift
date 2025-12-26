//
//  DriverRidesAPI.swift
//  TaxiVeziDriver
//
//  Created by Iurii Evteev on 12/16/25.
//

import Foundation

enum DriverRidesAPIError: Error, LocalizedError {
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

struct DriverRidesAPI {
    private let baseURL = APIConfig.baseURL

    private func makeRequest(
        path: String,
        method: String,
        token: String,
        body: Data? = nil
    ) async throws -> Data {
        guard let url = URL(string: path, relativeTo: baseURL) else {
            throw DriverRidesAPIError.invalidURL
        }

        var request = URLRequest(url: url)
        request.httpMethod = method
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        request.httpBody = body

        let (data, response) = try await URLSession.shared.data(for: request)

        guard let http = response as? HTTPURLResponse else {
            throw DriverRidesAPIError.badResponse("No HTTP response")
        }

        if !(200..<300).contains(http.statusCode) {
            if let decoded = try? JSONDecoder().decode(RidesResponse.self, from: data),
               let msg = decoded.message {
                throw DriverRidesAPIError.server(msg)
            }
            if let decoded = try? JSONDecoder().decode(RideResponse.self, from: data),
               let msg = decoded.message {
                throw DriverRidesAPIError.server(msg)
            }
            throw DriverRidesAPIError.badResponse("HTTP \(http.statusCode)")
        }

        return data
    }

    // GET /driver/rides/available
    func getAvailableRides(token: String) async throws -> [Ride] {
        let data = try await makeRequest(path: "/driver/rides/available", method: "GET", token: token)
        let decoded = try JSONDecoder().decode(RidesResponse.self, from: data)
        if decoded.success == false { throw DriverRidesAPIError.server(decoded.message ?? "Unknown error") }
        return decoded.rides ?? []
    }

    // GET /driver/rides/active
    func getActiveRide(token: String) async throws -> Ride? {
        let data = try await makeRequest(path: "/driver/rides/active", method: "GET", token: token)
        let decoded = try JSONDecoder().decode(RideResponse.self, from: data)
        if decoded.success == false { throw DriverRidesAPIError.server(decoded.message ?? "Unknown error") }
        return decoded.ride
    }

    // POST /driver/rides/:id/accept
    func acceptRide(token: String, rideId: String) async throws -> Ride {
        let data = try await makeRequest(path: "/driver/rides/\(rideId)/accept", method: "POST", token: token)
        let decoded = try JSONDecoder().decode(RideResponse.self, from: data)
        if decoded.success == false { throw DriverRidesAPIError.server(decoded.message ?? "Unknown error") }
        guard let ride = decoded.ride else { throw DriverRidesAPIError.noRide }
        return ride
    }

    // POST /driver/rides/:id/next-status
    func nextStatus(token: String, rideId: String) async throws -> Ride {
        let data = try await makeRequest(path: "/driver/rides/\(rideId)/next-status", method: "POST", token: token)
        let decoded = try JSONDecoder().decode(RideResponse.self, from: data)
        if decoded.success == false { throw DriverRidesAPIError.server(decoded.message ?? "Unknown error") }
        guard let ride = decoded.ride else { throw DriverRidesAPIError.noRide }
        return ride
    }
}

