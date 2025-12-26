//
//  RideOffer.swift
//  TaxiVeziDriver
//
//  Created by Iurii Evteev on 12/15/25.
//

import Foundation

struct RideOffer: Identifiable {
    let id = UUID()
    let pickup: String
    let destination: String
    let distanceToPickupKm: Double
    let estimatedTripKm: Double
    let estimatedPrice: String
    let etaMinutes: Int
}
