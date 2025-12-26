//
//  PassengerCodeVerifyView.swift
//  TaxiVeziPassenger
//
//  Created by Iurii Evteev on 12/15/25.
//

import SwiftUI

struct PassengerCodeVerifyView: View {
    @EnvironmentObject var session: AppSession

    let phone: String

    @State private var code: String = ""
    @State private var isValid: Bool = false

    @State private var isVerifying: Bool = false
    @State private var errorText: String?

    private let authAPI = PassengerAuthAPI()

    var body: some View {
        VStack(spacing: 18) {
            Text("Ověřovací kód")
                .font(.title3)
                .fontWeight(.semibold)
                .padding(.top, 28)

            Text("Na číslo \(phone) jsme poslali kód.")
                .font(.subheadline)
                .foregroundColor(.gray)
                .padding(.horizontal, 24)
                .multilineTextAlignment(.center)

            TextField("1234", text: $code)
                .keyboardType(.numberPad)
                .multilineTextAlignment(.center)
                .font(.title)
                .padding()
                .background(Color(.secondarySystemBackground))
                .cornerRadius(12)
                .padding(.horizontal, 24)
                .onChange(of: code) { newValue in
                    let digits = newValue.filter { $0.isNumber }
                    if digits != newValue { code = digits }
                    isValid = digits.count == 4
                }

            Button {
                Task { await verify() }
            } label: {
                if isVerifying {
                    ProgressView().frame(maxWidth: .infinity).padding()
                } else {
                    Text("Potvrdit").font(.headline).frame(maxWidth: .infinity).padding()
                }
            }
            .background(isValid ? Color.tvPrimaryRed : Color.gray.opacity(0.3))
            .foregroundColor(.white)
            .cornerRadius(16)
            .padding(.horizontal, 24)
            .disabled(!isValid || isVerifying)

            if let errorText {
                Text(errorText)
                    .font(.caption)
                    .foregroundColor(.red)
                    .padding(.horizontal, 24)
            }

            Spacer()
        }
        .navigationTitle("Ověření")
    }

    private func verify() async {
        errorText = nil
        await MainActor.run { isVerifying = true }

        do {
            let token = try await authAPI.verifyCode(phone: phone, code: code)

            await MainActor.run {
                isVerifying = false
                session.setSession(token: token, phone: phone)
            }
        } catch {
            await MainActor.run {
                isVerifying = false
                errorText = error.localizedDescription
            }
        }
    }
}
