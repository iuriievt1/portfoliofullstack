//
//  DriverOrdersView.swift
//  TaxiVeziDriver
//
//  Created by Iurii Evteev on 12/15/25.
//

import SwiftUI
import Combine

struct DriverOrdersView: View {
    @EnvironmentObject var session: DriverAppSession

    private let api = DriverRidesAPI()

    @State private var rides: [Ride] = []
    @State private var selectedRide: Ride?
    @State private var isLoading: Bool = false
    @State private var errorText: String?

    private let timer = Timer.publish(every: 4, on: .main, in: .common).autoconnect()

    var body: some View {
        NavigationStack {
            Group {
                if let active = session.activeRide {
                    VStack(spacing: 10) {
                        Text("Máte aktivní jízdu")
                            .font(.headline)

                        Button {
                            selectedRide = active
                        } label: {
                            Text("Otevřít aktivní jízdu")
                                .font(.headline)
                                .frame(maxWidth: .infinity)
                                .padding()
                                .background(Color.tvPrimary)
                                .foregroundColor(.white)
                                .cornerRadius(14)
                        }
                    }
                    .padding()
                }

                if !session.isOnline {
                    VStack(spacing: 8) {
                        Text("Jste offline").font(.headline)
                        Text("Přepněte se do režimu online, abyste viděli nabídky jízd.")
                            .font(.subheadline)
                            .foregroundColor(.gray)
                            .multilineTextAlignment(.center)
                            .padding(.horizontal, 24)
                    }
                } else if isLoading {
                    VStack(spacing: 10) {
                        ProgressView()
                        Text("Načítám nabídky…")
                            .font(.caption)
                            .foregroundColor(.gray)
                    }
                } else if let errorText {
                    VStack(spacing: 10) {
                        Text("Chyba").font(.headline)
                        Text(errorText)
                            .font(.caption)
                            .foregroundColor(.red)
                            .multilineTextAlignment(.center)
                            .padding(.horizontal, 24)

                        Button("Zkusit znovu") {
                            Task { await refresh() }
                        }
                        .tint(.tvPrimary)
                    }
                } else if rides.isEmpty {
                    VStack(spacing: 8) {
                        Text("Žádné nabídky jízd").font(.headline)
                        Text("Jakmile se objeví jízdy ve vaší oblasti, zobrazí se zde.")
                            .font(.subheadline)
                            .foregroundColor(.gray)
                            .multilineTextAlignment(.center)
                            .padding(.horizontal, 24)
                    }
                } else {
                    List(rides) { ride in
                        Button {
                            selectedRide = ride
                        } label: {
                            VStack(alignment: .leading, spacing: 6) {
                                Text("\(ride.pickupAddress) → \(ride.destinationAddress)")
                                    .font(.subheadline)
                                    .fontWeight(.medium)

                                Text("Tarif: \(ride.carType ?? "—") • Status: \(ride.status.rawValue)")
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
                ToolbarItem(placement: .topBarTrailing) {
                    Button {
                        Task { await refresh() }
                    } label: {
                        Image(systemName: "arrow.clockwise")
                    }
                    .tint(.tvPrimary)
                }
            }
        }
        .sheet(item: $selectedRide) { ride in
            if session.activeRide?.id == ride.id, let active = session.activeRide {
                DriverActiveRideBackendView(ride: active)
                    .environmentObject(session)
            } else {
                DriverRideOfferDetailBackendView(
                    ride: ride,
                    onAccept: { accepted in
                        session.activeRide = accepted
                    },
                    onReject: { }
                )
                .environmentObject(session)
            }
        }
        .onAppear {
            Task { await refresh() }
        }
        .onReceive(timer) { _ in
            guard session.isOnline else { return }
            Task { await refresh(silent: true) }
        }
        .onChange(of: session.isOnline) { _, newValue in
            if newValue {
                Task { await refresh() }
            } else {
                rides = []
                errorText = nil
                isLoading = false
            }
        }
    }

    private func refresh(silent: Bool = false) async {
        guard let token = session.authToken, !token.isEmpty else {
            await MainActor.run { errorText = "Chybí token řidiče." }
            return
        }

        if !silent {
            await MainActor.run {
                isLoading = true
                errorText = nil
            }
        }

        do {
            let active = try await api.getActiveRide(token: token)
            let available = try await api.getAvailableRides(token: token)

            await MainActor.run {
                session.activeRide = active
                rides = available
                isLoading = false
                errorText = nil
            }
        } catch {
            await MainActor.run {
                isLoading = false
                if !silent { errorText = error.localizedDescription }
            }
        }
    }
}
