//
//  EarningsModels.swift
//  TaxiVeziDriver
//
//  Created by Iurii Evteev on 12/15/25.
//

import Foundation

struct DriverEarningsSummary {
    let todayAmount: Int
    let weekAmount: Int
    let monthAmount: Int
    let availableBalance: Int
}

struct DriverPayoutRecord: Identifiable {
    let id = UUID()
    let date: Date
    let amount: Int
    let status: String
}
