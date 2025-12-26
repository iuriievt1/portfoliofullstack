//
//  AppSession.swift
//  TaxiVeziPassenger
//
//  Created by Iurii Evteev on 12/15/25.
//

import Foundation
import Combine

final class AppSession: ObservableObject {
    @Published var isLoggedIn: Bool = false
    @Published var authToken: String? = nil
    @Published var passengerPhone: String = ""

    private let tokenKey = "tv_auth_token"
    private let phoneKey = "tv_passenger_phone"

    init() {
        // восстановление с прошлого запуска
        let savedToken = UserDefaults.standard.string(forKey: tokenKey)
        let savedPhone = UserDefaults.standard.string(forKey: phoneKey)

        self.authToken = savedToken
        self.passengerPhone = savedPhone ?? ""
        self.isLoggedIn = (savedToken?.isEmpty == false)
    }

    func setSession(token: String, phone: String) {
        authToken = token
        passengerPhone = phone
        isLoggedIn = true

        UserDefaults.standard.set(token, forKey: tokenKey)
        UserDefaults.standard.set(phone, forKey: phoneKey)
    }

    func logout() {
        isLoggedIn = false
        authToken = nil
        passengerPhone = ""

        UserDefaults.standard.removeObject(forKey: tokenKey)
        UserDefaults.standard.removeObject(forKey: phoneKey)
    }
}

