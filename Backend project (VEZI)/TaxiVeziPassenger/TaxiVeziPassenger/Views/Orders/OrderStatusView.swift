//
//  OrderStatusView.swift
//  TaxiVeziPassenger
//
//  Created by Iurii Evteev on 12/15/25.
//

import SwiftUI
import MapKit
import Combine

struct OrderStatusView: View {
    let pickup: String
    let destination: String
    let tariffName: String

    @Binding var note: String
    @Binding var isOrderActive: Bool
    @Binding var rideId: String?

    @StateObject private var locationManager = LocationManager()
    @State private var showDetails: Bool = false

    @Environment(\.dismiss) private var dismiss
    @EnvironmentObject var appSession: AppSession

    private let ridesAPI = RidesAPI()
    private let driverLocationAPI = DriverLocationAPI()

    @State private var isCancelling: Bool = false
    @State private var errorText: String?

    @State private var rideStatus: RideStatus?
    @State private var driverLocation: DriverLocation? = nil
    @State private var isLoadingDriverLocation: Bool = false

    private let timer = Timer.publish(every: 4, on: .main, in: .common).autoconnect()

    var body: some View {
        ZStack {
            Map(
                coordinateRegion: $locationManager.region,
                interactionModes: .all,
                showsUserLocation: true,
                userTrackingMode: .none,
                annotationItems: driverLocationItems
            ) { item in
                MapAnnotation(coordinate: item.coordinate) {
                    DriverMarkerView(location: item)
                }
            }
            .ignoresSafeArea()

            VStack {
                header
                Spacer()
                bottomSheet
            }
        }
        .onAppear {
            Task {
                await ensureRideId()
                await loadRideStatus()
                await loadDriverLocation()
            }
        }
        .onReceive(timer) { _ in
            Task { await loadDriverLocation(silent: true) }
        }
        .sheet(isPresented: $showDetails) {
            OrderDetailsView(
                pickup: pickup,
                destination: destination,
                tariffName: tariffName,
                note: $note
            )
            .environmentObject(appSession)
        }
        .alert("Chyba", isPresented: Binding(
            get: { errorText != nil },
            set: { _ in errorText = nil }
        )) {
            Button("OK", role: .cancel) {}
        } message: {
            Text(errorText ?? "")
        }
    }

    // MARK: UI

    private var header: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text(titleText)
                    .font(.headline)
                    .fontWeight(.semibold)

                if let rideStatus {
                    Text("Status: \(rideStatus.rawValue)")
                        .font(.caption2)
                        .foregroundColor(.gray)
                }

