import SwiftUI

struct LiquidityPoolMediumView: View {
  let entry: LiquidityPoolEntry
  @Environment(\.colorScheme) var colorScheme

  var body: some View {
    VStack(alignment: .leading, spacing: WidgetTheme.Spacing.sm) {
      // Header with pool pair and range status
      HStack {
        Text(entry.poolPairName)
          .font(WidgetTheme.Typography.headline)
          .foregroundColor(WidgetTheme.adaptiveOnSurface(colorScheme: colorScheme))
          .bold()

        Spacer()

        // Range status indicator
        HStack(spacing: WidgetTheme.Spacing.sm) {
          Circle()
            .fill(entry.isInRange ? WidgetTheme.Colors.success : WidgetTheme.Colors.warning)
            .frame(width: 8, height: 8)

          Text(entry.isInRange ? "In Range" : "Out of Range")
            .font(.caption)
            .foregroundColor(entry.isInRange ? WidgetTheme.Colors.success : WidgetTheme.Colors.warning)
            .bold()
        }
      }

      RangeSlider(entry: entry, variant: .normal)

      // Total Value and Fees on one row
      HStack(alignment: .top, spacing: WidgetTheme.Spacing.md) {
        // Left: Total Value
        VStack(alignment: .leading, spacing: 2) {
          Text("Total Value")
            .font(.caption)
            .foregroundColor(WidgetTheme.adaptiveOnSurface(colorScheme: colorScheme).opacity(0.8))
            .bold()

          Text("$\(FormattingUtils.formatCurrency(entry.totalValue))")
            .font(.system(size: 20, weight: .bold, design: .rounded))
            .foregroundColor(WidgetTheme.adaptiveOnSurface(colorScheme: colorScheme))
            .minimumScaleFactor(0.7)
            .lineLimit(1)
        }
        .frame(maxWidth: .infinity, alignment: .leading)

        // Right: Fees
        VStack(alignment: .trailing, spacing: 2) {
          Text("Uncollected Fees")
            .font(.caption)
            .foregroundColor(WidgetTheme.adaptiveOnSurface(colorScheme: colorScheme).opacity(0.7))

          Text("$\(FormattingUtils.formatCurrency(entry.uncollectedFees, decimals: 1))")
            .font(.system(size: 16, weight: .bold))
            .foregroundColor(WidgetTheme.Colors.success)
        }
      }

      // Token amounts - enhanced cards
      HStack(spacing: WidgetTheme.Spacing.sm) {
        TokenCard(
          symbol: entry.token0Symbol,
          amount: entry.token0Amount,
          percentage: entry.formattedToken0Percentage,
          color: WidgetTheme.Colors.primary,
          alignment: .leading
        )

        TokenCard(
          symbol: entry.token1Symbol,
          amount: entry.token1Amount,
          percentage: entry.formattedToken1Percentage,
          color: WidgetTheme.Colors.secondary,
          alignment: .trailing
        )
      }
    }
    .containerBackground(WidgetTheme.adaptiveBackground(colorScheme: colorScheme), for: .widget)
  }
}

private struct TokenCard: View {
  let symbol: String
  let amount: Double
  let percentage: String
  let color: Color
  let alignment: Alignment

  @Environment(\.colorScheme) var colorScheme

  var body: some View {
    VStack(alignment: alignment == .leading ? .leading : .trailing, spacing: 4) {
      HStack {
        if alignment == .leading {
          Text(symbol)
            .font(.caption)
            .foregroundColor(color)
            .bold()

          Spacer()

          Text(percentage)
            .font(.caption2)
            .foregroundColor(WidgetTheme.adaptiveOnSurface(colorScheme: colorScheme).opacity(0.6))
        } else {
          Text(percentage)
            .font(.caption2)
            .foregroundColor(WidgetTheme.adaptiveOnSurface(colorScheme: colorScheme).opacity(0.6))

          Spacer()

          Text(symbol)
            .font(.caption)
            .foregroundColor(color)
            .bold()
        }
      }

      Text(FormattingUtils.formatTokenAmount(amount, decimals: alignment == .leading ? 4 : 2))
        .font(.system(size: 14, weight: .bold))
        .foregroundColor(WidgetTheme.adaptiveOnSurface(colorScheme: colorScheme))
        .minimumScaleFactor(0.8)
        .lineLimit(1)
    }
    .padding(.all, WidgetTheme.Spacing.sm)
    .background(color.opacity(0.08))
    .cornerRadius(WidgetTheme.Spacing.xs)
    .frame(maxWidth: .infinity)
  }
}
