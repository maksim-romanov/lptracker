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

    // Get selected position from app group or use default
    let selectedPosition = getSelectedLPPosition()

    // Mock data - в реальном приложении здесь будет запрос к API
    let currentDate = Date()
    for hourOffset in 0..<5 {
      let entryDate = Calendar.current.date(byAdding: .hour, value: hourOffset, to: currentDate)!
      let rangePos = selectedPosition.rangePosition + Double(hourOffset) * 0.05 // Small variations
      let entry = LiquidityPoolEntry(
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
      entries.append(entry)
    }

    let timeline = Timeline(entries: entries, policy: .atEnd)
    completion(timeline)
  }

  private func getSelectedLPPosition() -> LPPosition {
    // В будущем здесь будет чтение из App Group
    // let userDefaults = UserDefaults(suiteName: "group.your.app.identifier")
    // let selectedPositionId = userDefaults?.string(forKey: "selectedLPPositionId")

    // Пока используем моковые данные - возвращаем первую позицию по умолчанию
    return LPPosition.mockPositions.first ?? LPPosition.mockPositions[0]
  }
}
