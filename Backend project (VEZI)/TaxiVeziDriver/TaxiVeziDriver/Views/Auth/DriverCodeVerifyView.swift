//
//  DriverCodeVerifyView.swift
//  TaxiVeziDriver
//
//  Created by Iurii Evteev on 12/15/25.
//

import SwiftUI

struct DriverCodeVerifyView: View {
    @EnvironmentObject var session: DriverAppSession
    let phone: String

    @State private var code: String = ""
    @State private var isValid: Bool = false

    @State private var isVerifying: Bool = false
    @State private var errorText: String?

    private let authAPI = DriverAuthAPI()

    var body: some View {
        VStack(spacing: 20) {
            Text("Ověřovací kód")
                .font(.title3)
                .fontWeight(.semibold)
                .padding(.top, 40)

            Text("Na číslo \(phone) jsme poslali kód.")
                .font(.subheadline)
                .foregroundColor(.gray)
                .padding(.horizontal, 32)
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
            .background(isValid ? Color.tvPrimary : Color.gray.opacity(0.3))
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
            let result = try await authAPI.verifyCode(phone: phone, code: code)
            await MainActor.run {
                isVerifying = false
                session.setSession(token: result.token, phone: phone, name: result.name)
            }
        } catch {
            await MainActor.run {
                isVerifying = false
                errorText = error.localizedDescription
            }
        }
    }
}

