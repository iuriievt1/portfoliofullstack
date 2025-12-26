//
//  DriverDocumentsView.swift
//  TaxiVeziDriver
//
//  Created by Iurii Evteev on 12/15/25.
//

import SwiftUI

struct DriverDocumentsView: View {
    @EnvironmentObject var session: DriverAppSession

    @State private var documents: [DriverDocument] =
        DriverDocumentType.allCases.map { DriverDocument(type: $0) }

    @State private var selectedType: DriverDocumentType?
    @State private var showSubmitAlert: Bool = false

    private var allUploaded: Bool {
        documents.allSatisfy { $0.status == .uploaded }
    }

    var body: some View {
        VStack(spacing: 16) {
            Text("Ověření řidiče")
                .font(.title2)
                .fontWeight(.semibold)
                .padding(.top, 24)

            Text("Abyste mohli jezdit s Taxi Vezi, potřebujeme ověřit vaši totožnost, řidičský průkaz a dokumenty k vozidlu.")
                .font(.subheadline)
                .foregroundColor(.gray)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 24)

            List {
                Section(header: Text("Požadované dokumenty")) {
                    ForEach(documents.indices, id: \.self) { index in
                        let doc = documents[index]
                        HStack {
                            VStack(alignment: .leading, spacing: 4) {
                                Text(doc.type.title).font(.subheadline).fontWeight(.medium)
                                Text(doc.type.subtitle).font(.caption).foregroundColor(.gray)
                            }

                            Spacer()

                            Button {
                                selectedType = doc.type
                            } label: {
                                HStack(spacing: 6) {
                                    Image(systemName: doc.status == .uploaded ? "checkmark.circle.fill" : "square.and.arrow.up")
                                    Text(doc.status == .uploaded ? "Nahráno" : "Nahrát")
                                }
                                .font(.caption)
                                .padding(.horizontal, 10)
                                .padding(.vertical, 6)
                                .background(
                                    RoundedRectangle(cornerRadius: 12)
                                        .fill(doc.status == .uploaded ? Color.green.opacity(0.1) : Color.tvPrimary.opacity(0.1))
                                )
                                .foregroundColor(doc.status == .uploaded ? .green : .tvPrimary)
                            }
                        }
                        .padding(.vertical, 4)
                    }
                }
            }

            VStack(spacing: 8) {
                Button {
                    if allUploaded {
                        session.setApproved(true)
                    } else {
                        showSubmitAlert = true
                    }
                } label: {
                    Text(allUploaded ? "Odeslat ke schválení" : "Nahrajte všechny dokumenty")
                        .font(.headline)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(allUploaded ? Color.tvPrimary : Color.gray.opacity(0.3))
                        .foregroundColor(.white)
                        .cornerRadius(16)
                        .padding(.horizontal, 16)
                }
                .disabled(!allUploaded)

                Text("V reálné verzi budou dokumenty ručně ověřeny naším týmem. Bez schválení nebude možné přijímat jízdy.")
                    .font(.caption)
                    .foregroundColor(.gray)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 24)
                    .padding(.bottom, 8)
            }
        }
        .sheet(item: $selectedType) { type in
            DriverDocumentUploadView(
                docType: type,
                onUploaded: {
                    if let index = documents.firstIndex(where: { $0.type.id == type.id }) {
                        documents[index].status = .uploaded
                    }
                }
            )
        }
        .alert("Chybějící dokumenty", isPresented: $showSubmitAlert) {
            Button("OK", role: .cancel) { }
        } message: {
            Text("Před odesláním ke schválení prosím nahrajte všechny požadované dokumenty.")
        }
        .navigationTitle("Dokumenty")
        .navigationBarTitleDisplayMode(.inline)
    }
}

