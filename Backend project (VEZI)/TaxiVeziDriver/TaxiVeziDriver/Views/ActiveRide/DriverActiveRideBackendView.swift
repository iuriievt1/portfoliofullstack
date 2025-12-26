//
//  DriverActiveRideBackendView.swift
//  TaxiVeziDriver
//
//  Created by Iurii Evteev on 12/16/25.
//

import SwiftUI

struct DriverActiveRideBackendView: View {
    @EnvironmentObject var session: DriverAppSession

    @State private var ride: Ride
    @State private var isMoving: Bool = false
    @State private var errorText: String?

    private let api = DriverRidesAPI()

    init(ride: Ride) {
        _ride = State(initialValue: ride)
    }

    var body: some View {
        NavigationStack {
            VStack(spacing: 16) {
                Text("\(ride.pickupAddress) → \(ride.destinationAddress)")
                    .font(.headline)
                    .multilineTextAlignment(.center)
                    .padding(.top, 16)
                    .padding(.horizontal, 16)

                VStack(alignment: .leading, spacing: 10) {
                    HStack { Text("Tarif"); Spacer(); Text(ride.carType ?? "—").foregroundColor(.gray) }
                    HStack { Text("Status"); Spacer(); Text(ride.status.rawValue).foregroundColor(.gray) }
                }
                .padding()
                .background(
                    RoundedRectangle(cornerRadius: 16)
                        .fill(Color(.systemBackground))
                        .shadow(color: Color.black.opacity(0.06), radius: 8, x: 0, y: 2)
                )
                .padding(.horizontal, 16)

                if let errorText {
                    Text(errorText).font(.caption).foregroundColor(.red)
                        .padding(.horizontal, 16)
                }

                Spacer()

                Button {
                    Task { await nextStatus() }
                } label: {
                    if isMoving {
                        ProgressView().frame(maxWidth: .infinity).padding()
                    } else {
                        Text(ride.status == .completed ? "Dokončeno" : "Next status (TEST)")
                            .font(.headline)
                            .frame(maxWidth: .infinity)
                            .padding()
                    }
                }
                .background(ride.status == .completed ? Color.gray.opacity(0.3) : Color.red)
                .foregroundColor(.white)
                .cornerRadius(16)
                .padding(.horizontal, 16)
                .padding(.bottom, 16)
                .disabled(isMoving || ride.status == .completed)
            }
            .navigationTitle("Aktivní jízda")
            .navigationBarTitleDisplayMode(.inline)
        }
    }

    private func nextStatus() async {
        errorText = nil
        guard let token = session.authToken, !token.isEmpty else {
            errorText = "Chybí token řidiče."
            return
        }

        await MainActor.run { isMoving = true }

        do {
            let updated = try await api.nextStatus(token: token, rideId: ride.id)
            await MainActor.run {
                isMoving = false
                ride = updated
                session.activeRide = (updated.status == .completed) ? nil : updated
            }
        } catch {
            await MainActor.run {
                isMoving = false
                errorText = error.localizedDescription
            }
        }
    }
}


