//
//  DriverDocumentUploadView.swift
//  TaxiVeziDriver
//
//  Created by Iurii Evteev on 12/15/25.
//

import SwiftUI

struct DriverDocumentUploadView: View {
    let docType: DriverDocumentType
    let onUploaded: () -> Void

    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            VStack(spacing: 20) {
                Text(docType.title)
                    .font(.title3)
                    .fontWeight(.semibold)
                    .padding(.top, 24)

                Text(docType.subtitle)
                    .font(.subheadline)
                    .foregroundColor(.gray)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 24)

                Spacer()

                RoundedRectangle(cornerRadius: 16)
                    .strokeBorder(style: StrokeStyle(lineWidth: 1, dash: [6]))
                    .foregroundColor(.gray.opacity(0.5))
                    .frame(height: 180)
                    .overlay(
                        VStack(spacing: 8) {
                            Image(systemName: "doc.text.viewfinder")
                                .font(.system(size: 40))
                            Text("Zde bude výběr fotky dokumentu")
                                .font(.subheadline)
                                .foregroundColor(.gray)
                        }
                    )
                    .padding(.horizontal, 24)

                Text("Teď jen simulujeme nahrání. Později přidáme focení / galerii.")
                    .font(.caption)
                    .foregroundColor(.gray)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 24)

                Spacer()

                Button {
                    onUploaded()
                    dismiss()
                } label: {
                    Text("Dokončit nahrání")
                        .font(.headline)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.red)
                        .foregroundColor(.white)
                        .cornerRadius(16)
                        .padding(.horizontal, 24)
                        .padding(.bottom, 16)
                }
            }
            .navigationTitle("Nahrát dokument")
            .navigationBarTitleDisplayMode(.inline)
        }
    }
}

#Preview {
    DriverDocumentUploadView(docType: .idCard, onUploaded: {})
}

