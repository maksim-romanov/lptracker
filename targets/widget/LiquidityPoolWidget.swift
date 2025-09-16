import WidgetKit
import SwiftUI
import AppIntents

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
    return AppIntentConfiguration(
      kind: kind,
      intent: SelectLPPositionIntent.self,
      provider: ConfigurableLiquidityPoolProvider()
    ) { entry in
      LiquidityPoolWidgetView(entry: entry.entry)
    }
    .configurationDisplayName("Liquidity Pool")
    .description("Monitor your selected liquidity pool position and fees.")
    .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
  }
}

#Preview(as: .systemSmall) {
  LiquidityPoolWidget()
} timeline: {
  WidgetPreviewData.configInRangeEntry
  WidgetPreviewData.configOutOfRangeLeftEntry
}

#Preview(as: .systemMedium) {
  LiquidityPoolWidget()
} timeline: {
  WidgetPreviewData.configInRangeEntry
  WidgetPreviewData.configMediumOutOfRangeEntry
}

#Preview(as: .systemLarge) {
  LiquidityPoolWidget()
} timeline: {
  WidgetPreviewData.configInRangeEntry
  WidgetPreviewData.configOutOfRangeRightEntry
}
