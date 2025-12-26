//
//  PassengerAuthView.swift
//  TaxiVeziPassenger
//
//  Created by Iurii Evteev on 12/15/25.
//

import SwiftUI

struct PassengerAuthView: View {
    var body: some View {
        VStack(spacing: 18) {
            Spacer()

            Text("Taxi Vezi")
                .font(.largeTitle)
                .fontWeight(.bold)

            Text("Přihlaste se pro pokračování")
                .font(.subheadline)
                .foregroundColor(.gray)

            Spacer()

            NavigationLink {
                PassengerPhoneInputView()
            } label: {
                Text("Pokračovat")
                    .font(.headline)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.tvPrimaryRed)
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
