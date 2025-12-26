//
//  OrderDetailsView.swift
//  TaxiVeziPassenger
//
//  Created by Iurii Evteev on 12/15/25.
//

import SwiftUI

struct OrderDetailsView: View {
    let pickup: String
    let destination: String
    let tariffName: String
    @Binding var note: String

    var body: some View {
        NavigationStack {
            Form {
                Section("Trasa") {
                    Text(pickup)
                    Text(destination)
                }
                Section("Tarif") {
                    Text(tariffName)
                }
                Section("Poznámka") {
                    TextField("Poznámka", text: $note)
                }
            }
            .navigationTitle("Detaily")
            .navigationBarTitleDisplayMode(.inline)
        }
    }
}

