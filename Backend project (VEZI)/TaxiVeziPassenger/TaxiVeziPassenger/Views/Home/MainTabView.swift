//
//  MainTabView.swift
//  TaxiVeziPassenger
//
//  Created by Iurii Evteev on 12/19/25.
//

import SwiftUI

struct MainTabView: View {
    var body: some View {
        TabView {
            NavigationStack {
                HomeView()
            }
            .tabItem {
                Label("Home", systemImage: "map")
            }

            NavigationStack {
                RidesHistoryView()
            }
            .tabItem {
                Label("History", systemImage: "clock.arrow.circlepath")
            }

            NavigationStack {
                ProfileView()
            }
            .tabItem {
                Label("Profile", systemImage: "person.crop.circle")
            }
        }
        .tint(Color.tvPrimaryRed)
    }
}
