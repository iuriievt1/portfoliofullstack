//
//  DriverLocationAPI.swift
//  TaxiVeziDriver
//
//  Created by Iurii Evteev on 12/17/25.
//

import Foundation
import CoreLocation

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

    func sendLocation(token: String, location: CLLocation, isOnline: Bool) async throws {
        guard let url = URL(string: "/driver/location", relativeTo: baseURL) else {
            throw DriverLocationAPIError.invalidURL
        }

        let payload: [String: Any] = [
            "lat": location.coordinate.latitude,
            "lng": location.coordinate.longitude,
            "accuracy": location.horizontalAccuracy,
            "speed": max(0, location.speed),        // иногда -1
            "heading": max(0, location.course),     // иногда -1
            "isOnline": isOnline
        ]

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        request.httpBody = try JSONSerialization.data(withJSONObject: payload, options: [])

        let (data, response) = try await URLSession.shared.data(for: request)

        guard let http = response as? HTTPURLResponse else {
            throw DriverLocationAPIError.badResponse("No HTTP response")
        }

        if !(200..<300).contains(http.statusCode) {
            if let obj = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
               let msg = obj["message"] as? String {
                throw DriverLocationAPIError.server(msg)
            }
            throw DriverLocationAPIError.badResponse("HTTP \(http.statusCode)")
        }
    }
}
