//
//  APIConfig.swift
//  TaxiVeziPassenger
//
//  Created by Iurii Evteev on 12/19/25.
//

import Foundation

enum APIConfig {
    /// Для iOS Simulator можно "http://localhost:4000"
    /// Для реального iPhone НУЖНО: "http://IP_ТВОЕГО_MAC:4000"
    static var baseURL: URL {
        #if targetEnvironment(simulator)
        return URL(string: "http://localhost:4000")!
        #else
        // ВАЖНО: замени на IP твоего Mac в одной Wi-Fi сети:
        // http://192.168.0.10:4000
        return URL(string: "http://192.168.0.10:4000")!
        #endif
    }
}
