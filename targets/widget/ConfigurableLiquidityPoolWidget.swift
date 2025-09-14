import WidgetKit
import SwiftUI
import AppIntents

@available(iOS 16.0, *)
struct ConfigurableLiquidityPoolWidget: Widget {
  let kind: String = "ConfigurableLiquidityPoolWidget"

  var body: some WidgetConfiguration {
    AppIntentConfiguration(
      kind: kind,
      intent: SelectLPPositionIntent.self,
      provider: ConfigurableLiquidityPoolProvider()
    ) { entry in
      LiquidityPoolWidgetView(entry: entry.entry)
    }
    .configurationDisplayName("LP Position Tracker")
    .description("Track your selected liquidity pool position and fees.")
    .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
  }
}

@available(iOS 16.0, *)
struct ConfigurableLiquidityPoolEntry: TimelineEntry {
  let date: Date
  let entry: LiquidityPoolEntry
  let configuration: SelectLPPositionIntent
}

@available(iOS 16.0, *)
struct ConfigurableLiquidityPoolProvider: AppIntentTimelineProvider {
  func placeholder(in context: Context) -> ConfigurableLiquidityPoolEntry {
    ConfigurableLiquidityPoolEntry(
      date: Date(),
      entry: LiquidityPoolEntry.sampleData,
      configuration: SelectLPPositionIntent()
    )
  }

  func snapshot(for configuration: SelectLPPositionIntent, in context: Context) async -> ConfigurableLiquidityPoolEntry {
    let selectedPosition = getSelectedPosition(from: configuration)
    return ConfigurableLiquidityPoolEntry(
      date: Date(),
      entry: LiquidityPoolEntry(from: selectedPosition),
      configuration: configuration
    )
  }

  func timeline(for configuration: SelectLPPositionIntent, in context: Context) async -> Timeline<ConfigurableLiquidityPoolEntry> {
    let selectedPosition = getSelectedPosition(from: configuration)
    var entries: [ConfigurableLiquidityPoolEntry] = []

    let currentDate = Date()
    for hourOffset in 0..<5 {
      let entryDate = Calendar.current.date(byAdding: .hour, value: hourOffset, to: currentDate)!
      let rangePos = selectedPosition.rangePosition + Double(hourOffset) * 0.05

      let liquidityPoolEntry = LiquidityPoolEntry(
        date: entryDate,
        totalValue: selectedPosition.totalValue + Double(hourOffset) * 10,
        uncollectedFees: selectedPosition.uncollectedFees + Double(hourOffset) * 0.5,
        isInRange: rangePos >= selectedPosition.rangeMin && rangePos <= selectedPosition.rangeMax,
        token0Amount: selectedPosition.token0Amount + Double(hourOffset) * 0.01,
        token1Amount: selectedPosition.token1Amount + Double(hourOffset) * 5,
        token0Symbol: selectedPosition.token0Symbol,
        token1Symbol: selectedPosition.token1Symbol,
        poolPairName: selectedPosition.poolPairName,
        rangePosition: rangePos,
        rangeMin: selectedPosition.rangeMin,
        rangeMax: selectedPosition.rangeMax,
        selectedPositionId: selectedPosition.id,
        walletName: selectedPosition.walletName
      )

      let entry = ConfigurableLiquidityPoolEntry(
        date: entryDate,
        entry: liquidityPoolEntry,
        configuration: configuration
      )
      entries.append(entry)
    }

    return Timeline(entries: entries, policy: .atEnd)
  }

  private func getSelectedPosition(from configuration: SelectLPPositionIntent) -> LPPosition {
    if let positionId = configuration.position?.id {
      return LPPosition.mockPositions.first { $0.id == positionId } ?? LPPosition.mockPositions[0]
    }
    return LPPosition.mockPositions[0]
  }
}