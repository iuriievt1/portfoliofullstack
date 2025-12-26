//
//  DriverPayoutsView.swift
//  TaxiVeziDriver
//
//  Created by Iurii Evteev on 12/15/25.
//

import SwiftUI

struct DriverPayoutsView: View {
    let earnings: DriverEarningsSummary

    @State private var payoutHistory: [DriverPayoutRecord] = [
        DriverPayoutRecord(date: Date().addingTimeInterval(-86400 * 3), amount: 2500, status: "Dokončeno"),
        DriverPayoutRecord(date: Date().addingTimeInterval(-86400 * 10), amount: 1800, status: "Dokončeno")
    ]

    @State private var showWithdrawAlert: Bool = false

    private var dateFormatter: DateFormatter {
        let f = DateFormatter()
        f.dateFormat = "d.M.yyyy"
        return f
    }

    var body: some View {
        NavigationStack {
            VStack(spacing: 16) {
                VStack(alignment: .leading, spacing: 8) {
                    Text("Dostupné k výplatě").font(.caption).foregroundColor(.gray)
                    Text("\(earnings.availableBalance) Kč").font(.largeTitle).fontWeight(.bold)
                    Text("Výplaty probíhají na váš bankovní účet.").font(.caption).foregroundColor(.gray)
                }
                .padding()
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(
                    RoundedRectangle(cornerRadius: 18)
                        .fill(Color(.systemBackground))
                        .shadow(color: Color.black.opacity(0.06), radius: 8, x: 0, y: 2)
                )
                .padding(.horizontal, 16)
                .padding(.top, 16)

                Button { showWithdrawAlert = true } label: {
                    Text("Vybrat peníze")
                        .font(.headline)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(earnings.availableBalance > 0 ? Color.red : Color.gray.opacity(0.3))
                        .foregroundColor(.white)
                        .cornerRadius(16)
                        .padding(.horizontal, 16)
                }
                .disabled(earnings.availableBalance == 0)

                if payoutHistory.isEmpty {
                    Spacer()
                } else {
                    List {
                        Section(header: Text("Historie výplat")) {
                            ForEach(payoutHistory) { payout in
                                HStack {
                                    VStack(alignment: .leading, spacing: 4) {
                                        Text("\(payout.amount) Kč").font(.subheadline).fontWeight(.semibold)
                                        Text(dateFormatter.string(from: payout.date)).font(.caption).foregroundColor(.gray)
                                    }
                                    Spacer()
                                    Text(payout.status)
                                        .font(.caption)
                                        .padding(.horizontal, 8)
                                        .padding(.vertical, 4)
                                        .background(RoundedRectangle(cornerRadius: 10).fill(Color.green.opacity(0.1)))
                                        .foregroundColor(.green)
                                }
                                .padding(.vertical, 4)
                            }
                        }
                    }
                }
            }
            .navigationTitle("Výplaty")
            .navigationBarTitleDisplayMode(.inline)
            .alert("Žádost o výplatu", isPresented: $showWithdrawAlert) {
                Button("OK", role: .cancel) { }
            } message: {
                Text("Výplata bude zpracována. V reálné verzi zde bude napojení na banku.")
            }
        }
    }
}

