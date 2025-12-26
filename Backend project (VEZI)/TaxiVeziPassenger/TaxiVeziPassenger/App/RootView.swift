//
//  RootView.swift
//  TaxiVeziPassenger
//
//  Created by Iurii Evteev on 12/15/25.
//

import SwiftUI

struct RootView: View {
    @EnvironmentObject var session: AppSession

    var body: some View {
        Group {
            if session.isLoggedIn {
                MainTabView()
            } else {
                NavigationStack {
                    PassengerAuthView()
                }
            }
        }
    }
}

#Preview {
    RootView()
        .environmentObject(AppSession())
}


