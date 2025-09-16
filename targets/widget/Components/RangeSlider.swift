import SwiftUI

struct RangeSlider: View {
  enum Variant {
    case small
    case normal
    case large
  }

  let entry: LiquidityPoolEntry
  var variant: Variant = .small
  @Environment(\.colorScheme) var colorScheme

  // Sizing based on variant
  private var trackHeight: CGFloat {
    switch variant { case .small: 6; case .normal: 8; case .large: 12 }
  }
  private var trackCornerRadius: CGFloat {
    switch variant { case .small: 3; case .normal: 4; case .large: 5 }
  }
  private var outerGlowSize: CGFloat {
    switch variant { case .small: 16; case .normal: 24; case .large: 34 }
  }
  private var mainDotSize: CGFloat {
    switch variant { case .small: 12; case .normal: 16; case .large: 20 }
  }
  private var mainDotEndRadius: CGFloat {
    switch variant { case .small: 6; case .normal: 9; case .large: 12 }
  }
  private var outerGlowStartRadius: CGFloat {
    switch variant { case .small: 2; case .normal: 3; case .large: 4 }
  }
  private var outerGlowEndRadius: CGFloat {
    switch variant { case .small: 8; case .normal: 12; case .large: 16 }
  }
  private var verticalPadding: CGFloat {
    switch variant { case .small: 6; case .normal: 8; case .large: 10 }
  }
  private var horizontalClampInset: CGFloat {
    switch variant { case .small: 8; case .normal: 9; case .large: 10 }
  }

  var body: some View {
    ZStack(alignment: .leading) {
      // Background track with gradient
      RoundedRectangle(cornerRadius: trackCornerRadius)
        .fill(
          LinearGradient(
            colors: [
              WidgetTheme.adaptiveOutline(colorScheme: colorScheme).opacity(
                variant == .small ? 0.15 : (variant == .normal ? 0.14 : 0.12)
              ),
              WidgetTheme.adaptiveOutline(colorScheme: colorScheme).opacity(
                variant == .small ? 0.25 : (variant == .normal ? 0.23 : 0.22)
              )
            ],
            startPoint: .top,
            endPoint: .bottom
          )
        )
        .frame(height: trackHeight)

      // Active range indicator with modern gradient - using entry range
      GeometryReader { geometry in
        let rangeWidth = geometry.size.width * (entry.rangeMax - entry.rangeMin)
        let rangeStart = geometry.size.width * entry.rangeMin

        RoundedRectangle(cornerRadius: trackCornerRadius)
          .fill(
            LinearGradient(
              colors: [
                WidgetTheme.Colors.success.opacity(
                  variant == .small ? 0.6 : (variant == .normal ? 0.55 : 0.5)
                ),
                WidgetTheme.Colors.success.opacity(
                  variant == .small ? 0.8 : (variant == .normal ? 0.825 : 0.85)
                ),
                WidgetTheme.Colors.success.opacity(
                  variant == .small ? 0.6 : (variant == .normal ? 0.55 : 0.5)
                )
              ],
              startPoint: .leading,
              endPoint: .trailing
            )
          )
          .frame(width: rangeWidth, height: trackHeight)
          .position(x: rangeStart + rangeWidth/2, y: trackHeight/2)
      }
      .frame(height: trackHeight)

      // Modern position indicator
      GeometryReader { geometry in
        ZStack {
          // Outer glow
          Circle()
            .fill(
              RadialGradient(
                colors: [
                  (entry.isInRange ? WidgetTheme.Colors.success : WidgetTheme.Colors.warning).opacity(
                    variant == .small ? 0.3 : (variant == .normal ? 0.29 : 0.28)
                  ),
                  Color.clear
                ],
                center: .center,
                startRadius: outerGlowStartRadius,
                endRadius: outerGlowEndRadius
              )
            )
            .frame(width: outerGlowSize, height: outerGlowSize)

          // Main indicator
          Circle()
            .fill(
              RadialGradient(
                colors: [
                  (entry.isInRange ? WidgetTheme.Colors.success : WidgetTheme.Colors.warning),
                  (entry.isInRange ? WidgetTheme.Colors.success : WidgetTheme.Colors.warning).opacity(
                    variant == .small ? 0.8 : (variant == .normal ? 0.825 : 0.85)
                  )
                ],
                center: UnitPoint(x: 0.3, y: 0.3),
                startRadius: 1,
                endRadius: mainDotEndRadius
              )
            )
            .frame(width: mainDotSize, height: mainDotSize)
            .overlay(
              Circle()
                .stroke(
                  LinearGradient(
                    colors: [
                      Color.white.opacity(variant == .small ? 0.8 : (variant == .normal ? 0.85 : 0.9)),
                      Color.white.opacity(variant == .small ? 0.3 : (variant == .normal ? 0.275 : 0.25))
                    ],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                  ),
                  lineWidth: 2
                )
            )
            .shadow(
              color: Color.black.opacity(variant == .small ? 0.2 : (variant == .normal ? 0.225 : 0.25)),
              radius: variant == .small ? 2 : (variant == .normal ? 2.5 : 3),
              x: 0, y: 1
            )
        }
        .position(
          x: max(horizontalClampInset, min(geometry.size.width - horizontalClampInset, entry.rangePosition * geometry.size.width)),
          y: trackHeight/2
        )
      }
      .frame(height: trackHeight)
    }
    .padding(.vertical, verticalPadding)
  }
}
