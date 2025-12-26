//
//  LocationManager.swift
//  TaxiVeziPassenger
//
//  Created by Iurii Evteev on 12/15/25.
//

import Foundation
import CoreLocation
import MapKit
import Combine

final class LocationManager: NSObject, ObservableObject, CLLocationManagerDelegate {

    @Published var region: MKCoordinateRegion

    private let manager = CLLocationManager()

    override init() {
        let prague = CLLocationCoordinate2D(latitude: 50.0755, longitude: 14.4378)

        self.region = MKCoordinateRegion(
            center: prague,
            span: MKCoordinateSpan(latitudeDelta: 0.05, longitudeDelta: 0.05)
        )

        super.init()

        manager.delegate = self
        manager.desiredAccuracy = kCLLocationAccuracyBest
        manager.distanceFilter = 15
        manager.requestWhenInUseAuthorization()
        manager.startUpdatingLocation()
    }

    func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        guard let last = locations.last else { return }

        DispatchQueue.main.async {
            self.region.center = last.coordinate
        }
    }
}


