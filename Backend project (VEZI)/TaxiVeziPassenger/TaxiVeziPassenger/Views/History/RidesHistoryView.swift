//
//  RidesHistoryView.swift
//  TaxiVeziPassenger
//
//  Created by Iurii Evteev on 12/19/25.
//

import SwiftUI

struct RidesHistoryView: View {
    @EnvironmentObject var session: AppSession

    private let ridesAPI = RidesAPI()

    @State private var isLoading = false
    @State private var rides: [Ride] = []
    @State private var errorText: String?

    var body: some View {
        VStack(spacing: 0) {
            if isLoading {
                ProgressView()
                    .padding(.top, 20)
            }

            if let errorText {
                Text(errorText)
                    .foregroundColor(.red)
                    .font(.footnote)
                    .padding()
            }

            List {
                ForEach(rides) { ride in
                    RideRow(ride: ride)
                }
            }
            .listStyle(.plain)
        }
        .navigationTitle("History")
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Button {
                    Task { await load() }
                } label: {
                    Image(systemName: "arrow.clockwise")
                }
            }
        }
        .task { await load() }
    }

    private func load() async {
        guard let token = session.authToken, !token.isEmpty else {
            await MainActor.run {
                rides = []
                errorText = "Нет токена. Сначала авторизуйся."
            }
            return
        }

        await MainActor.run {
            isLoading = true
            errorText = nil
        }

        do {
            let list = try await ridesAPI.getPassengerRides(token: token)

            // Сортировка: самые новые наверх (по updatedAt/createdAt строкам — ISO обычно сортируется лексикографически ок)
            let sorted = list.sorted {
                ($0.updatedAt ?? $0.createdAt ?? "") > ($1.updatedAt ?? $1.createdAt ?? "")
            }

            await MainActor.run {
                rides = sorted
                isLoading = false
            }
        } catch {
            await MainActor.run {
                isLoading = false
                errorText = error.localizedDescription
            }
        }
    }
}

private struct RideRow: View {
    let ride: Ride

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack {
                Text("\(ride.pickupAddress) → \(ride.destinationAddress)")
                    .font(.subheadline)
                    .fontWeight(.semibold)
                    .lineLimit(2)

                Spacer()

                StatusPill(status: ride.status)
            }

            HStack(spacing: 10) {
                Text("Tariff: \( (ride.carType ?? "economy").capitalized )")
                    .font(.caption)
                    .foregroundColor(.tvPrimaryYellow)

                if let created = ride.createdAt, !created.isEmpty {
                    Text(created)
                        .font(.caption2)
                        .foregroundColor(.tvPrimaryYellow)
                        .lineLimit(1)
                }
            }
        }
        .padding(.vertical, 6)
    }
}

private struct StatusPill: View {
    let status: RideStatus

    var body: some View {
        Text(status.rawValue)
            .font(.caption2)
            .padding(.horizontal, 10)
            .padding(.vertical, 5)
            .background(background)
            .foregroundColor(foreground)
            .clipShape(Capsule())
    }

    private var background: Color {
        switch status {
        case .completed:
            return Color.green.opacity(0.15)
        case .canceled:
            return Color.red.opacity(0.15)
        case .searchingDriver, .driverAssigned, .onTheWay, .inProgress:
            return Color.tvPrimaryYellow.opacity(0.25)
        }
    }

    private var foreground: Color {
        switch status {
        case .completed:
            return .green
        case .canceled:
            return .red
        case .searchingDriver, .driverAssigned, .onTheWay, .inProgress:
            return .primary
        }
    }
}
