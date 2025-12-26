//
//  HomeView.swift
//  TaxiVeziPassenger
//
//  Created by Iurii Evteev on 12/15/25.
//

import SwiftUI
import MapKit

struct HomeView: View {
    @StateObject private var locationManager = LocationManager()
    @EnvironmentObject var appSession: AppSession

    @State private var pickupText: String = "Moje poloha"
    @State private var destinationText: String = ""

    @State private var hasActiveOrder: Bool = false
    @State private var activeTariffName: String = ""
    @State private var activeNote: String = ""
    @State private var activeRideId: String?

    @State private var activeSheet: ActiveSheet?

    private let ridesAPI = RidesAPI()

    @State private var alertText: String?
    @State private var showAlert: Bool = false
    @State private var isLoadingActive: Bool = false

    enum ActiveSheet: Identifiable {
        case tariff, address, orderStatus
        var id: Int { hashValue }
    }

    var body: some View {
        ZStack {
            Map(coordinateRegion: $locationManager.region, showsUserLocation: true)
                .ignoresSafeArea()

            VStack(spacing: 0) {
                topBar
                Spacer()

                if hasActiveOrder {
                    activeOrderCard
                } else {
                    searchPanel
                }
            }
        }
        .task { await syncActiveRideFromBackend() }
        .sheet(item: $activeSheet) { sheet in
            switch sheet {
            case .tariff:
                TariffSelectionView(
                    pickup: pickupText,
                    destination: destinationText,
                    onConfirm: { selectedTariff, note in
                        Task { await startRideWithBackend(tariffName: selectedTariff, note: note) }
                    }
                )

            case .address:
                AddressSearchView(searchText: $destinationText)

            case .orderStatus:
                OrderStatusView(
                    pickup: pickupText,
                    destination: destinationText,
                    tariffName: activeTariffName,
                    note: $activeNote,
                    isOrderActive: $hasActiveOrder,
                    rideId: $activeRideId
                )
                .environmentObject(appSession)
            }
        }
        .alert("Info", isPresented: $showAlert) {
            Button("OK", role: .cancel) {}
        } message: {
            Text(alertText ?? "")
        }
    }

    // MARK: UI

    private var topBar: some View {
        HStack {
            Text("TAXI VEZI")
                .font(.headline)
                .fontWeight(.bold)
                .padding(.vertical, 8)
                .padding(.horizontal, 10)
                .background(Color.white.opacity(0.92))
                .cornerRadius(14)

            Spacer()

            if isLoadingActive {
                ProgressView().padding(.trailing, 6)
            }

            Button {
                Task { await syncActiveRideFromBackend() }
            } label: {
                Image(systemName: "arrow.clockwise")
                    .padding(10)
                    .background(Color.white.opacity(0.92))
                    .cornerRadius(14)
            }
        }
        .padding(.top, 16)
        .padding(.horizontal, 16)
    }

    private var activeOrderCard: some View {
        VStack(spacing: 12) {
            Capsule()
                .fill(Color.gray.opacity(0.3))
                .frame(width: 40, height: 4)
                .padding(.top, 6)

            VStack(alignment: .leading, spacing: 6) {
                Text("Máte aktivní jízdu")
                    .font(.subheadline)
                    .fontWeight(.semibold)

                Text("\(pickupText) → \(destinationText)")
                    .font(.footnote)
                    .foregroundColor(.gray)
                    .lineLimit(1)
            }
            .frame(maxWidth: .infinity, alignment: .leading)

            Button {
                activeSheet = .orderStatus
            } label: {
                Text("Zobrazit stav jízdy")
                    .font(.headline)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.tvPrimaryRed)
                    .foregroundColor(.white)
                    .cornerRadius(16)
            }
        }
        .padding(.horizontal, 16)
        .padding(.bottom, 24)
        .background(
            RoundedRectangle(cornerRadius: 24, style: .continuous)
                .fill(.ultraThinMaterial)
                .shadow(color: Color.black.opacity(0.2), radius: 18, x: 0, y: -4)
        )
        .padding(.horizontal, 16)
        .padding(.bottom, 24)
    }

    private var searchPanel: some View {
        RideSearchPanel(
            pickupText: $pickupText,
            destinationText: $destinationText,
            onSearchTap: {
                let dest = destinationText.trimmingCharacters(in: .whitespacesAndNewlines)
                guard !dest.isEmpty else {
                    alertText = "Zadejte cílovou adresu."
                    showAlert = true
                    return
                }
                activeSheet = .tariff
            },
            onDestinationTap: {
                activeSheet = .address
            }
        )
        .padding(.horizontal, 16)
        .padding(.bottom, 24)
    }

    // MARK: Backend

    private func syncActiveRideFromBackend() async {
        guard let token = appSession.authToken, !token.isEmpty else { return }

        await MainActor.run { isLoadingActive = true }

        do {
            if let ride = try await ridesAPI.getBestActiveRide(token: token) {
                await MainActor.run {
                    activeRideId = ride.id
                    pickupText = ride.pickupAddress
                    destinationText = ride.destinationAddress
                    activeTariffName = (ride.carType ?? "Economy").capitalized
                    hasActiveOrder = true
                    isLoadingActive = false
                }
            } else {
                await MainActor.run {
                    activeRideId = nil
                    hasActiveOrder = false
                    isLoadingActive = false
                }
            }
        } catch {
            await MainActor.run {
                isLoadingActive = false
                alertText = "Chyba: \(error.localizedDescription)"
                showAlert = true
            }
        }
    }

    private func startRideWithBackend(tariffName: String, note: String) async {
        let dest = destinationText.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !dest.isEmpty else { return }

        guard let token = appSession.authToken, !token.isEmpty else {
            await MainActor.run {
                alertText = "Nejprve se přihlaste."
                showAlert = true
            }
            return
        }

        let center = locationManager.region.center
        let pickupLat = center.latitude
        let pickupLng = center.longitude

        // пока без геокодинга — ставим destination = pickup (как у тебя было)
        let destinationLat = pickupLat
        let destinationLng = pickupLng

        do {
            let ride = try await ridesAPI.requestRide(
                token: token,
                pickupAddress: pickupText,
                pickupLat: pickupLat,
                pickupLng: pickupLng,
                destinationAddress: dest,
                destinationLat: destinationLat,
                destinationLng: destinationLng,
                carType: tariffName.lowercased()
            )

            await MainActor.run {
                activeRideId = ride.id
                pickupText = ride.pickupAddress
                destinationText = ride.destinationAddress
                activeTariffName = tariffName
                activeNote = note
                hasActiveOrder = true
                activeSheet = .orderStatus
            }
        } catch {
            await MainActor.run {
                alertText = "Chyba při vytvoření jízdy: \(error.localizedDescription)"
                showAlert = true
            }
        }
    }
}


