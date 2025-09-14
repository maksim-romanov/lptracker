import WidgetKit
import SwiftUI

struct LiquidityPoolEntry: TimelineEntry {
    let date: Date
    let totalValue: Double
    let uncollectedFees: Double
    let isInRange: Bool
    let token0Amount: Double
    let token1Amount: Double
    let token0Symbol: String
    let token1Symbol: String
    let poolPairName: String
    let rangePosition: Double // 0.0 - 1.0 for slider position
}

struct LiquidityPoolProvider: TimelineProvider {
    func placeholder(in context: Context) -> LiquidityPoolEntry {
        LiquidityPoolEntry(
            date: Date(),
            totalValue: 1234.56,
            uncollectedFees: 12.34,
            isInRange: true,
            token0Amount: 0.5,
            token1Amount: 1850.25,
            token0Symbol: "ETH",
            token1Symbol: "USDC",
            poolPairName: "ETH/USDC",
            rangePosition: 0.6
        )
    }

    func getSnapshot(in context: Context, completion: @escaping (LiquidityPoolEntry) -> ()) {
        let entry = LiquidityPoolEntry(
            date: Date(),
            totalValue: 1234.56,
            uncollectedFees: 12.34,
            isInRange: true,
            token0Amount: 0.5,
            token1Amount: 1850.25,
            token0Symbol: "ETH",
            token1Symbol: "USDC",
            poolPairName: "ETH/USDC",
            rangePosition: 0.6
        )
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<LiquidityPoolEntry>) -> ()) {
        var entries: [LiquidityPoolEntry] = []

        // Mock data - в реальном приложении здесь будет запрос к API
        let currentDate = Date()
        for hourOffset in 0..<5 {
            let entryDate = Calendar.current.date(byAdding: .hour, value: hourOffset, to: currentDate)!
            let rangePos = 0.2 + Double(hourOffset) * 0.15 // Moves from 0.2 to 0.8
            let entry = LiquidityPoolEntry(
                date: entryDate,
                totalValue: 1234.56 + Double(hourOffset) * 10,
                uncollectedFees: 12.34 + Double(hourOffset) * 0.5,
                isInRange: rangePos >= 0.25 && rangePos <= 0.75, // In range between 0.25-0.75
                token0Amount: 0.5 + Double(hourOffset) * 0.01,
                token1Amount: 1850.25 + Double(hourOffset) * 5,
                token0Symbol: "ETH",
                token1Symbol: "USDC",
                poolPairName: "ETH/USDC",
                rangePosition: rangePos
            )
            entries.append(entry)
        }

        let timeline = Timeline(entries: entries, policy: .atEnd)
        completion(timeline)
    }
}


struct LiquidityPoolWidgetView: View {
    var entry: LiquidityPoolEntry
    @Environment(\.colorScheme) var colorScheme

    var body: some View {
        VStack(alignment: .leading, spacing: WidgetTheme.Spacing.xs) {
            // Header with pool pair and range status - minimalist
            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    Text(entry.poolPairName)
                        .font(WidgetTheme.Typography.title)
                        .foregroundColor(WidgetTheme.adaptiveOnSurface(colorScheme: colorScheme))
                        .bold()

                    Text("Pool Position")
                        .font(WidgetTheme.Typography.caption)
                        .foregroundColor(WidgetTheme.adaptiveOnSurface(colorScheme: colorScheme).opacity(0.7))
                }

                Spacer()

                // Range status indicator
                HStack(spacing: 4) {
                    Circle()
                        .fill(entry.isInRange ? WidgetTheme.Colors.success : WidgetTheme.Colors.warning)
                        .frame(width: 8, height: 8)

                    Text(entry.isInRange ? "In Range" : "Out of Range")
                        .font(WidgetTheme.Typography.caption)
                        .foregroundColor(entry.isInRange ? WidgetTheme.Colors.success : WidgetTheme.Colors.warning)
                        .bold()
                }
            }

            // Range position slider
            ZStack(alignment: .leading) {
                // Background track
                RoundedRectangle(cornerRadius: 1)
                    .fill(WidgetTheme.adaptiveOutline(colorScheme: colorScheme).opacity(0.3))
                    .frame(height: 2)

                // Active range area (center portion - where position should be)
                RoundedRectangle(cornerRadius: 1)
                    .fill(WidgetTheme.Colors.success.opacity(0.4))
                    .frame(height: 2)
                    .scaleEffect(x: 0.5, anchor: .center) // Middle 50% is the "in range" area

                // Position indicator
                GeometryReader { geometry in
                    Circle()
                        .fill(entry.isInRange ? WidgetTheme.Colors.success : WidgetTheme.Colors.warning)
                        .frame(width: 8, height: 8)
                        .overlay(
                            Circle()
                                .stroke(WidgetTheme.Colors.primary, lineWidth: 1.5)
                        )
                        .position(
                            x: max(4, min(geometry.size.width - 4, entry.rangePosition * geometry.size.width)),
                            y: 1 // Center on the track
                        )
                }
                .frame(height: 2)
            }
            .padding(.vertical, 3) // Add some padding so the circle doesn't get clipped

