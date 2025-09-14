import WidgetKit

struct LiquidityPoolEntry: TimelineEntry {
  let date: Date
  let totalValue: Double
  let uncollectedFees: Double
  let isInRange: Bool
  let token0Amount: Double
  let token1Amount: Double
  let token0Symbol: String
  let token1Symbol: String
  let poolPairName: String
  let rangePosition: Double // 0.0 - 1.0 for slider position
  let rangeMin: Double // 0.0 - 1.0 for range start
  let rangeMax: Double // 0.0 - 1.0 for range end
  let selectedPositionId: String?
  let walletName: String?
}

// Extension for creating entry from LP position
extension LiquidityPoolEntry {
  init(from position: LPPosition) {
    self.date = Date()
    self.totalValue = position.totalValue
    self.uncollectedFees = position.uncollectedFees
    self.isInRange = position.isInRange
    self.token0Amount = position.token0Amount
    self.token1Amount = position.token1Amount
    self.token0Symbol = position.token0Symbol
    self.token1Symbol = position.token1Symbol
    self.poolPairName = position.poolPairName
    self.rangePosition = position.rangePosition
    self.rangeMin = position.rangeMin
    self.rangeMax = position.rangeMax
    self.selectedPositionId = position.id
    self.walletName = position.walletName
  }

  static var sampleData: LiquidityPoolEntry {
    LiquidityPoolEntry(from: LPPosition.mockPositions[0])
  }
}
