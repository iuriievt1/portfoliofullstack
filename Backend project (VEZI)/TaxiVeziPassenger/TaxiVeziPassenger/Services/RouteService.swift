//
//  RouteService.swift
//  TaxiVeziPassenger
//
//  Created by Iurii Evteev on 12/18/25.
//

import Foundation
import MapKit

struct RouteResult {
    let polyline: MKPolyline
    let expectedTravelTime: TimeInterval
    let distanceMeters: CLLocationDistance

    var etaMinutesText: String {
        let minutes = max(1, Int(round(expectedTravelTime / 60.0)))
        return "\(minutes) min"
    }

    var distanceKmText: String {
        let km = distanceMeters / 1000.0
        return String(format: "%.1f km", km)
    }
}

enum RouteServiceError: Error {
    case noRoute
}

final class RouteService {
    func buildRoute(from: CLLocationCoordinate2D, to: CLLocationCoordinate2D) async throws -> RouteResult {
        let request = MKDirections.Request()
        request.source = MKMapItem(placemark: MKPlacemark(coordinate: from))
        request.destination = MKMapItem(placemark: MKPlacemark(coordinate: to))
        request.transportType = .automobile
        request.requestsAlternateRoutes = false

        let directions = MKDirections(request: request)

        // MKDirections в async стиле
        let response = try await directions.calculate()

        guard let route = response.routes.first else {
            throw RouteServiceError.noRoute
        }

        return RouteResult(
            polyline: route.polyline,
            expectedTravelTime: route.expectedTravelTime,
            distanceMeters: route.distance
        )
    }
}