                if let driverLocation {
                    Text("Řidič: \(Int(driverLocation.speedKmh)) km/h")
                        .font(.caption2)
                        .foregroundColor(.gray)
                }
            }
            .padding(10)
            .background(.ultraThinMaterial)
            .cornerRadius(12)

            Spacer()
        }
        .padding(.top, 16)
        .padding(.horizontal, 16)
    }

    private var titleText: String {
        switch rideStatus {
        case .searchingDriver: return "Hledáme řidiče…"
        case .driverAssigned: return "Řidič přiřazen"
        case .onTheWay: return "Řidič je na cestě"
        case .inProgress: return "Jízda probíhá"
        case .completed: return "Jízda dokončena"
        case .canceled: return "Jízda zrušena"
        case .none: return "Stav jízdy"
        }
    }

    private var bottomSheet: some View {
        VStack(spacing: 16) {
            Capsule()
                .fill(Color.gray.opacity(0.3))
                .frame(width: 40, height: 4)
                .padding(.top, 6)

            VStack(alignment: .leading, spacing: 6) {
                Text("Trasa").font(.caption).foregroundColor(.gray)
                Text("\(pickup) → \(destination)")
                    .font(.subheadline)
                    .fontWeight(.medium)
                    .lineLimit(2)

                Text("Tarif: \(tariffName)")
                    .font(.caption)
                    .foregroundColor(.gray)

                if !note.trimmingCharacters(in: .whitespaces).isEmpty {
                    Text("Poznámka: \(note)")
                        .font(.caption)
                        .foregroundColor(.gray)
                }

                if isLoadingDriverLocation {
                    Text("Načítám polohu řidiče…")
                        .font(.caption)
                        .foregroundColor(.gray)
                        .padding(.top, 4)
                } else if driverLocation == nil {
                    Text("Poloha řidiče zatím není dostupná.")
                        .font(.caption)
                        .foregroundColor(.gray)
                        .padding(.top, 4)
                }
            }
            .frame(maxWidth: .infinity, alignment: .leading)

            HStack(spacing: 12) {
                Circle()
                    .fill(Color.gray.opacity(0.3))
                    .frame(width: 48, height: 48)
                    .overlay(Text("D").font(.headline).foregroundColor(.gray))

                VStack(alignment: .leading, spacing: 4) {
                    Text("Jan Novák").font(.headline)
                    Text("Škoda Octavia • Bílá").font(.subheadline).foregroundColor(.gray)
                }

                Spacer()
            }

            HStack(spacing: 12) {
                Button { showDetails = true } label: {
                    Text("Detaily jízdy")
                        .font(.subheadline)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(
                            RoundedRectangle(cornerRadius: 14)
                                .stroke(Color.tvPrimaryRed, lineWidth: 1)
                        )
                }

                Button {
                    // позже подключим звонок/чат
                    errorText = "Kontakt na řidiče zatím není implementován."
                } label: {
                    Text("Kontaktovat řidiče")
                        .font(.subheadline)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.tvPrimaryRed)
                        .foregroundColor(.white)
                        .cornerRadius(14)
                }
            }

            // DEV TEST
            if rideId != nil {
                Button {
                    Task { await advanceRideStatus() }
                } label: {
                    Text("Next status (TEST)")
                        .font(.subheadline)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.blue.opacity(0.9))
                        .foregroundColor(.white)
                        .cornerRadius(14)
                }
            }

            Button(role: .destructive) {
                Task { await cancelRide() }
            } label: {
                if isCancelling {
                    ProgressView().frame(maxWidth: .infinity)
                } else {
                    Text("Zrušit jízdu")
                        .font(.footnote)
                        .foregroundColor(.red)
                        .frame(maxWidth: .infinity)
                }
            }
            .padding(.bottom, 8)
            .disabled(isCancelling)
        }
        .padding(.horizontal, 16)
        .padding(.bottom, 24)
        .background(
            RoundedRectangle(cornerRadius: 24, style: .continuous)
                .fill(.ultraThinMaterial)
                .shadow(color: Color.black.opacity(0.2), radius: 18, x: 0, y: -4)
        )
    }

    private var driverLocationItems: [DriverLocation] {
        if let dl = driverLocation { return [dl] }
        return []
    }

    // MARK: Backend

    private func ensureRideId() async {
        // если rideId не пришёл — попробуем найти активную поездку
        if rideId != nil { return }
        guard let token = appSession.authToken, !token.isEmpty else { return }

        do {
            if let ride = try await ridesAPI.getBestActiveRide(token: token) {
                await MainActor.run {
                    self.rideId = ride.id
                    self.rideStatus = ride.status
                }
            }
        } catch {
            // молча
        }
    }

    private func loadRideStatus() async {
        guard let token = appSession.authToken, !token.isEmpty else { return }

        do {
            if let active = try await ridesAPI.getBestActiveRide(token: token) {
                await MainActor.run {
                    self.rideStatus = active.status
                    self.rideId = active.id
                }
            }
        } catch {
            // не критично
        }
    }

    private func loadDriverLocation(silent: Bool = false) async {
        guard let token = appSession.authToken, !token.isEmpty,
              let id = rideId else { return }

        if !silent {
            await MainActor.run {
                isLoadingDriverLocation = true
                errorText = nil
            }
        }

        do {
            let loc = try await driverLocationAPI.getDriverLocation(token: token, rideId: id)

            await MainActor.run {
                self.driverLocation = loc
                self.isLoadingDriverLocation = false

                if let loc {
                    self.locationManager.region = MKCoordinateRegion(
                        center: loc.coordinate,
                        span: MKCoordinateSpan(latitudeDelta: 0.02, longitudeDelta: 0.02)
                    )
                }
            }
        } catch {
            await MainActor.run {
                self.isLoadingDriverLocation = false
                if !silent { self.errorText = error.localizedDescription }
            }
        }
    }

    private func cancelRide() async {
        guard let token = appSession.authToken, !token.isEmpty,
              let id = rideId else {
            await MainActor.run { errorText = "Chybí informace o jízdě." }
            return
        }

        await MainActor.run {
            isCancelling = true
            errorText = nil
        }

        do {
            _ = try await ridesAPI.cancelRide(token: token, rideId: id)

            await MainActor.run {
                isCancelling = false
                isOrderActive = false
                rideId = nil
                dismiss()
            }
        } catch {
            await MainActor.run {
                isCancelling = false
                errorText = error.localizedDescription
            }
        }
    }

    private func advanceRideStatus() async {
        guard let token = appSession.authToken, !token.isEmpty,
              let id = rideId else {
            await MainActor.run { errorText = "Chybí informace o jízdě." }
            return
        }

        do {
            let updated = try await ridesAPI.advanceRideStatus(token: token, rideId: id)

            await MainActor.run {
                self.rideStatus = updated.status
                if updated.status == .completed || updated.status == .canceled {
                    isOrderActive = false
                    rideId = nil
                    dismiss()
                }
            }
        } catch {
            await MainActor.run { errorText = error.localizedDescription }
        }
    }
}



