//
//  DriverDocumentsModels.swift
//  TaxiVeziDriver
//
//  Created by Iurii Evteev on 12/15/25.
//

import Foundation

enum DriverDocumentType: CaseIterable, Identifiable {
    case idCard
    case drivingLicense
    case carRegistration
    case taxiLicense
    case insurance

    var id: String { title }

    var title: String {
        switch self {
        case .idCard: return "Doklad totožnosti"
        case .drivingLicense: return "Řidičský průkaz"
        case .carRegistration: return "Technický průkaz vozidla"
        case .taxiLicense: return "Průkaz řidiče taxislužby"
        case .insurance: return "Pojištění vozidla"
        }
    }

    var subtitle: String {
        switch self {
        case .idCard: return "Občanský průkaz nebo cestovní pas"
        case .drivingLicense: return "Platný řidičský průkaz"
        case .carRegistration: return "Malý technický průkaz vozidla"
        case .taxiLicense: return "Oprávnění k provozování taxislužby"
        case .insurance: return "Doklad o povinném ručení"
        }
    }
}

enum DriverDocumentStatus {
    case notUploaded
    case uploaded
}

struct DriverDocument: Identifiable {
    let id = UUID()
    let type: DriverDocumentType
    var status: DriverDocumentStatus = .notUploaded
}
