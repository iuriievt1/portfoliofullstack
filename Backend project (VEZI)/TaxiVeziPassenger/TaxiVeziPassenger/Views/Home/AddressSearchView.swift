//
//  AddressSearchView.swift
//  TaxiVeziPassenger
//
//  Created by Iurii Evteev on 12/15/25.
//

import SwiftUI

struct AddressSearchView: View {
    @Binding var searchText: String
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            VStack(spacing: 12) {
                TextField("Cíl", text: $searchText)
                    .textFieldStyle(.roundedBorder)
                    .padding()

                Spacer()
            }
            .navigationTitle("Adresa")
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("Zavřít") { dismiss() }
                }
            }
        }
    }
}
