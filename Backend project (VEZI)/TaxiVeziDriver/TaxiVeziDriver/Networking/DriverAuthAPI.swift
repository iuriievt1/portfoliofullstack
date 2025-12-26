//
//  DriverAuthAPI.swift
//  TaxiVeziDriver
//
//  Created by Iurii Evteev on 12/15/25.
//

import Foundation

private struct DriverStartLoginResponse: Codable {
    let success: Bool
    let message: String?
}

private struct DriverVerifyResponse: Codable {
    let success: Bool
    let message: String?
    let token: String?
    let driver: DriverInfoPayload?
}

private struct DriverInfoPayload: Codable {
    let id: String?
    let name: String?
    let phone: String?
}

enum DriverAuthAPIError: Error, LocalizedError {
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

struct DriverAuthAPI {
    private let baseURL = APIConfig.baseURL

    private func makeRequest(path: String, method: String, json: [String: Any]) async throws -> Data {
        guard let url = URL(string: path, relativeTo: baseURL) else {
            throw DriverAuthAPIError.invalidURL
        }

        var req = URLRequest(url: url)
        req.httpMethod = method
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        req.httpBody = try JSONSerialization.data(withJSONObject: json, options: [])

        let (data, resp) = try await URLSession.shared.data(for: req)
        guard let http = resp as? HTTPURLResponse else {
            throw DriverAuthAPIError.badResponse("No HTTP response")
        }

        if !(200..<300).contains(http.statusCode) {
            if let decoded = try? JSONDecoder().decode(DriverStartLoginResponse.self, from: data),
               let msg = decoded.message {
                throw DriverAuthAPIError.server(msg)
            }
            if let decoded = try? JSONDecoder().decode(DriverVerifyResponse.self, from: data),
               let msg = decoded.message {
                throw DriverAuthAPIError.server(msg)
            }
            throw DriverAuthAPIError.badResponse("HTTP \(http.statusCode)")
        }

        return data
    }

    func startLogin(phone: String) async throws {
        let data = try await makeRequest(
            path: "/auth/driver/request-code",
            method: "POST",
            json: ["phone": phone]
        )

        let decoded = try JSONDecoder().decode(DriverStartLoginResponse.self, from: data)
        if decoded.success == false {
            throw DriverAuthAPIError.server(decoded.message ?? "Unknown error")
        }
    }

    func verifyCode(phone: String, code: String) async throws -> (token: String, name: String?) {
        let data = try await makeRequest(
            path: "/auth/driver/verify",
            method: "POST",
            json: ["phone": phone, "code": code]
        )

        let decoded = try JSONDecoder().decode(DriverVerifyResponse.self, from: data)

        if decoded.success == false {
            throw DriverAuthAPIError.server(decoded.message ?? "Invalid code")
        }

        guard let token = decoded.token, token.isEmpty == false else {
            throw DriverAuthAPIError.noToken
        }
        return (token, decoded.driver?.name)
    }
}
