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
}
