//
//  DriverActiveRideView.swift
//  TaxiVeziDriver
//
//  Created by Iurii Evteev on 12/15/25.
//

import SwiftUI

struct DriverActiveRideView: View {
    let pickup: String
    let destination: String
    let estimatedPrice: String
    let initialEtaMinutes: Int

    enum RidePhase { case toPickup, withPassenger }

    @State private var phase: RidePhase = .toPickup
    @State private var remainingEta: Int
    @State private var showFinishAlert: Bool = false

    init(pickup: String, destination: String, estimatedPrice: String, initialEtaMinutes: Int) {
        self.pickup = pickup
        self.destination = destination
        self.estimatedPrice = estimatedPrice
        self.initialEtaMinutes = initialEtaMinutes
        _remainingEta = State(initialValue: initialEtaMinutes)
    }

    var body: some View {
        NavigationStack {
            VStack(spacing: 20) {
                VStack(spacing: 8) {
                    Text(phaseTitle)
                        .font(.title3)
                        .fontWeight(.semibold)

                    Text(phaseSubtitle)
                        .font(.subheadline)
                        .foregroundColor(.gray)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, 24)
                }
                .padding(.top, 24)

                VStack(alignment: .leading, spacing: 12) {
                    Text("Trasa").font(.headline)

                    VStack(alignment: .leading, spacing: 6) {
                        Text("Odkud").font(.caption).foregroundColor(.gray)
                        Text(pickup).font(.subheadline)

                        Divider().padding(.vertical, 4)

                        Text("Kam").font(.caption).foregroundColor(.gray)
                        Text(destination).font(.subheadline)
                    }

                    Divider().padding(.vertical, 4)

                    HStack { Text("Odhadovaná cena"); Spacer(); Text(estimatedPrice).fontWeight(.semibold) }
                    HStack { Text("Odhadovaný čas"); Spacer(); Text("\(remainingEta) min").foregroundColor(.gray) }
                }
                .padding()
                .background(
                    RoundedRectangle(cornerRadius: 16)
                        .fill(Color(.systemBackground))
                        .shadow(color: Color.black.opacity(0.06), radius: 8, x: 0, y: 2)
                )
                .padding(.horizontal, 16)

                VStack(spacing: 12) {
                    Button {
                        print("Kontaktovat pasažéra")
                    } label: {
                        Text("Kontaktovat pasažéra")
                            .font(.subheadline)
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(
                                RoundedRectangle(cornerRadius: 14)
                                    .stroke(Color.red, lineWidth: 1)
                            )
                    }

                    if phase == .toPickup {
                        Button {
                            phase = .withPassenger
                            remainingEta = 12
                        } label: {
                            Text("Zahájit jízdu s pasažérem")
                                .font(.headline)
                                .frame(maxWidth: .infinity)
                                .padding()
                                .background(Color.green)
                                .foregroundColor(.white)
                                .cornerRadius(16)
                        }
                    } else {
                        Button { showFinishAlert = true } label: {
                            Text("Dokončit jízdu")
                                .font(.headline)
                                .frame(maxWidth: .infinity)
                                .padding()
                                .background(Color.red)
                                .foregroundColor(.white)
                                .cornerRadius(16)
                        }
                    }
                }
                .padding(.horizontal, 16)

                Spacer()
            }
            .navigationTitle("Aktivní jízda")
            .navigationBarTitleDisplayMode(.inline)
            .alert("Dokončit jízdu?", isPresented: $showFinishAlert) {
                Button("Ano", role: .destructive) { print("Jízda dokončena (řidič)") }
                Button("Ne", role: .cancel) {}
            } message: {
                Text("Po dokončení jízdy se vypočítá finální částka a jízda se uloží do historie.")
            }
        }
    }

    private var phaseTitle: String {
        switch phase {
        case .toPickup: return "Jedu k pasažérovi"
        case .withPassenger: return "Jízda s pasažérem"
        }
    }

    private var phaseSubtitle: String {
        switch phase {
        case .toPickup: return "Držte se trasy v navigaci a dorazte na místo vyzvednutí pasažéra."
        case .withPassenger: return "Pokračujte k cíli pasažéra. Po dojezdu stiskněte ‚Dokončit jízdu‘."
        }
    }
}

#Preview {
    DriverActiveRideView(
        pickup: "Ramonova 10, Praha 8",
        destination: "Václavské náměstí",
        estimatedPrice: "190–220 Kč",
        initialEtaMinutes: 5
    )
}

