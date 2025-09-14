import WidgetKit

struct LPPosition: Codable, Identifiable {
  let id: String
  let walletAddress: String
  let walletName: String
  let poolPairName: String
  let token0Symbol: String
  let token1Symbol: String
  let totalValue: Double
  let uncollectedFees: Double
  let isInRange: Bool
  let token0Amount: Double
  let token1Amount: Double
  let rangePosition: Double
  let rangeMin: Double
  let rangeMax: Double
}

// Extension for sample data
extension LPPosition {
  static var mockPositions: [LPPosition] {
    [
      LPPosition(
        id: "1",
        walletAddress: "0x1234...5678",
        walletName: "Main Wallet",
        poolPairName: "ETH/USDC",
        token0Symbol: "ETH",
        token1Symbol: "USDC",
        totalValue: 1234.56,
        uncollectedFees: 12.34,
        isInRange: true,
        token0Amount: 0.5,
        token1Amount: 1850.25,
        rangePosition: 0.6,
        rangeMin: 0.25,
        rangeMax: 0.75
      ),
      LPPosition(
        id: "2",
        walletAddress: "0x1234...5678",
        walletName: "Main Wallet",
        poolPairName: "WBTC/ETH",
        token0Symbol: "WBTC",
        token1Symbol: "ETH",
        totalValue: 2567.89,
        uncollectedFees: 23.45,
        isInRange: false,
        token0Amount: 0.08,
        token1Amount: 1.2,
        rangePosition: 0.15,
        rangeMin: 0.3,
        rangeMax: 0.7
      ),
      LPPosition(
        id: "3",
        walletAddress: "0x9876...4321",
        walletName: "Trading Wallet",
        poolPairName: "USDC/DAI",
        token0Symbol: "USDC",
        token1Symbol: "DAI",
        totalValue: 5678.90,
        uncollectedFees: 45.67,
        isInRange: true,
        token0Amount: 2834.45,
        token1Amount: 2844.45,
        rangePosition: 0.5,
        rangeMin: 0.4,
        rangeMax: 0.6
      ),
      LPPosition(
        id: "4",
        walletAddress: "0x9876...4321",
        walletName: "Trading Wallet",
        poolPairName: "UNI/ETH",
        token0Symbol: "UNI",
        token1Symbol: "ETH",
        totalValue: 890.12,
        uncollectedFees: 8.90,
        isInRange: false,
        token0Amount: 150.0,
        token1Amount: 0.25,
        rangePosition: 0.85,
        rangeMin: 0.2,
        rangeMax: 0.8
      )
    ]
  }
}