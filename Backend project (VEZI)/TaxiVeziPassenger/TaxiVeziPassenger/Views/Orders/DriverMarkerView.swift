//
//  DriverMarkerView.swift
//  TaxiVeziPassenger
//
//  Created by Iurii Evteev on 12/18/25.
//

import SwiftUI

struct DriverMarkerView: View {
    let location: DriverLocation

    var body: some View {
        VStack(spacing: 4) {
            Image(systemName: "car.fill")
                .font(.system(size: 16, weight: .bold))
                .padding(10)
                .background(Color.tvPrimaryRed)
                .foregroundColor(.white)
                .clipShape(Circle())
                .shadow(radius: 6)

            Text("\(Int(location.speedKmh)) km/h")
                .font(.caption2)
                .padding(.horizontal, 6)
                .padding(.vertical, 3)
                .background(.ultraThinMaterial)
                .cornerRadius(8)
        }
    }
}


