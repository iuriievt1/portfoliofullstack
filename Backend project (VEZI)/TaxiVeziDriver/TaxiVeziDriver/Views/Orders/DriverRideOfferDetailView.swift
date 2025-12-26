//
//  DriverRideOfferDetailView.swift
//  TaxiVeziDriver
//
//  Created by Iurii Evteev on 12/15/25.
//

import SwiftUI

struct DriverRideOfferDetailView: View {
    let ride: Ride
    let onAccept: () -> Void
    let onReject: () -> Void

    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            VStack(spacing: 18) {
                VStack(spacing: 8) {
                    Text("Nová nabídka jízdy")
                        .font(.title3)
                        .fontWeight(.semibold)

                    Text("\(ride.pickupAddress) → \(ride.destinationAddress)")
                        .font(.subheadline)
                        .multilineTextAlignment(.center)
                }
                .padding(.top, 18)
                .padding(.horizontal, 24)

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

                Spacer()

                VStack(spacing: 12) {
                    Button {
                        onAccept()
                        dismiss()
                    } label: {
                        Text("Přijmout jízdu")
                            .font(.headline)
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color.green)
                            .foregroundColor(.white)
                            .cornerRadius(16)
                    }

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
                }
                .padding(.horizontal, 16)
                .padding(.bottom, 24)
            }
            .navigationTitle("Nabídka")
            .navigationBarTitleDisplayMode(.inline)
        }
    }
}



