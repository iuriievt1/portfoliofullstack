//
//  DriverRideRowView.swift
//  TaxiVeziDriver
//
//  Created by Iurii Evteev on 12/16/25.
//

import SwiftUI

struct DriverRideRowView: View {
    let ride: Ride

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text("\(ride.pickupAddress) → \(ride.destinationAddress)")
                .font(.subheadline)
                .fontWeight(.medium)

            HStack {
                Text("Dokončeno")
                    .font(.caption)
                    .foregroundColor(.gray)

                Spacer()

                Text("+180 Kč")
                    .font(.caption)
                    .foregroundColor(.green)
            }
        }
        .padding(.vertical, 6)
    }
}
