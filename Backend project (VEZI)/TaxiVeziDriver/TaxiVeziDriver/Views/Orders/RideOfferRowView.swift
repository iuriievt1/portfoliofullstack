//
//  RideOfferRowView.swift
//  TaxiVeziDriver
//
//  Created by Iurii Evteev on 12/15/25.
//

import SwiftUI

struct RideOfferRowView: View {
    let offer: RideOffer

    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            RoundedRectangle(cornerRadius: 10)
                .fill(Color.red.opacity(0.08))
                .frame(width: 40, height: 40)
                .overlay(Image(systemName: "car.fill").foregroundColor(.red))

            VStack(alignment: .leading, spacing: 4) {
                Text("\(offer.pickup) → \(offer.destination)")
                    .font(.subheadline)
                    .fontWeight(.medium)
                    .lineLimit(2)

                HStack(spacing: 8) {
                    Text("\(String(format: "%.1f", offer.distanceToPickupKm)) km k pasažérovi")
                    Text("•")
                    Text("\(String(format: "%.1f", offer.estimatedTripKm)) km jízda")
                }
                .font(.caption)
                .foregroundColor(.gray)

                Text("Odhad: \(offer.estimatedPrice)")
                    .font(.caption)
                    .foregroundColor(.gray)
            }

            Spacer()

            VStack(alignment: .trailing, spacing: 4) {
                Text("\(offer.etaMinutes) min").font(.headline)
                Text("ETA").font(.caption2).foregroundColor(.gray)
            }
        }
        .padding(.vertical, 4)
    }
}