            // Total value and fees - more compact
            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    Text("Total Value")
                        .font(WidgetTheme.Typography.caption)
                        .foregroundColor(WidgetTheme.adaptiveOnSurface(colorScheme: colorScheme).opacity(0.7))

                    HStack(spacing: 3) {
                        Text("$\(String(format: "%.2f", entry.totalValue))")
                            .font(WidgetTheme.Typography.title)
                            .foregroundColor(WidgetTheme.adaptiveOnSurface(colorScheme: colorScheme))
                            .bold()

                        // Small pink accent
                        // Rectangle()
                        //     .fill(WidgetTheme.Colors.primary)
                        //     .frame(width: 2, height: 14)
                    }
                }

                Spacer()

                VStack(alignment: .trailing, spacing: 2) {
                    Text("Uncollected Fees")
                        .font(WidgetTheme.Typography.caption)
                        .foregroundColor(WidgetTheme.adaptiveOnSurface(colorScheme: colorScheme).opacity(0.7))

                    Text("$\(String(format: "%.2f", entry.uncollectedFees))")
                        .font(WidgetTheme.Typography.title)
                        .foregroundColor(WidgetTheme.Colors.success)
                        .bold()
                }
            }

            // Token amounts - more compact layout
            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    Text(entry.token0Symbol)
                        .font(WidgetTheme.Typography.caption)
                        .foregroundColor(WidgetTheme.Colors.primary)
                        .bold()

                    Text(String(format: "%.4f", entry.token0Amount))
                        .font(WidgetTheme.Typography.body)
                        .foregroundColor(WidgetTheme.adaptiveOnSurface(colorScheme: colorScheme))
                        .bold()
                }
                .padding(.horizontal, WidgetTheme.Spacing.xs)
                .padding(.vertical, WidgetTheme.Spacing.xs)
                .background(WidgetTheme.Colors.primary.opacity(0.08))
                .cornerRadius(WidgetTheme.Spacing.xs)

                Spacer()

                VStack(alignment: .trailing, spacing: 2) {
                    Text(entry.token1Symbol)
                        .font(WidgetTheme.Typography.caption)
                        .foregroundColor(WidgetTheme.Colors.secondary)
                        .bold()

                    Text(String(format: "%.2f", entry.token1Amount))
                        .font(WidgetTheme.Typography.body)
                        .foregroundColor(WidgetTheme.adaptiveOnSurface(colorScheme: colorScheme))
                        .bold()
                }
                .padding(.horizontal, WidgetTheme.Spacing.xs)
                .padding(.vertical, WidgetTheme.Spacing.xs)
                .background(WidgetTheme.Colors.secondary.opacity(0.08))
                .cornerRadius(WidgetTheme.Spacing.xs)
            }

        }
        .padding(.vertical, WidgetTheme.Spacing.md)
        .padding(.horizontal, WidgetTheme.Spacing.md) // Reduced padding for tighter layout
        .background(WidgetTheme.adaptiveSurface(colorScheme: colorScheme))
        .containerBackground(WidgetTheme.adaptiveSurface(colorScheme: colorScheme), for: .widget)
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
        .supportedFamilies([.systemMedium, .systemLarge])
    }
}

#Preview(as: .systemMedium) {
    LiquidityPoolWidget()
} timeline: {
    LiquidityPoolEntry(
        date: .now,
        totalValue: 1234.56,
        uncollectedFees: 12.34,
        isInRange: true,
        token0Amount: 0.5,
        token1Amount: 1850.25,
        token0Symbol: "ETH",
        token1Symbol: "USDC",
        poolPairName: "ETH/USDC",
        rangePosition: 0.6 // In range
    )
    LiquidityPoolEntry(
        date: .now,
        totalValue: 987.65,
        uncollectedFees: 5.67,
        isInRange: false,
        token0Amount: 0.3,
        token1Amount: 1200.50,
        token0Symbol: "ETH",
        token1Symbol: "USDC",
        poolPairName: "ETH/USDC",
        rangePosition: 0.1 // Out of range - far left
    )
}
