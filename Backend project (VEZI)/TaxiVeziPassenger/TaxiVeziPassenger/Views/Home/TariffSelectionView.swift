//
//  TariffSelectionView.swift
//  TaxiVeziPassenger
//
//  Created by Iurii Evteev on 12/15/25.
//

import SwiftUI

struct TariffSelectionView: View {
    let pickup: String
    let destination: String
    let onConfirm: (String, String) -> Void

    @Environment(\.dismiss) private var dismiss
    @State private var selected: String = "Economy"
    @State private var note: String = ""

    private let tariffs = ["Economy", "Comfort", "Business"]

    var body: some View {
        NavigationStack {
            VStack(spacing: 16) {
                VStack(alignment: .leading, spacing: 6) {
                    Text("Trasa").font(.caption).foregroundColor(.gray)
                    Text("\(pickup) → \(destination)")
                        .font(.subheadline)
                        .fontWeight(.medium)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding()

                Picker("Tarif", selection: $selected) {
                    ForEach(tariffs, id: \.self) { t in
                        Text(t).tag(t)
                    }
                }
                .pickerStyle(.segmented)
                .padding(.horizontal)

                TextField("Poznámka pro řidiče (volitelné)", text: $note)
                    .textFieldStyle(.roundedBorder)
                    .padding(.horizontal)

                Spacer()

                Button {
                    onConfirm(selected, note)
                    dismiss()
                } label: {
                    Text("Objednat")
                        .font(.headline)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.tvPrimaryRed)
                        .foregroundColor(.white)
                        .cornerRadius(16)
                        .padding(.horizontal)
                        .padding(.bottom, 16)
                }
            }
            .navigationTitle("Tarif")
            .navigationBarTitleDisplayMode(.inline)
        }
    }
}
