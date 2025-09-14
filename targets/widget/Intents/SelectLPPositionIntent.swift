import AppIntents
import WidgetKit

@available(iOS 16.0, *)
struct SelectLPPositionIntent: AppIntent, WidgetConfigurationIntent {
  static var title: LocalizedStringResource = "Select LP Position"
  static var description = IntentDescription("Choose which liquidity pool position to display in the widget")

  @Parameter(title: "LP Position")
  var position: LPPositionEntity?

  @Parameter(title: "Wallet")
  var wallet: WalletEntity?

  static var parameterSummary: some ParameterSummary {
    Summary {
      \.$position
      \.$wallet
    }
  }
}

@available(iOS 16.0, *)
struct LPPositionEntity: AppEntity {
  static var typeDisplayRepresentation: TypeDisplayRepresentation = "LP Position"

  let id: String
  let poolPairName: String
  let walletName: String
  let totalValue: Double
  let isInRange: Bool

  var displayRepresentation: DisplayRepresentation {
    DisplayRepresentation(
      title: "\(poolPairName)",
      subtitle: "\(walletName) • $\(String(format: "%.2f", totalValue))"
    )
  }

  static var defaultQuery = LPPositionQuery()
}

@available(iOS 16.0, *)
struct LPPositionQuery: EntityQuery {
  func entities(for identifiers: [String]) async throws -> [LPPositionEntity] {
    return LPPosition.mockPositions
      .filter { identifiers.contains($0.id) }
      .map { position in
        LPPositionEntity(
          id: position.id,
          poolPairName: position.poolPairName,
          walletName: position.walletName,
          totalValue: position.totalValue,
          isInRange: position.isInRange
        )
      }
  }

  func suggestedEntities() async throws -> [LPPositionEntity] {
    return LPPosition.mockPositions.map { position in
      LPPositionEntity(
        id: position.id,
        poolPairName: position.poolPairName,
        walletName: position.walletName,
        totalValue: position.totalValue,
        isInRange: position.isInRange
      )
    }
  }

  func defaultResult() async -> LPPositionEntity? {
    guard let firstPosition = LPPosition.mockPositions.first else { return nil }
    return LPPositionEntity(
      id: firstPosition.id,
      poolPairName: firstPosition.poolPairName,
      walletName: firstPosition.walletName,
      totalValue: firstPosition.totalValue,
      isInRange: firstPosition.isInRange
    )
  }
}

@available(iOS 16.0, *)
struct WalletEntity: AppEntity {
  static var typeDisplayRepresentation: TypeDisplayRepresentation = "Wallet"

  let id: String
  let address: String
  let name: String

  var displayRepresentation: DisplayRepresentation {
    DisplayRepresentation(title: "\(name)")
  }

  static var defaultQuery = WalletQuery()
}

@available(iOS 16.0, *)
struct WalletQuery: EntityQuery {
  func entities(for identifiers: [String]) async throws -> [WalletEntity] {
    let uniqueWallets = Dictionary(grouping: LPPosition.mockPositions) { $0.walletAddress }
      .compactMapValues { $0.first }
      .values

    return Array(uniqueWallets)
      .filter { identifiers.contains($0.walletAddress) }
      .map { WalletEntity(id: $0.walletAddress, address: $0.walletAddress, name: $0.walletName) }
  }

  func suggestedEntities() async throws -> [WalletEntity] {
    let uniqueWallets = Dictionary(grouping: LPPosition.mockPositions) { $0.walletAddress }
      .compactMapValues { $0.first }
      .values

    return Array(uniqueWallets).map { WalletEntity(id: $0.walletAddress, address: $0.walletAddress, name: $0.walletName) }
  }

  func defaultResult() async -> WalletEntity? {
    guard let firstPosition = LPPosition.mockPositions.first else { return nil }
    return WalletEntity(id: firstPosition.walletAddress, address: firstPosition.walletAddress, name: firstPosition.walletName)
  }
}