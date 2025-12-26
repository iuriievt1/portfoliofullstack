//
//  DriverHistoryView.swift
//  TaxiVeziDriver
//
//  Created by Iurii Evteev on 12/16/25.
//

import SwiftUI

struct DriverHistoryView: View {
    @EnvironmentObject var session: DriverAppSession
    @State private var rides: [Ride] = []
    @State private var isLoading = false
    @State private var errorText: String?

    private let api = DriverRidesAPI()

    var completedRides: [Ride] {
        rides.filter { $0.status == .completed }
    }

    var totalEarnings: Int {
        completedRides.count * 180 // позже из backend
    }

    var body: some View {
        NavigationStack {
            VStack {
                if isLoading {
                    ProgressView("Načítám historii…")
                } else if completedRides.isEmpty {
                    Text("Zatím nemáte dokončené jízdy")
                        .foregroundColor(.gray)
                        .padding()
                } else {
                    List(completedRides) { ride in
                        DriverRideRowView(ride: ride)
                    }
                }
            }
            .navigationTitle("Historie jízd")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    VStack(alignment: .trailing) {
                        Text("Výdělek")
                            .font(.caption)
                        Text("\(totalEarnings) Kč")
                            .font(.headline)
                            .foregroundColor(.green)
                    }
                }
            }
            .onAppear { loadHistory() }
        }
    }

    private func loadHistory() {
        guard let token = session.authToken else { return }

        isLoading = true
        errorText = nil

        Task {
            do {
                let available = try await api.getAvailableRides(token: token)
                let active = try await api.getActiveRide(token: token)
                var all: [Ride] = available
                if let active { all.append(active) }

                await MainActor.run {
                    self.rides = all
                    self.isLoading = false
                }
            } catch {
                await MainActor.run {
                    self.errorText = error.localizedDescription
                    self.isLoading = false
                }
            }
        }
    }
}

