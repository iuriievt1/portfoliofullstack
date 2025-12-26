//
//  DriverOrdersBackendView.swift
//  TaxiVeziDriver
//
//  Created by Iurii Evteev on 12/16/25.
//

import SwiftUI

struct DriverOrdersBackendView: View {
    @EnvironmentObject var session: DriverAppSession

    @State private var rides: [Ride] = []
    @State private var selectedRide: Ride?
    @State private var errorText: String?
    @State private var isLoading: Bool = false

    @State private var showActiveRide: Bool = false
    @State private var activeRide: Ride?

    private let api = DriverRidesAPI()

    var body: some View {
        NavigationStack {
            VStack {
                if let errorText {
                    Text(errorText).font(.caption).foregroundColor(.red).padding(.top, 8)
                }

                if isLoading {
                    ProgressView().padding(.top, 16)
                }

                if rides.isEmpty && !isLoading {
                    VStack(spacing: 8) {
                        Text("Žádné nabídky jízd").font(.headline)
                        Text("Jakmile budete online a objeví se jízdy ve vašem okolí, zobrazí se zde.")
                            .font(.subheadline)
                            .foregroundColor(.gray)
                            .multilineTextAlignment(.center)
                            .padding(.horizontal, 32)
                    }
                    .padding(.top, 24)
                    Spacer()
                } else {
                    List(rides) { r in
                        Button { selectedRide = r } label: {
                            VStack(alignment: .leading, spacing: 6) {
                                Text("\(r.pickupAddress) → \(r.destinationAddress)")
                                    .font(.subheadline)
                                    .fontWeight(.medium)
                                    .lineLimit(2)
                                Text("Status: \(r.status.rawValue) • Tarif: \(r.carType ?? "—")")
                                    .font(.caption)
                                    .foregroundColor(.gray)
                            }
                            .padding(.vertical, 6)
                        }
                    }
                    .listStyle(.plain)
                }
            }
            .navigationTitle("Nabídky")
            .toolbar {
                Button("Refresh") { Task { await loadAvailable() } }
            }
            .task {
                await syncActive()
                await loadAvailable()
            }
            .sheet(item: $selectedRide) { ride in
                DriverRideOfferDetailBackendView(
                    ride: ride,
                    onAccept: { accepted in
                        // после accept — открываем active ride
                        self.activeRide = accepted
                        self.showActiveRide = true
                    },
                    onReject: {
                        // просто закрыли
                    }
                )
                .environmentObject(session)
            }
            .sheet(isPresented: $showActiveRide) {
                if let activeRide {
                    DriverActiveRideBackendView(ride: activeRide)
                        .environmentObject(session)
                }
            }
        }
    }

    private func loadAvailable() async {
        errorText = nil
        guard let token = session.authToken, !token.isEmpty else {
            errorText = "Chybí token řidiče."
            return
        }

        await MainActor.run { isLoading = true }

        do {
            let list = try await api.getAvailableRides(token: token)
            await MainActor.run {
                isLoading = false
                self.rides = list
            }
        } catch {
            await MainActor.run {
                isLoading = false
                errorText = error.localizedDescription
            }
        }
    }

    private func syncActive() async {
        guard let token = session.authToken, !token.isEmpty else { return }
        do {
            if let ride = try await api.getActiveRide(token: token) {
                await MainActor.run {
                    self.activeRide = ride
                    self.showActiveRide = true
                }
            }
        } catch {
            // молча, чтобы не бесить
        }
    }
}

