import SwiftUI

struct LiquidityPoolLargeView: View {
  let entry: LiquidityPoolEntry
  @Environment(\.colorScheme) var colorScheme

  var body: some View {
    VStack(alignment: .leading, spacing: WidgetTheme.Spacing.md) {
      // Header with pool pair and range status
      HStack {
        VStack(alignment: .leading, spacing: 2) {
          Text(entry.poolPairName)
            .font(WidgetTheme.Typography.headline)
            .foregroundColor(WidgetTheme.adaptiveOnSurface(colorScheme: colorScheme))
            .bold()

          Text("Liquidity Pool Position")
            .font(WidgetTheme.Typography.caption)
            .foregroundColor(WidgetTheme.adaptiveOnSurface(colorScheme: colorScheme).opacity(0.7))
        }

        Spacer()

        // Range status indicator
        HStack(spacing: 6) {
          Circle()
            .fill(entry.isInRange ? WidgetTheme.Colors.success : WidgetTheme.Colors.warning)
            .frame(width: 10, height: 10)

          Text(entry.isInRange ? "In Range" : "Out of Range")
            .font(WidgetTheme.Typography.body)
            .foregroundColor(entry.isInRange ? WidgetTheme.Colors.success : WidgetTheme.Colors.warning)
            .bold()
        }
      }

      RangeSlider(entry: entry, variant: .large)

      // Prominent Total Value display
      VStack(alignment: .center, spacing: 0) {
        Text("Total Portfolio Value")
          .font(WidgetTheme.Typography.body)
          .foregroundColor(WidgetTheme.adaptiveOnSurface(colorScheme: colorScheme).opacity(0.8))
          .bold()

        Text("$\(FormattingUtils.formatCurrency(entry.totalValue, decimals: 2))")
          .font(.system(size: 38, weight: .bold, design: .rounded))
          .foregroundColor(WidgetTheme.adaptiveOnSurface(colorScheme: colorScheme))
          .minimumScaleFactor(0.8)
          .lineLimit(1)
      }
      .frame(maxWidth: .infinity)
      .padding(.vertical, WidgetTheme.Spacing.sm)

      // Fees in prominent card
      HStack {
        VStack(alignment: .leading, spacing: 2) {
          Text("Uncollected Fees")
            .font(WidgetTheme.Typography.caption)
            .foregroundColor(WidgetTheme.adaptiveOnSurface(colorScheme: colorScheme).opacity(0.7))

          Text("$\(FormattingUtils.formatCurrency(entry.uncollectedFees, decimals: 2))")
            .font(.system(size: 20, weight: .bold))
            .foregroundColor(WidgetTheme.Colors.success)
        }

        Spacer()

        // Add percentage or additional info
        VStack(alignment: .trailing, spacing: 2) {
          Text("APY Est.")
            .font(WidgetTheme.Typography.caption)
            .foregroundColor(WidgetTheme.adaptiveOnSurface(colorScheme: colorScheme).opacity(0.7))

          Text("~12.4%")
            .font(WidgetTheme.Typography.body)
            .foregroundColor(WidgetTheme.Colors.primary)
            .bold()
        }
      }
      .padding(.all, WidgetTheme.Spacing.md)
      .background(WidgetTheme.Colors.success.opacity(0.08))
      .cornerRadius(WidgetTheme.Spacing.sm)

      // Token amounts - enhanced cards
      HStack(spacing: WidgetTheme.Spacing.sm) {
        LargeTokenCard(
          symbol: entry.token0Symbol,
          amount: entry.token0Amount,
          percentage: entry.formattedToken0Percentage,
          color: WidgetTheme.Colors.primary,
          alignment: .leading
        )

        LargeTokenCard(
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

private struct LargeTokenCard: View {
  let symbol: String
  let amount: Double
  let percentage: String
  let color: Color
  let alignment: Alignment

  @Environment(\.colorScheme) var colorScheme

  var body: some View {
    VStack(alignment: alignment == .leading ? .leading : .trailing, spacing: 6) {
      HStack {
        if alignment == .leading {
          Text(symbol)
            .font(WidgetTheme.Typography.body)
            .foregroundColor(color)
            .bold()

          Spacer()

          Text(percentage)
            .font(WidgetTheme.Typography.caption)
            .foregroundColor(WidgetTheme.adaptiveOnSurface(colorScheme: colorScheme).opacity(0.6))
        } else {
          Text(percentage)
            .font(WidgetTheme.Typography.caption)
            .foregroundColor(WidgetTheme.adaptiveOnSurface(colorScheme: colorScheme).opacity(0.6))

          Spacer()

          Text(symbol)
            .font(WidgetTheme.Typography.body)
            .foregroundColor(color)
            .bold()
        }
      }

      Text(FormattingUtils.formatTokenAmount(amount, decimals: alignment == .leading ? 4 : 2))
        .font(.system(size: 18, weight: .bold))
        .foregroundColor(WidgetTheme.adaptiveOnSurface(colorScheme: colorScheme))
        .minimumScaleFactor(0.8)
        .lineLimit(1)
    }
    .padding(.all, WidgetTheme.Spacing.md)
    .background(color.opacity(0.08))
    .cornerRadius(WidgetTheme.Spacing.sm)
    .frame(maxWidth: .infinity)
  }
}
