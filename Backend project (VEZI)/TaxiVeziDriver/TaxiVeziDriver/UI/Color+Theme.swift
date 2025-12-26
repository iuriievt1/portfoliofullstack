//
//  Color+Theme.swift
//  TaxiVeziDriver
//
//  Created by Iurii Evteev on 12/19/25.
//

import SwiftUI

extension Color {
    /// #D10000
    static let tvPrimaryRed = Color(hex: "D10000")

    /// #FFD600
    static let tvPrimaryYellow = Color(hex: "FFD600")

    /// Основной tint приложения (для TabBar и акцентов)
    static let tvPrimary = tvPrimaryRed
}

// MARK: - Hex init
extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)

        let a, r, g, b: UInt64
        switch hex.count {
        case 6: // RRGGBB
            (a, r, g, b) = (255, (int >> 16) & 255, (int >> 8) & 255, int & 255)
        case 8: // AARRGGBB
            (a, r, g, b) = ((int >> 24) & 255, (int >> 16) & 255, (int >> 8) & 255, int & 255)
        default:
            (a, r, g, b) = (255, 209, 0, 0)
        }

        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}
