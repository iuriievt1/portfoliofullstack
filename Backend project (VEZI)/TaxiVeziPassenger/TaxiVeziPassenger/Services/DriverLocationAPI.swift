//
//  DriverLocationAPI.swift
//  TaxiVeziPassenger
//
//  Created by Iurii Evteev on 12/18/25.
//

import Foundation

private struct DriverLocationResponse: Codable {
    let success: Bool
    let message: String?
    let location: DriverLocation?
}

enum DriverLocationAPIError: Error, LocalizedError {
    case invalidURL
    case badResponse(String)
    case server(String)

    var errorDescription: String? {
        switch self {
        case .invalidURL: return "Invalid URL"
        case .badResponse(let msg): return msg
        case .server(let msg): return msg
        }
    }
}

struct DriverLocationAPI {
    private let baseURL = APIConfig.baseURL

    func getDriverLocation(token: String, rideId: String) async throws -> DriverLocation? {
        guard let url = URL(string: "/rides/\(rideId)/driver-location", relativeTo: baseURL) else {
            throw DriverLocationAPIError.invalidURL
        }

        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")

        let (data, response) = try await URLSession.shared.data(for: request)

        guard let http = response as? HTTPURLResponse else {
            throw DriverLocationAPIError.badResponse("No HTTP response")
        }

        if !(200..<300).contains(http.statusCode) {
            if let decoded = try? JSONDecoder().decode(DriverLocationResponse.self, from: data),
               let msg = decoded.message {
                throw DriverLocationAPIError.server(msg)
            }
            throw DriverLocationAPIError.badResponse("HTTP \(http.statusCode)")
        }

        let decoded = try JSONDecoder().decode(DriverLocationResponse.self, from: data)
        if decoded.success == false {
            throw DriverLocationAPIError.server(decoded.message ?? "Unknown error")
        }

        return decoded.location
    }
}


