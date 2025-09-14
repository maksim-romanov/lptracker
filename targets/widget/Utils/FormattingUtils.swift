import Foundation

struct FormattingUtils {
  static func formatCurrency(_ value: Double, decimals: Int = 0) -> String {
    return String(format: "%.\(decimals)f", value)
  }

  static func formatTokenAmount(_ amount: Double, decimals: Int = 4) -> String {
    return String(format: "%.\(decimals)f", amount)
  }

  static func formatPercentage(_ percentage: Double) -> String {
    if percentage < 1 && percentage > 0 {
      return "<1%"
    } else if percentage == 0 {
      return "0%"
    } else {
      return String(format: "%.0f%%", percentage)
    }
  }
}

extension LiquidityPoolEntry {
  var token0Percentage: Double {
    let totalUSDValue = totalValue
    if totalUSDValue == 0 { return 0 }

    // Rough estimation: assume token0Amount * current price vs token1Amount
    // For simplicity, we'll calculate based on amounts assuming ETH ~$2000-3000
    let estimatedToken0Value = token0Amount * 2500 // Rough ETH price
    let estimatedToken1Value = token1Amount // USDC is ~$1
    let totalEstimated = estimatedToken0Value + estimatedToken1Value

    if totalEstimated == 0 { return 0 }
    return (estimatedToken0Value / totalEstimated) * 100
  }

  var token1Percentage: Double {
    return 100 - token0Percentage
  }

  var formattedToken0Percentage: String {
    return FormattingUtils.formatPercentage(token0Percentage)
  }

  var formattedToken1Percentage: String {
    return FormattingUtils.formatPercentage(token1Percentage)
  }

}
