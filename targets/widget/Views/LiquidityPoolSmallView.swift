import SwiftUI

struct LiquidityPoolSmallView: View {
  let entry: LiquidityPoolEntry
  @Environment(\.colorScheme) var colorScheme

  var body: some View {
    VStack(spacing: WidgetTheme.Spacing.sm) {
      // Header with pool name and tokens
      VStack(alignment: .leading, spacing: 2) {
        Text(entry.poolPairName)
          .font(.system(size: 16, weight: .bold))
          .foregroundColor(WidgetTheme.adaptiveOnSurface(colorScheme: colorScheme))

        HStack(spacing: 3) {
          Text(entry.token0Symbol)
            .font(.caption2)
            .foregroundColor(WidgetTheme.Colors.primary)
            .bold()
          Text("•")
            .font(.caption2)
            .foregroundColor(WidgetTheme.adaptiveOnSurface(colorScheme: colorScheme).opacity(0.4))
          Text(entry.token1Symbol)
            .font(.caption2)
            .foregroundColor(WidgetTheme.Colors.secondary)
            .bold()
        }
      }
      .frame(maxWidth: .infinity, alignment: .leading)

      // Modern range slider
      RangeSlider(entry: entry)

      // Total Value - hero
      Text("$\(FormattingUtils.formatCurrency(entry.totalValue))")
        .font(.system(size: 28, weight: .bold, design: .rounded))
        .foregroundColor(WidgetTheme.adaptiveOnSurface(colorScheme: colorScheme))
        .minimumScaleFactor(0.7)
        .lineLimit(1)
        .frame(maxWidth: .infinity)

      // Fees - bottom
      HStack {
        Text("Fees")
          .font(.caption2)
          .foregroundColor(WidgetTheme.adaptiveOnSurface(colorScheme: colorScheme).opacity(0.6))

        Spacer()

        Text("$\(FormattingUtils.formatCurrency(entry.uncollectedFees, decimals: 1))")
          .font(.caption)
          .foregroundColor(WidgetTheme.Colors.success)
          .bold()
      }
    }
    .padding(.all, WidgetTheme.Spacing.xs)
    .containerBackground(WidgetTheme.adaptiveBackground(colorScheme: colorScheme), for: .widget)
  }
}
