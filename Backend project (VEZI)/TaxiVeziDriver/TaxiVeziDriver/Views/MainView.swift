//
//  MainView.swift
//  TaxiVeziDriver
//
//  Created by Iurii Evteev on 12/15/25.
//

import SwiftUI

struct MainView: View {
    var body: some View {
        TabView {
            DriverHomeView()
                .tabItem {
                    Image(systemName: "steeringwheel")
                    Text("Domů")
                }

            DriverOrdersView()
                .tabItem {
                    Image(systemName: "list.bullet")
                    Text("Nabídky")
                }

            DriverProfileView()
                .tabItem {
                    Image(systemName: "person.fill")
                    Text("Profil")
                }

            DriverHistoryView()
                .tabItem {
                    Image(systemName: "clock.arrow.circlepath")
                    Text("Historie")
                }
        }
        .tint(.tvPrimary)
    }
}


