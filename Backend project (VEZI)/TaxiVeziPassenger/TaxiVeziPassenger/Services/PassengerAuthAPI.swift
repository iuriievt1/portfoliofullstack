//
//  PassengerAuthAPI.swift
//  TaxiVeziPassenger
//
//  Created by Iurii Evteev on 12/15/25.
//

import Foundation

private struct PassengerStartLoginResponse: Codable {
    let success: Bool
    let message: String?
}

private struct PassengerVerifyResponse: Codable {
    let success: Bool
    let message: String?
    let token: String?
}

enum PassengerAuthAPIError: Error, LocalizedError {
    case invalidURL
    case badResponse(String)
    case server(String)
    case noToken

    var errorDescription: String? {
        switch self {
        case .invalidURL: return "Invalid URL"
        case .badResponse(let msg): return msg
        case .server(let msg): return msg
        case .noToken: return "Missing token in response"
        }
    }
}

struct PassengerAuthAPI {
    private let baseURL = APIConfig.baseURL

    private func request(path: String, method: String, json: [String: Any]) async throws -> Data {
        guard let url = URL(string: path, relativeTo: baseURL) else { throw PassengerAuthAPIError.invalidURL }

        var req = URLRequest(url: url)
        req.httpMethod = method
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        req.httpBody = try JSONSerialization.data(withJSONObject: json, options: [])

        let (data, resp) = try await URLSession.shared.data(for: req)
        guard let http = resp as? HTTPURLResponse else {
            throw PassengerAuthAPIError.badResponse("No HTTP response")
        }

        if !(200..<300).contains(http.statusCode) {
            // попробуем вытащить message
            if let decoded = try? JSONDecoder().decode(PassengerStartLoginResponse.self, from: data),
               let msg = decoded.message {
                throw PassengerAuthAPIError.server(msg)
            }
            throw PassengerAuthAPIError.badResponse("HTTP \(http.statusCode)")
        }

        return data
    }

    func startLogin(phone: String) async throws {
        let data = try await request(
            path: "/auth/passenger/request-code",
            method: "POST",
            json: ["phone": phone]
        )

        let decoded = try JSONDecoder().decode(PassengerStartLoginResponse.self, from: data)
        if decoded.success == false {
            throw PassengerAuthAPIError.server(decoded.message ?? "Unknown error")
        }
    }

    func verifyCode(phone: String, code: String) async throws -> String {
        let data = try await request(
            path: "/auth/passenger/verify",
            method: "POST",
            json: ["phone": phone, "code": code]
        )

        let decoded = try JSONDecoder().decode(PassengerVerifyResponse.self, from: data)
        if decoded.success == false {
            throw PassengerAuthAPIError.server(decoded.message ?? "Invalid code")
        }
        guard let token = decoded.token, token.isEmpty == false else {
            throw PassengerAuthAPIError.noToken
        }
        return token
    }
}
