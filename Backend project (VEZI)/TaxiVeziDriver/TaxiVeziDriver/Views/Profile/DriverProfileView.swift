//
//  DriverProfileView.swift
//  TaxiVeziDriver
//
//  Created by Iurii Evteev on 12/15/25.
//

import SwiftUI

struct DriverProfileView: View {
    private let driverName: String = "Řidič Taxi Vezi"
    private let driverCar: String = "Škoda Octavia • Bílá"
    private let driverRating: String = "4.9"

    @State private var earnings = DriverEarningsSummary(
        todayAmount: 850,
        weekAmount: 4200,
        monthAmount: 18750,
        availableBalance: 3200
    )

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    HStack(spacing: 16) {
                        ZStack {
                            Circle().fill(Color.red.opacity(0.1)).frame(width: 56, height: 56)
                            Text(initials(from: driverName)).font(.headline).foregroundColor(.red)
                        }

                        VStack(alignment: .leading, spacing: 4) {
                            Text(driverName).font(.headline)
                            Text(driverCar).font(.subheadline).foregroundColor(.gray)

                            HStack(spacing: 4) {
                                Image(systemName: "star.fill").font(.caption2)
                                Text(driverRating).font(.caption)
                            }
                            .foregroundColor(.yellow)
                        }
                    }
                    .padding(.vertical, 4)
                } header: { Text("Účet řidiče") }

                Section {
                    VStack(alignment: .leading, spacing: 8) {
                        HStack { Text("Dnes"); Spacer(); Text("\(earnings.todayAmount) Kč").fontWeight(.semibold) }
                        HStack { Text("Tento týden"); Spacer(); Text("\(earnings.weekAmount) Kč").fontWeight(.semibold) }
                        HStack { Text("Tento měsíc"); Spacer(); Text("\(earnings.monthAmount) Kč").fontWeight(.semibold) }
                    }

                    NavigationLink {
                        DriverPayoutsView(earnings: earnings)
                    } label: {
                        HStack {
                            VStack(alignment: .leading, spacing: 4) {
                                Text("Výplaty")
                                Text("Dostupné k výplatě: \(earnings.availableBalance) Kč")
                                    .font(.caption)
                                    .foregroundColor(.gray)
                            }
                            Spacer()
                            Image(systemName: "chevron.right").font(.caption).foregroundColor(.gray)
                        }
                    }
                } header: { Text("Výdělky") }
            }
            .navigationTitle("Profil řidiče")
        }
    }

    private func initials(from name: String) -> String {
        let parts = name.split(separator: " ")
        let first = parts.first?.first
        let last = parts.dropFirst().first?.first
        if let f = first, let l = last { return "\(f)\(l)" }
        if let f = first { return String(f) }
        return "Ř"
    }
}

#Preview { DriverProfileView() }

