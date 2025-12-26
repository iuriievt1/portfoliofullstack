//
//  TaxiVeziDriverApp.swift
//  TaxiVeziDriver
//
//  Created by Iurii Evteev on 12/15/25.
//

import SwiftUI

@main
struct TaxiVeziDriverApp: App {
    @StateObject private var driverSession = DriverAppSession()

    var body: some Scene {
        WindowGroup {
            RootDriverView()
                .environmentObject(driverSession)
        }
    }
}

