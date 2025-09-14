import WidgetKit

struct LiquidityPoolProvider: TimelineProvider {
  func placeholder(in context: Context) -> LiquidityPoolEntry {
    LiquidityPoolEntry.sampleData
  }

  func getSnapshot(in context: Context, completion: @escaping (LiquidityPoolEntry) -> ()) {
    completion(LiquidityPoolEntry.sampleData)
  }

  func getTimeline(in context: Context, completion: @escaping (Timeline<LiquidityPoolEntry>) -> ()) {
    var entries: [LiquidityPoolEntry] = []

    // Mock data - в реальном приложении здесь будет запрос к API
    let currentDate = Date()
    for hourOffset in 0..<5 {
      let entryDate = Calendar.current.date(byAdding: .hour, value: hourOffset, to: currentDate)!
      let rangePos = 0.2 + Double(hourOffset) * 0.15 // Moves from 0.2 to 0.8
      let rangeMin = 0.25 // Range starts at 25%
      let rangeMax = 0.75 // Range ends at 75%
      let entry = LiquidityPoolEntry(
        date: entryDate,
        totalValue: 1234.56 + Double(hourOffset) * 10,
        uncollectedFees: 12.34 + Double(hourOffset) * 0.5,
        isInRange: rangePos >= rangeMin && rangePos <= rangeMax,
        token0Amount: 0.5 + Double(hourOffset) * 0.01,
        token1Amount: 1850.25 + Double(hourOffset) * 5,
        token0Symbol: "ETH",
        token1Symbol: "USDC",
        poolPairName: "ETH/USDC",
        rangePosition: rangePos,
        rangeMin: rangeMin,
        rangeMax: rangeMax
      )
      entries.append(entry)
    }

    let timeline = Timeline(entries: entries, policy: .atEnd)
    completion(timeline)
  }
}
