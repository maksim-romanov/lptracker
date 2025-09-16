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
        .font(.system(size: 36, weight: .bold, design: .rounded))
        .foregroundColor(WidgetTheme.adaptiveOnSurface(colorScheme: colorScheme))
        .minimumScaleFactor(0.7)
        .lineLimit(1)
        .frame(maxWidth: .infinity)

      // Token composition centered below total
      HStack(spacing: 6) {
        Text(entry.formattedToken0Percentage)
          .font(.caption2)
          .foregroundColor(WidgetTheme.Colors.primary)
          .bold()
        Text("|")
          .font(.caption2)
          .foregroundColor(WidgetTheme.adaptiveOnSurface(colorScheme: colorScheme).opacity(0.4))
        Text(entry.formattedToken1Percentage)
          .font(.caption2)
          .foregroundColor(WidgetTheme.Colors.secondary)
          .bold()
      }
      .frame(maxWidth: .infinity)

      // Bottom row: Range status (left) and Fees (right)
      HStack(spacing: WidgetTheme.Spacing.xs) {
        HStack(spacing: 3) {
          Text("+$\(FormattingUtils.formatCurrency(entry.uncollectedFees, decimals: 1))")
            .font(.caption2)
            .foregroundColor(WidgetTheme.Colors.success)
            .bold()
            .lineLimit(1)
            .minimumScaleFactor(0.8)
        }
        
        Spacer()

        HStack(spacing: 3) {
          Circle()
            .fill(entry.isInRange ? WidgetTheme.Colors.success : WidgetTheme.Colors.warning)
            .frame(width: 5, height: 5)
          Text(entry.isInRange ? "In Range" : "Out of Range")
            .font(.caption2)
            .foregroundColor(entry.isInRange ? WidgetTheme.Colors.success : WidgetTheme.Colors.warning)
            .lineLimit(1)
            .minimumScaleFactor(0.6)
        }
      }
    }
//    .padding(.all, WidgetTheme.Spacing.xs)
    .containerBackground(WidgetTheme.adaptiveBackground(colorScheme: colorScheme), for: .widget)
  }
}
