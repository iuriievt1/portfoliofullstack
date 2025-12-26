//
//  DriverAuthView.swift
//  TaxiVeziDriver
//
//  Created by Iurii Evteev on 12/15/25.
//

import SwiftUI

struct DriverAuthView: View {
    var body: some View {
        VStack(spacing: 20) {
            Spacer()

            Text("Taxi Vezi – Řidič")
                .font(.largeTitle)
                .fontWeight(.bold)
                .foregroundColor(.tvPrimary)

            Text("Přihlaste se pro pokračování")
                .font(.subheadline)
                .foregroundColor(.gray)

            Spacer()

            NavigationLink {
                DriverPhoneInputView()
            } label: {
                Text("Pokračovat")
                    .font(.headline)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.tvPrimary)
                    .foregroundColor(.white)
                    .cornerRadius(16)
            }
            .padding(.horizontal, 24)

            Spacer()
        }
        .navigationTitle("Přihlášení")
        .navigationBarTitleDisplayMode(.inline)
    }
}

