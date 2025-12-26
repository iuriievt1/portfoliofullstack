//
//  RideSearchPanel.swift
//  TaxiVeziPassenger
//
//  Created by Iurii Evteev on 12/15/25.
//

import SwiftUI

struct RideSearchPanel: View {
    @Binding var pickupText: String
    @Binding var destinationText: String

    let onSearchTap: () -> Void
    let onDestinationTap: () -> Void

    var body: some View {
        VStack(spacing: 12) {
            Capsule()
                .fill(Color.gray.opacity(0.3))
                .frame(width: 40, height: 4)
                .padding(.top, 6)

            VStack(alignment: .leading, spacing: 10) {
                Text("Odkud")
                    .font(.caption)
                    .foregroundColor(.gray)

                Text(pickupText)
                    .font(.subheadline)
                    .fontWeight(.medium)

                Divider()

                Text("Kam")
                    .font(.caption)
                    .foregroundColor(.gray)

                Button {
                    onDestinationTap()
                } label: {
                    HStack {
                        Text(destinationText.isEmpty ? "Zadejte cílovou adresu" : destinationText)
                            .foregroundColor(destinationText.isEmpty ? .gray : .primary)
                        Spacer()
                        Image(systemName: "magnifyingglass")
                            .foregroundColor(.gray)
                    }
                }
            }
            .padding()

            Button {
                onSearchTap()
            } label: {
                Text("Vybrat tarif")
                    .font(.headline)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.tvPrimaryRed)
                    .foregroundColor(.white)
                    .cornerRadius(16)
            }
        }
        .padding(.horizontal, 16)
        .padding(.bottom, 24)
        .background(
            RoundedRectangle(cornerRadius: 24, style: .continuous)
                .fill(.ultraThinMaterial)
                .shadow(color: Color.black.opacity(0.2), radius: 18, x: 0, y: -4)
        )
    }
}
