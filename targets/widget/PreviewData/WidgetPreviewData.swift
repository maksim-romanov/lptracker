import WidgetKit

struct WidgetPreviewData {
  static let inRangeEntry = LiquidityPoolEntry(
    date: .now,
    totalValue: 1234.56,
    uncollectedFees: 12.34,
    isInRange: true,
    token0Amount: 0.5,
    token1Amount: 1850.25,
    token0Symbol: "ETH",
    token1Symbol: "USDC",
    poolPairName: "ETH/USDC",
    rangePosition: 0.6, // In range
    rangeMin: 0.25, // Range from 25%
    rangeMax: 0.75,  // to 75%
    selectedPositionId: "1",
    walletName: "Main Wallet"
  )

  static let outOfRangeLeftEntry = LiquidityPoolEntry(
    date: .now,
    totalValue: 987.32,
    uncollectedFees: 5.67,
    isInRange: false,
    token0Amount: 0.0, // All ETH converted to USDC
    token1Amount: 2100.50,
    token0Symbol: "ETH",
    token1Symbol: "USDC",
    poolPairName: "ETH/USDC",
    rangePosition: 0.1, // Out of range - far left, price went up
    rangeMin: 0.3, // Narrow range from 30%
    rangeMax: 0.6,  // to 60%
    selectedPositionId: "2",
    walletName: "Main Wallet"
  )

  static let outOfRangeRightEntry = LiquidityPoolEntry(
    date: .now,
    totalValue: 892.15,
    uncollectedFees: 2.89,
    isInRange: false,
    token0Amount: 0.78, // All USDC converted to ETH
    token1Amount: 0.0,
    token0Symbol: "ETH",
    token1Symbol: "USDC",
    poolPairName: "ETH/USDC",
    rangePosition: 0.85, // Out of range - far right, price went down
    rangeMin: 0.2, // Wide range from 20%
    rangeMax: 0.8,  // to 80%
    selectedPositionId: "4",
    walletName: "Trading Wallet"
  )

  static let mediumOutOfRangeEntry = LiquidityPoolEntry(
    date: .now,
    totalValue: 987.65,
    uncollectedFees: 5.67,
    isInRange: false,
    token0Amount: 0.0, // All ETH converted to USDC
    token1Amount: 2050.30,
    token0Symbol: "ETH",
    token1Symbol: "USDC",
    poolPairName: "ETH/USDC",
    rangePosition: 0.1, // Out of range - far left, price went up
    rangeMin: 0.4, // Range from 40%
    rangeMax: 0.7,  // to 70%
    selectedPositionId: "2",
    walletName: "Main Wallet"
  )
}
