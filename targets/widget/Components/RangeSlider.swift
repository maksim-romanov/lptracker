import SwiftUI

struct RangeSlider: View {
  let entry: LiquidityPoolEntry
  @Environment(\.colorScheme) var colorScheme

  var body: some View {
    ZStack(alignment: .leading) {
      // Background track with gradient
      RoundedRectangle(cornerRadius: 3)
        .fill(
          LinearGradient(
            colors: [
              WidgetTheme.adaptiveOutline(colorScheme: colorScheme).opacity(0.15),
              WidgetTheme.adaptiveOutline(colorScheme: colorScheme).opacity(0.25)
            ],
            startPoint: .top,
            endPoint: .bottom
          )
        )
        .frame(height: 6)

      // Active range indicator with modern gradient - using entry range
      GeometryReader { geometry in
        let rangeWidth = geometry.size.width * (entry.rangeMax - entry.rangeMin)
        let rangeStart = geometry.size.width * entry.rangeMin

        RoundedRectangle(cornerRadius: 3)
          .fill(
            LinearGradient(
              colors: [
                WidgetTheme.Colors.success.opacity(0.6),
                WidgetTheme.Colors.success.opacity(0.8),
                WidgetTheme.Colors.success.opacity(0.6)
              ],
              startPoint: .leading,
              endPoint: .trailing
            )
          )
          .frame(width: rangeWidth, height: 6)
          .position(x: rangeStart + rangeWidth/2, y: 3)
      }
      .frame(height: 6)

      // Modern position indicator
      GeometryReader { geometry in
        ZStack {
          // Outer glow
          Circle()
            .fill(
              RadialGradient(
                colors: [
                  (entry.isInRange ? WidgetTheme.Colors.success : WidgetTheme.Colors.warning).opacity(0.3),
                  Color.clear
                ],
                center: .center,
                startRadius: 2,
                endRadius: 8
              )
            )
            .frame(width: 16, height: 16)

          // Main indicator
          Circle()
            .fill(
              RadialGradient(
                colors: [
                  (entry.isInRange ? WidgetTheme.Colors.success : WidgetTheme.Colors.warning),
                  (entry.isInRange ? WidgetTheme.Colors.success : WidgetTheme.Colors.warning).opacity(0.8)
                ],
                center: UnitPoint(x: 0.3, y: 0.3),
                startRadius: 1,
                endRadius: 6
              )
            )
            .frame(width: 12, height: 12)
            .overlay(
              Circle()
                .stroke(
                  LinearGradient(
                    colors: [
                      Color.white.opacity(0.8),
                      Color.white.opacity(0.3)
                    ],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                  ),
                  lineWidth: 2
                )
            )
            .shadow(color: Color.black.opacity(0.2), radius: 2, x: 0, y: 1)
        }
        .position(
          x: max(8, min(geometry.size.width - 8, entry.rangePosition * geometry.size.width)),
          y: 3
        )
      }
      .frame(height: 6)
    }
    .padding(.vertical, 6)
  }
}
