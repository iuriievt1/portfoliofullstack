//
//  DriverLocation.swift
//  TaxiVeziPassenger
//
//  Created by Iurii Evteev on 12/18/25.
//

import Foundation
import CoreLocation

struct DriverLocation: Codable, Identifiable {
    let id: String

    let rideId: String?
    let driverId: String?

    let lat: Double
    let lng: Double

    // optional (в backend пока нет, добавить позже)
    let speedMps: Double?
    let heading: Double?

    let updatedAt: String?

    var coordinate: CLLocationCoordinate2D {
        CLLocationCoordinate2D(latitude: lat, longitude: lng)
    }

    var speedKmh: Double {
        (speedMps ?? 0) * 3.6
    }

    enum CodingKeys: String, CodingKey {
        case rideId, driverId, lat, lng, speedMps, heading, updatedAt
    }

    init(
        id: String,
        rideId: String?,
        driverId: String?,
        lat: Double,
        lng: Double,
        speedMps: Double? = nil,
        heading: Double? = nil,
        updatedAt: String? = nil
    ) {
        self.id = id
        self.rideId = rideId
        self.driverId = driverId
        self.lat = lat
        self.lng = lng
        self.speedMps = speedMps
        self.heading = heading
        self.updatedAt = updatedAt
    }

    init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)

        let rideId = try c.decodeIfPresent(String.self, forKey: .rideId)
        let driverId = try c.decodeIfPresent(String.self, forKey: .driverId)

        let lat = try c.decode(Double.self, forKey: .lat)
        let lng = try c.decode(Double.self, forKey: .lng)

        let speedMps = try c.decodeIfPresent(Double.self, forKey: .speedMps)
        let heading = try c.decodeIfPresent(Double.self, forKey: .heading)
        let updatedAt = try c.decodeIfPresent(String.self, forKey: .updatedAt)

        // генератор стабильный id
        let stableId = driverId ?? rideId ?? UUID().uuidString

        self.init(
            id: stableId,
            rideId: rideId,
            driverId: driverId,
            lat: lat,
            lng: lng,
            speedMps: speedMps,
            heading: heading,
            updatedAt: updatedAt
        )
    }
}


