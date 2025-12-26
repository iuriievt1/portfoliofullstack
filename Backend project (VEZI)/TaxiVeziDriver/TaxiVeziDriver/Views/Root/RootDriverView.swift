//
//  RootDriverView.swift
//  TaxiVeziDriver
//
//  Created by Iurii Evteev on 12/15/25.
//

import SwiftUI

struct RootDriverView: View {
    @EnvironmentObject var session: DriverAppSession

    var body: some View {
        Group {
            if session.isLoggedIn == false {
                NavigationStack { DriverAuthView() }
            } else if session.isLoggedIn && session.driverApproved == false {
                NavigationStack {
                    DriverDocumentsView()
                }
            } else {
                MainView()
            }
        }
    }
}

