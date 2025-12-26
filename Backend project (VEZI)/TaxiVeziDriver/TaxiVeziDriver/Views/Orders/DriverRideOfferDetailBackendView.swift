//
//  DriverRideOfferDetailBackendView.swift
//  TaxiVeziDriver
//
//  Created by Iurii Evteev on 12/16/25.
//

import SwiftUI

struct DriverRideOfferDetailBackendView: View {
    @EnvironmentObject var session: DriverAppSession
    @Environment(\.dismiss) private var dismiss

    let ride: Ride
    let onAccept: (Ride) -> Void
    let onReject: () -> Void

    @State private var isAccepting: Bool = false
    @State private var errorText: String?

    private let api = DriverRidesAPI()

    var body: some View {
        NavigationStack {
            VStack(spacing: 16) {

                VStack(spacing: 8) {
                    Text("Nová nabídka jízdy")
                        .font(.title3)
                        .fontWeight(.semibold)

                    Text("\(ride.pickupAddress) → \(ride.destinationAddress)")
                        .font(.subheadline)
                        .multilineTextAlignment(.center)
                }
                .padding(.top, 16)
                .padding(.horizontal, 16)

                VStack(alignment: .leading, spacing: 10) {
                    Text("Detaily").font(.headline)
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
                    Text(errorText)
                        .font(.caption)
                        .foregroundColor(.red)
                        .padding(.horizontal, 16)
                }

                Spacer()

                VStack(spacing: 12) {
                    Button {
                        Task { await acceptRide() }
                    } label: {
                        if isAccepting {
                            ProgressView().frame(maxWidth: .infinity).padding()
                        } else {
                            Text("Přijmout jízdu").font(.headline).frame(maxWidth: .infinity).padding()
                        }
                    }
                    .background(Color.green)
                    .foregroundColor(.white)
                    .cornerRadius(16)
                    .padding(.horizontal, 16)
                    .disabled(isAccepting)

                    Button {
                        onReject()
                        dismiss()
                    } label: {
                        Text("Odmítnout")
                            .font(.headline)
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color.red.opacity(0.1))
                            .foregroundColor(.red)
                            .cornerRadius(16)
                    }
                    .padding(.horizontal, 16)
                    .padding(.bottom, 16)
                }
            }
            .navigationTitle("Nabídka jízdy")
            .navigationBarTitleDisplayMode(.inline)
        }
    }

    private func acceptRide() async {
        errorText = nil

        guard let token = session.authToken, !token.isEmpty else {
            errorText = "Chybí token řidiče."
            return
        }

        await MainActor.run { isAccepting = true }

        do {
            let accepted = try await api.acceptRide(token: token, rideId: ride.id)
            await MainActor.run {
                isAccepting = false
                onAccept(accepted)
                dismiss()
            }
        } catch {
            await MainActor.run {
                isAccepting = false
                errorText = error.localizedDescription
            }
        }
    }
}


