//
//  DriverHomeView.swift
//  TaxiVeziDriver
//
//  Created by Iurii Evteev on 12/15/25.
//

import SwiftUI
import MapKit
import Combine
import CoreLocation

struct DriverHomeView: View {
    @EnvironmentObject var session: DriverAppSession
    @StateObject private var locationManager = LocationManager()

    // backend active ride
    @State private var activeRide: Ride? = nil
    @State private var isLoadingActive: Bool = false
    @State private var errorText: String? = nil

    private let ridesAPI = DriverRidesAPI()
    private let locationAPI = DriverLocationAPI()

    // polling active ride
    private let timer = Timer.publish(every: 4, on: .main, in: .common).autoconnect()
    @State private var showActiveRideSheet: Bool = false

    // throttling geo
    @State private var lastSentAt: Date = .distantPast
    @State private var lastSentCoord: CLLocationCoordinate2D? = nil

    var body: some View {
        ZStack {
            Map(coordinateRegion: $locationManager.region, showsUserLocation: true)
                .ignoresSafeArea()

            VStack(spacing: 0) {
                header
                Spacer()
                bottomPanel
            }
        }
        .onAppear {
            Task { await loadActiveRide() }
        }
        .onReceive(timer) { _ in
            guard session.isOnline else { return }
            Task { await loadActiveRide(silent: true) }
        }
        .onReceive(locationManager.$lastLocation) { loc in
            guard let loc else { return }
            guard session.isOnline else { return }
            guard let token = session.authToken, !token.isEmpty else { return }

            let now = Date()
            let timeOK = now.timeIntervalSince(lastSentAt) >= 3

            let distanceOK: Bool = {
                guard let last = lastSentCoord else { return true }
                let a = CLLocation(latitude: last.latitude, longitude: last.longitude)
                let b = CLLocation(latitude: loc.coordinate.latitude, longitude: loc.coordinate.longitude)
                return a.distance(from: b) >= 25
            }()

            guard timeOK || distanceOK else { return }

            lastSentAt = now
            lastSentCoord = loc.coordinate

            Task {
                do {
                    try await locationAPI.sendLocation(token: token, location: loc, isOnline: true)
                } catch {
                    // не спамим UI
                }
            }
        }
        .sheet(isPresented: $showActiveRideSheet) {
            if let ride = activeRide {
                DriverActiveRideBackendView(ride: ride)
                    .environmentObject(session)
            } else {
                Text("Žádná aktivní jízda")
                    .presentationDetents([.medium])
            }
        }
    }

    // MARK: - UI

    private var header: some View {
        HStack {
            Text("Taxi Vezi – Řidič")
                .font(.headline)
                .fontWeight(.bold)
                .padding(8)
                .background(Color.white.opacity(0.9))
                .cornerRadius(12)

            Spacer()

            Circle()
                .fill(session.isOnline ? Color.green : Color.gray)
                .frame(width: 10, height: 10)
        }
        .padding(.top, 16)
        .padding(.horizontal, 16)
    }

    private var bottomPanel: some View {
        VStack(spacing: 16) {
            Capsule()
                .fill(Color.gray.opacity(0.3))
                .frame(width: 40, height: 4)
                .padding(.top, 6)

            VStack(spacing: 12) {
                HStack {
                    Text(session.isOnline ? "Jste online" : "Jste offline")
                        .font(.headline)
                        .fontWeight(.semibold)

                    Spacer()

                    Circle()
                        .fill(session.isOnline ? Color.green : Color.gray)
                        .frame(width: 10, height: 10)
                }

                Toggle(isOn: $session.isOnline) {
                    Text(session.isOnline ? "Přijímám jízdy" : "Nepřijímám jízdy")
                        .font(.subheadline)
                }
                .tint(.tvPrimary)
                .onChange(of: session.isOnline) { _, newValue in
                    Task {
                        await handleOnlineChanged(newValue)
                    }
                }
            }

            if isLoadingActive {
                HStack(spacing: 10) {
                    ProgressView()
                    Text("Načítám aktivní jízdu…")
                        .font(.caption)
                        .foregroundColor(.gray)
                }
                .padding(.top, 4)
            } else if let ride = activeRide {
                VStack(alignment: .leading, spacing: 8) {
                    Text("Máte aktivní jízdu")
                        .font(.headline)

                    Text("\(ride.pickupAddress) → \(ride.destinationAddress)")
                        .font(.subheadline)
                        .foregroundColor(.gray)
                        .lineLimit(2)

                    Button {
                        showActiveRideSheet = true
                    } label: {
                        Text("Otevřít aktivní jízdu")
                            .font(.headline)
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color.tvPrimary)
                            .foregroundColor(.white)
                            .cornerRadius(14)
                    }
                }
                .padding()
                .background(
                    RoundedRectangle(cornerRadius: 18)
                        .fill(Color(.systemBackground))
                        .shadow(color: Color.black.opacity(0.08), radius: 10, x: 0, y: 3)
                )
            } else {
                VStack(spacing: 8) {
                    if session.isOnline {
                        Image(systemName: "dot.radiowaves.left.and.right")
                            .font(.system(size: 32))
                            .foregroundColor(.tvPrimary)

                        Text("Čekáme na novou jízdu…")
                            .font(.subheadline)
                            .fontWeight(.medium)

                        Text("Jakmile se objeví objednávka ve vaší oblasti, zobrazíme ji v Nabídkách.")
                            .font(.caption)
                            .foregroundColor(.gray)
                            .multilineTextAlignment(.center)
                            .padding(.horizontal, 24)
                    } else {
                        Image(systemName: "moon.zzz.fill")
                            .font(.system(size: 32))
                            .foregroundColor(.gray)

                        Text("Jste offline")
                            .font(.subheadline)
                            .fontWeight(.medium)

                        Text("Přepněte se do režimu online, pokud chcete začít přijímat nové jízdy.")
                            .font(.caption)
                            .foregroundColor(.gray)
                            .multilineTextAlignment(.center)
                            .padding(.horizontal, 24)
                    }
                }
                .padding(.bottom, 8)
            }

            if let errorText {
                Text(errorText)
                    .font(.caption)
                    .foregroundColor(.red)
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
        .padding(.bottom, 8)
    }

    // MARK: - Logic

    private func handleOnlineChanged(_ isOnline: Bool) async {
        guard let token = session.authToken, !token.isEmpty else { return }

        if isOnline {
            await loadActiveRide()
        } else {
            // отправим один раз "offline" на бек, если есть координата
            if let loc = locationManager.lastLocation {
                do {
                    try await locationAPI.sendLocation(token: token, location: loc, isOnline: false)
                } catch {
                    // тихо
                }
            }
            await MainActor.run {
                activeRide = nil
                session.activeRide = nil
            }
        }
    }

    private func loadActiveRide(silent: Bool = false) async {
        guard let token = session.authToken, !token.isEmpty else { return }

        if !silent {
            await MainActor.run {
                isLoadingActive = true
                errorText = nil
            }
        }

        do {
            let ride = try await ridesAPI.getActiveRide(token: token)
            await MainActor.run {
                activeRide = ride
                session.activeRide = ride
                isLoadingActive = false
            }
        } catch {
            await MainActor.run {
                if !silent { errorText = error.localizedDescription }
                isLoadingActive = false
            }
        }
    }
}

