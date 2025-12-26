//
//  APIConfig.swift
//  TaxiVeziDriver
//
//  Created by Iurii Evteev on 12/19/25.
//

import Foundation

enum APIConfig {
    /// Для iOS Simulator работает localhost
    /// Для реального iPhone нужно IP  Mac в одной Wi-Fi сети
    static var baseURL: URL {
        #if targetEnvironment(simulator)
        return URL(string: "http://localhost:4000")!
        #else
        // ⚠️ ЗАМЕНИ на IP твоего Mac:
        // например: http://192.168.0.10:4000
        return URL(string: "http://192.168.0.10:4000")!
        #endif
    }
}
