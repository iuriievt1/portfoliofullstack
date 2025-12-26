//
//  Colors.swift
//  TaxiVeziPassenger
//
//  Created by Iurii Evteev on 12/15/25.
//

import SwiftUI

// MARK: - Hex helper
private extension Color {
    init(hex: UInt32, alpha: Double = 1.0) {
        let r = Double((hex >> 16) & 0xFF) / 255.0
        let g = Double((hex >> 8) & 0xFF) / 255.0
        let b = Double(hex & 0xFF) / 255.0
        self.init(.sRGB, red: r, green: g, blue: b, opacity: alpha)
    }
}

// MARK: - App Theme
extension Color {
    /// #D10000
    static let tvPrimaryRed = Color(hex: 0xD10000)

    /// #FFD600
    static let tvPrimaryYellow = Color(hex: 0xFFD600)

    // Дополнительно (удобно для UI)
    static let tvBackground = Color(.systemBackground)
    static let tvCard = Color(.secondarySystemBackground)
}

