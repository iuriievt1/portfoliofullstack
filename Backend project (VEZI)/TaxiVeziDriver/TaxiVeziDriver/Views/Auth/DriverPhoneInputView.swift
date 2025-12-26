//
//  DriverPhoneInputView.swift
//  TaxiVeziDriver
//
//  Created by Iurii Evteev on 12/15/25.
//

import SwiftUI

struct DriverPhoneInputView: View {
    @State private var phone: String = ""
    @State private var isValid: Bool = false

    @State private var isLoading: Bool = false
    @State private var errorText: String?
    @State private var navigateToCode: Bool = false

    private let authAPI = DriverAuthAPI()

    var body: some View {
        VStack(spacing: 20) {
            Text("Zadejte své telefonní číslo")
                .font(.title3)
                .fontWeight(.semibold)
                .padding(.top, 40)

            TextField("Telefon", text: $phone)
                .keyboardType(.phonePad)
                .padding()
                .background(Color(.secondarySystemBackground))
                .cornerRadius(12)
                .padding(.horizontal, 24)
                .onChange(of: phone) { newValue in
                    let digits = newValue.filter { $0.isNumber }
                    if digits != newValue { phone = digits }
                    isValid = digits.count >= 9
                }

            Button {
                Task { await startLogin() }
            } label: {
                if isLoading {
                    ProgressView().frame(maxWidth: .infinity).padding()
                } else {
                    Text("Pokračovat").font(.headline).frame(maxWidth: .infinity).padding()
                }
            }
            .background(isValid ? Color.tvPrimary : Color.gray.opacity(0.3))
            .foregroundColor(.white)
            .cornerRadius(16)
            .disabled(!isValid || isLoading)
            .padding(.horizontal, 24)

            NavigationLink(
                destination: DriverCodeVerifyView(phone: phone),
                isActive: $navigateToCode
            ) { EmptyView() }
            .hidden()

            if let errorText {
                Text(errorText)
                    .font(.caption)
                    .foregroundColor(.red)
                    .padding(.horizontal, 24)
            }

            Spacer()
        }
        .navigationTitle("Přihlášení")
    }

    private func startLogin() async {
        errorText = nil
        guard isValid else { return }

        await MainActor.run { isLoading = true }

        do {
            try await authAPI.startLogin(phone: phone)
            await MainActor.run {
                isLoading = false
                navigateToCode = true
            }
        } catch {
            await MainActor.run {
                isLoading = false
                errorText = error.localizedDescription
            }
        }
    }
}

