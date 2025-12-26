//
//  ProfileView.swift
//  TaxiVeziPassenger
//
//  Created by Iurii Evteev on 12/19/25.
//

import SwiftUI

struct ProfileView: View {
    @EnvironmentObject var session: AppSession

    var body: some View {
        VStack(spacing: 16) {
            VStack(spacing: 8) {
                Circle()
                    .fill(Color.tvPrimaryYellow.opacity(0.35))
                    .frame(width: 84, height: 84)
                    .overlay(
                        Image(systemName: "person.fill")
                            .font(.system(size: 34, weight: .bold))
                            .foregroundColor(.tvPrimaryRed)
                    )

                Text("Passenger")
                    .font(.title3)
                    .fontWeight(.semibold)

                Text(session.passengerPhone.isEmpty ? "—" : "+\(session.passengerPhone)")
                    .font(.subheadline)
                    .foregroundColor(.tvPrimaryYellow)
            }
            .padding(.top, 20)

            VStack(spacing: 12) {
                HStack {
                    Image(systemName: "key.fill")
                        .foregroundColor(.tvPrimaryYellow)
                    Text("Token saved in app")
                        .font(.footnote)
                        .foregroundColor(.tvPrimaryYellow)
                    Spacer()
                }
                .padding()
                .background(Color.tvCard)
                .cornerRadius(16)

                Button(role: .destructive) {
                    session.logout()
                } label: {
                    Text("Logout")
                        .font(.headline)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.tvPrimaryRed)
                        .foregroundColor(.white)
                        .cornerRadius(16)
                }
            }
            .padding(.horizontal, 16)

            Spacer()
        }
        .navigationTitle("Profile")
        .background(Color.tvBackground.ignoresSafeArea())
    }
}

