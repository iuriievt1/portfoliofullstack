//
//  LocationManager.swift
//  TaxiVeziDriver
//
//  Created by Iurii Evteev on 12/15/25.
//

import Foundation
import CoreLocation
import MapKit
import Combine

final class LocationManager: NSObject, ObservableObject, CLLocationManagerDelegate {

    @Published var region: MKCoordinateRegion
    @Published var authorizationStatus: CLAuthorizationStatus = .notDetermined

    // ✅ НОВОЕ: отдаём наружу реальную CLLocation
    @Published var lastLocation: CLLocation? = nil

    private let manager = CLLocationManager()

    override init() {
        let defaultCenter = CLLocationCoordinate2D(latitude: 50.0755, longitude: 14.4378)
        self.region = MKCoordinateRegion(
            center: defaultCenter,
            span: MKCoordinateSpan(latitudeDelta: 0.05, longitudeDelta: 0.05)
        )

        super.init()

        manager.delegate = self
        manager.desiredAccuracy = kCLLocationAccuracyBest
        manager.distanceFilter = 10
        manager.requestWhenInUseAuthorization()
        manager.startUpdatingLocation()
    }

    func locationManagerDidChangeAuthorization(_ manager: CLLocationManager) {
        let status = manager.authorizationStatus
        DispatchQueue.main.async { self.authorizationStatus = status }

        if status == .authorizedWhenInUse || status == .authorizedAlways {
            manager.startUpdatingLocation()
        }
    }

    func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        guard let loc = locations.last else { return }

        DispatchQueue.main.async {
            self.lastLocation = loc
            self.region = MKCoordinateRegion(
                center: loc.coordinate,
                span: MKCoordinateSpan(latitudeDelta: 0.03, longitudeDelta: 0.03)
            )
        }
    }

    func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
        print("Location error (driver app): \(error.localizedDescription)")
    }
}
