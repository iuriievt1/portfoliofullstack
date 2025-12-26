//
//  DriverAppSession.swift
//  TaxiVeziDriver
//
//  Created by Iurii Evteev on 12/15/25.
//

import Foundation
import Combine

final class DriverAppSession: ObservableObject {
    @Published var isLoggedIn: Bool = false
    @Published var driverApproved: Bool = false

    @Published var driverPhone: String = ""
    @Published var driverName: String = ""

    /// JWT драйвера
    @Published var authToken: String? = nil

    /// online/offline — важно чтобы было в session (и Home/Orders видели одно и то же)
    @Published var isOnline: Bool = false

    /// активная поездка (если есть)
    @Published var activeRide: Ride? = nil

    // MARK: - Persist
    private let tokenKey = "tv_driver_token"
    private let phoneKey = "tv_driver_phone"
    private let nameKey  = "tv_driver_name"
    private let approvedKey = "tv_driver_approved"

    init() {
        let savedToken = UserDefaults.standard.string(forKey: tokenKey)
        let savedPhone = UserDefaults.standard.string(forKey: phoneKey) ?? ""
        let savedName  = UserDefaults.standard.string(forKey: nameKey) ?? ""
        let savedApproved = UserDefaults.standard.bool(forKey: approvedKey)

        self.authToken = savedToken
        self.driverPhone = savedPhone
        self.driverName = savedName
        self.driverApproved = savedApproved
        self.isLoggedIn = (savedToken?.isEmpty == false)

        // online не сохраняем (безопаснее начинать offline)
        self.isOnline = false
    }

    func setSession(token: String, phone: String, name: String?) {
        self.authToken = token
        self.driverPhone = phone
        self.driverName = (name?.isEmpty == false) ? name! : "Řidič Taxi Vezi"
        self.isLoggedIn = true

        UserDefaults.standard.set(token, forKey: tokenKey)
        UserDefaults.standard.set(phone, forKey: phoneKey)
        UserDefaults.standard.set(self.driverName, forKey: nameKey)
    }

    func setApproved(_ approved: Bool) {
        self.driverApproved = approved
        UserDefaults.standard.set(approved, forKey: approvedKey)
    }

    func logout() {
        isLoggedIn = false
        driverApproved = false
        driverPhone = ""
        driverName = ""
        authToken = nil
        isOnline = false
        activeRide = nil

        UserDefaults.standard.removeObject(forKey: tokenKey)
        UserDefaults.standard.removeObject(forKey: phoneKey)
        UserDefaults.standard.removeObject(forKey: nameKey)
        UserDefaults.standard.removeObject(forKey: approvedKey)
    }
}


