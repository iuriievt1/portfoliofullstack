//
//  Ride.swift
//  TaxiVeziPassenger
//
//  Created by Iurii Evteev on 12/15/25.
//

import Foundation

enum RideStatus: String, Codable {
    case searchingDriver = "searching_driver"
    case driverAssigned  = "driver_assigned"
    case onTheWay        = "on_the_way"
    case inProgress      = "in_progress"
    case completed       = "completed"
    case canceled        = "canceled"
}

struct Ride: Codable, Identifiable {
    let id: String

    let passengerId: String?
    let driverId: String?

    let pickupAddress: String
    let destinationAddress: String

    let pickupLat: Double?
    let pickupLng: Double?
    let destinationLat: Double?
    let destinationLng: Double?

    let carType: String?
    let status: RideStatus

    let createdAt: String?
    let updatedAt: String?
}

