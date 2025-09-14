import WidgetKit
import SwiftUI

struct LiquidityPoolWidgetView: View {
  var entry: LiquidityPoolEntry
  @Environment(\.widgetFamily) var widgetFamily

  var body: some View {
    switch widgetFamily {
    case .systemSmall:
      LiquidityPoolSmallView(entry: entry)
    case .systemMedium:
      LiquidityPoolMediumView(entry: entry)
    case .systemLarge:
      LiquidityPoolLargeView(entry: entry)
    default:
      LiquidityPoolMediumView(entry: entry)
    }
  }
}

struct LiquidityPoolWidget: Widget {
  let kind: String = "LiquidityPoolWidget"

  var body: some WidgetConfiguration {
    StaticConfiguration(kind: kind, provider: LiquidityPoolProvider()) { entry in
      LiquidityPoolWidgetView(entry: entry)
    }
    .configurationDisplayName("Liquidity Pool")
    .description("Monitor your liquidity pool position and fees.")
    .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
  }
}

#Preview(as: .systemSmall) {
  LiquidityPoolWidget()
} timeline: {
  WidgetPreviewData.inRangeEntry
  WidgetPreviewData.outOfRangeLeftEntry
}

#Preview(as: .systemMedium) {
  LiquidityPoolWidget()
} timeline: {
  WidgetPreviewData.inRangeEntry
  WidgetPreviewData.mediumOutOfRangeEntry
}

#Preview(as: .systemLarge) {
  LiquidityPoolWidget()
} timeline: {
  WidgetPreviewData.inRangeEntry
  WidgetPreviewData.outOfRangeRightEntry
}
