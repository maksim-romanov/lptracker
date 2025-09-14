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
    @Environment(\.widgetFamily) var widgetFamily

    var body: some View {
        switch widgetFamily {
        case .systemSmall:
            smallWidgetLayout
        case .systemMedium:
            mediumWidgetLayout
        case .systemLarge:
            largeWidgetLayout
        default:
            mediumWidgetLayout
        }
    }

    // Small widget layout (compact but styled)
    private var smallWidgetLayout: some View {
        VStack(alignment: .leading, spacing: WidgetTheme.Spacing.xs) {
            // Header - compact but styled
            VStack(alignment: .leading, spacing: 1) {
                Text(entry.poolPairName)
                    .font(WidgetTheme.Typography.title)
                    .foregroundColor(WidgetTheme.adaptiveOnSurface(colorScheme: colorScheme))
                    .bold()

                HStack(spacing: 4) {
                    Circle()
                        .fill(entry.isInRange ? WidgetTheme.Colors.success : WidgetTheme.Colors.warning)
                        .frame(width: 6, height: 6)

                    Text(entry.isInRange ? "In Range" : "Out of Range")
                        .font(.caption2)
                        .foregroundColor(entry.isInRange ? WidgetTheme.Colors.success : WidgetTheme.Colors.warning)
                        .bold()
                }
            }

            // Range slider - enhanced
            ZStack(alignment: .leading) {
                RoundedRectangle(cornerRadius: 1.5)
                    .fill(WidgetTheme.adaptiveOutline(colorScheme: colorScheme).opacity(0.3))
                    .frame(height: 3)

                RoundedRectangle(cornerRadius: 1.5)
                    .fill(WidgetTheme.Colors.success.opacity(0.4))
                    .frame(height: 3)
                    .scaleEffect(x: 0.5, anchor: .center)

                GeometryReader { geometry in
                    Circle()
                        .fill(entry.isInRange ? WidgetTheme.Colors.success : WidgetTheme.Colors.warning)
                        .frame(width: 8, height: 8)
                        .overlay(
                            Circle()
                                .stroke(WidgetTheme.Colors.primary, lineWidth: 1.5)
                        )
                        .shadow(color: .black.opacity(0.1), radius: 1, x: 0, y: 0.5)
                        .position(
                            x: max(4, min(geometry.size.width - 4, entry.rangePosition * geometry.size.width)),
                            y: 1.5
                        )
                }
                .frame(height: 3)
            }
            .padding(.vertical, 3)

            Spacer()

            // Prominent Total Value
            VStack(alignment: .center, spacing: 2) {
                Text("Total Value")
                    .font(.caption)
                    .foregroundColor(WidgetTheme.adaptiveOnSurface(colorScheme: colorScheme).opacity(0.8))
                    .bold()

                Text("$\(String(format: "%.0f", entry.totalValue))")
                    .font(.system(size: 22, weight: .bold, design: .rounded))
                    .foregroundColor(WidgetTheme.adaptiveOnSurface(colorScheme: colorScheme))
                    .minimumScaleFactor(0.8)
                    .lineLimit(1)
            }
            .frame(maxWidth: .infinity)

            // Fees card
            HStack {
                VStack(alignment: .leading, spacing: 1) {
                    Text("Fees")
                        .font(.caption2)
                        .foregroundColor(WidgetTheme.adaptiveOnSurface(colorScheme: colorScheme).opacity(0.7))

                    Text("$\(String(format: "%.1f", entry.uncollectedFees))")
                        .font(.system(size: 14, weight: .bold))
                        .foregroundColor(WidgetTheme.Colors.success)
                }

                Spacer()

                VStack(alignment: .trailing, spacing: 1) {
                    Text("APY")
                        .font(.caption2)
                        .foregroundColor(WidgetTheme.adaptiveOnSurface(colorScheme: colorScheme).opacity(0.7))

                    Text("~12%")
                        .font(.caption)
                        .foregroundColor(WidgetTheme.Colors.primary)
                        .bold()
                }
            }
            .padding(.all, WidgetTheme.Spacing.xs)
            .background(WidgetTheme.Colors.success.opacity(0.08))
            .cornerRadius(WidgetTheme.Spacing.xs)
        }
        .padding(.vertical, WidgetTheme.Spacing.sm)
        .padding(.horizontal, WidgetTheme.Spacing.sm)
        .background(WidgetTheme.adaptiveSurface(colorScheme: colorScheme))
        .containerBackground(WidgetTheme.adaptiveSurface(colorScheme: colorScheme), for: .widget)
    }

    // Medium widget layout (styled like large widget)
    private var mediumWidgetLayout: some View {
        VStack(alignment: .leading, spacing: WidgetTheme.Spacing.sm) {
            // Header with pool pair and range status
            HStack {
                Text(entry.poolPairName)
                    .font(WidgetTheme.Typography.headline)
                    .foregroundColor(WidgetTheme.adaptiveOnSurface(colorScheme: colorScheme))
                    .bold()

                Spacer()

                // Range status indicator
                HStack(spacing: 4) {
                    Circle()
                        .fill(entry.isInRange ? WidgetTheme.Colors.success : WidgetTheme.Colors.warning)
                        .frame(width: 8, height: 8)

                    Text(entry.isInRange ? "In Range" : "Out of Range")
                        .font(.caption)
                        .foregroundColor(entry.isInRange ? WidgetTheme.Colors.success : WidgetTheme.Colors.warning)
                        .bold()
                }
            }

            // Range position slider
            ZStack(alignment: .leading) {
                RoundedRectangle(cornerRadius: 2)
                    .fill(WidgetTheme.adaptiveOutline(colorScheme: colorScheme).opacity(0.3))
                    .frame(height: 4)

                RoundedRectangle(cornerRadius: 2)
                    .fill(WidgetTheme.Colors.success.opacity(0.4))
                    .frame(height: 4)
                    .scaleEffect(x: 0.5, anchor: .center)

                GeometryReader { geometry in
                    Circle()
                        .fill(entry.isInRange ? WidgetTheme.Colors.success : WidgetTheme.Colors.warning)
                        .frame(width: 10, height: 10)
                        .overlay(
                            Circle()
                                .stroke(WidgetTheme.Colors.primary, lineWidth: 1.5)
                        )
                        .shadow(color: .black.opacity(0.1), radius: 1, x: 0, y: 0.5)
                        .position(
                            x: max(5, min(geometry.size.width - 5, entry.rangePosition * geometry.size.width)),
                            y: 2
                        )
                }
                .frame(height: 4)
            }
            .padding(.vertical, 4)

            // Total Value and Fees on one row
            HStack(alignment: .top, spacing: WidgetTheme.Spacing.md) {
                // Left: Total Value
                VStack(alignment: .leading, spacing: 2) {
                    Text("Total Value")
                        .font(.caption)
                        .foregroundColor(WidgetTheme.adaptiveOnSurface(colorScheme: colorScheme).opacity(0.8))
                        .bold()

                    Text("$\(String(format: "%.0f", entry.totalValue))")
                        .font(.system(size: 20, weight: .bold, design: .rounded))
                        .foregroundColor(WidgetTheme.adaptiveOnSurface(colorScheme: colorScheme))
                        .minimumScaleFactor(0.7)
                        .lineLimit(1)
                }
                .frame(maxWidth: .infinity, alignment: .leading)

                // Right: Fees
                VStack(alignment: .trailing, spacing: 2) {
                    Text("Uncollected Fees")
                        .font(.caption)
                        .foregroundColor(WidgetTheme.adaptiveOnSurface(colorScheme: colorScheme).opacity(0.7))

                    Text("$\(String(format: "%.1f", entry.uncollectedFees))")
                        .font(.system(size: 16, weight: .bold))
                        .foregroundColor(WidgetTheme.Colors.success)
                }
            }

            // Token amounts - enhanced cards
            HStack(spacing: WidgetTheme.Spacing.sm) {
                VStack(alignment: .leading, spacing: 4) {
                    HStack {
                        Text(entry.token0Symbol)
                            .font(.caption)
                            .foregroundColor(WidgetTheme.Colors.primary)
                            .bold()

                        Spacer()

                        Text("50.2%")
                            .font(.caption2)
                            .foregroundColor(WidgetTheme.adaptiveOnSurface(colorScheme: colorScheme).opacity(0.6))
                    }

                    Text(String(format: "%.4f", entry.token0Amount))
                        .font(.system(size: 14, weight: .bold))
                        .foregroundColor(WidgetTheme.adaptiveOnSurface(colorScheme: colorScheme))
                        .minimumScaleFactor(0.8)
                        .lineLimit(1)
                }
                .padding(.all, WidgetTheme.Spacing.sm)
                .background(WidgetTheme.Colors.primary.opacity(0.08))
                .cornerRadius(WidgetTheme.Spacing.xs)
                .frame(maxWidth: .infinity)

                VStack(alignment: .trailing, spacing: 4) {
                    HStack {
                        Text("49.8%")
                            .font(.caption2)
                            .foregroundColor(WidgetTheme.adaptiveOnSurface(colorScheme: colorScheme).opacity(0.6))

                        Spacer()

                        Text(entry.token1Symbol)
                            .font(.caption)
                            .foregroundColor(WidgetTheme.Colors.secondary)
                            .bold()
                    }

                    Text(String(format: "%.2f", entry.token1Amount))
                        .font(.system(size: 14, weight: .bold))
                        .foregroundColor(WidgetTheme.adaptiveOnSurface(colorScheme: colorScheme))
                        .minimumScaleFactor(0.8)
                        .lineLimit(1)
                }
                .padding(.all, WidgetTheme.Spacing.sm)
                .background(WidgetTheme.Colors.secondary.opacity(0.08))
                .cornerRadius(WidgetTheme.Spacing.xs)
                .frame(maxWidth: .infinity)
            }
        }
        .padding(.vertical, WidgetTheme.Spacing.md)
        .padding(.horizontal, WidgetTheme.Spacing.md)
        .background(WidgetTheme.adaptiveSurface(colorScheme: colorScheme))
        .containerBackground(WidgetTheme.adaptiveSurface(colorScheme: colorScheme), for: .widget)
    }

    // Large widget layout (redesigned)
    private var largeWidgetLayout: some View {
        VStack(alignment: .leading, spacing: WidgetTheme.Spacing.sm) {
            // Header with pool pair and range status
            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    Text(entry.poolPairName)
                        .font(WidgetTheme.Typography.headline)
                        .foregroundColor(WidgetTheme.adaptiveOnSurface(colorScheme: colorScheme))
                        .bold()

                    Text("Liquidity Pool Position")
                        .font(WidgetTheme.Typography.caption)
                        .foregroundColor(WidgetTheme.adaptiveOnSurface(colorScheme: colorScheme).opacity(0.7))
                }

                Spacer()

                // Range status indicator
                HStack(spacing: 6) {
                    Circle()
                        .fill(entry.isInRange ? WidgetTheme.Colors.success : WidgetTheme.Colors.warning)
                        .frame(width: 10, height: 10)

                    Text(entry.isInRange ? "In Range" : "Out of Range")
                        .font(WidgetTheme.Typography.body)
                        .foregroundColor(entry.isInRange ? WidgetTheme.Colors.success : WidgetTheme.Colors.warning)
                        .bold()
                }
            }

            // Range position slider - larger
            ZStack(alignment: .leading) {
                RoundedRectangle(cornerRadius: 2)
                    .fill(WidgetTheme.adaptiveOutline(colorScheme: colorScheme).opacity(0.3))
                    .frame(height: 4)

                RoundedRectangle(cornerRadius: 2)
                    .fill(WidgetTheme.Colors.success.opacity(0.4))
                    .frame(height: 4)
                    .scaleEffect(x: 0.5, anchor: .center)

                GeometryReader { geometry in
                    Circle()
                        .fill(entry.isInRange ? WidgetTheme.Colors.success : WidgetTheme.Colors.warning)
                        .frame(width: 12, height: 12)
                        .overlay(
                            Circle()
                                .stroke(WidgetTheme.Colors.primary, lineWidth: 2)
                        )
                        .shadow(color: .black.opacity(0.1), radius: 2, x: 0, y: 1)
                        .position(
                            x: max(6, min(geometry.size.width - 6, entry.rangePosition * geometry.size.width)),
                            y: 2
                        )
                }
                .frame(height: 4)
            }
            .padding(.vertical, 6)

            // Prominent Total Value display
            VStack(alignment: .center, spacing: 4) {
                Text("Total Portfolio Value")
                    .font(WidgetTheme.Typography.body)
                    .foregroundColor(WidgetTheme.adaptiveOnSurface(colorScheme: colorScheme).opacity(0.8))
                    .bold()

                Text("$\(String(format: "%.2f", entry.totalValue))")
                    .font(.system(size: 32, weight: .bold, design: .rounded))
                    .foregroundColor(WidgetTheme.adaptiveOnSurface(colorScheme: colorScheme))
                    .minimumScaleFactor(0.8)
                    .lineLimit(1)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, WidgetTheme.Spacing.md)

            // Fees in prominent card
            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    Text("Uncollected Fees")
                        .font(WidgetTheme.Typography.caption)
                        .foregroundColor(WidgetTheme.adaptiveOnSurface(colorScheme: colorScheme).opacity(0.7))

                    Text("$\(String(format: "%.2f", entry.uncollectedFees))")
                        .font(.system(size: 20, weight: .bold))
                        .foregroundColor(WidgetTheme.Colors.success)
                }

                Spacer()

                // Add percentage or additional info
                VStack(alignment: .trailing, spacing: 2) {
                    Text("APY Est.")
                        .font(WidgetTheme.Typography.caption)
                        .foregroundColor(WidgetTheme.adaptiveOnSurface(colorScheme: colorScheme).opacity(0.7))

                    Text("~12.4%")
                        .font(WidgetTheme.Typography.body)
                        .foregroundColor(WidgetTheme.Colors.primary)
                        .bold()
                }
            }
            .padding(.all, WidgetTheme.Spacing.md)
            .background(WidgetTheme.Colors.success.opacity(0.08))
            .cornerRadius(WidgetTheme.Spacing.sm)

            // Token amounts - enhanced cards
            HStack(spacing: WidgetTheme.Spacing.sm) {
                VStack(alignment: .leading, spacing: 6) {
                    HStack {
                        Text(entry.token0Symbol)
                            .font(WidgetTheme.Typography.body)
                            .foregroundColor(WidgetTheme.Colors.primary)
                            .bold()

                        Spacer()

                        Text("50.2%")
                            .font(WidgetTheme.Typography.caption)
                            .foregroundColor(WidgetTheme.adaptiveOnSurface(colorScheme: colorScheme).opacity(0.6))
                    }

                    Text(String(format: "%.4f", entry.token0Amount))
                        .font(.system(size: 18, weight: .bold))
                        .foregroundColor(WidgetTheme.adaptiveOnSurface(colorScheme: colorScheme))
                        .minimumScaleFactor(0.8)
                        .lineLimit(1)
                }
                .padding(.all, WidgetTheme.Spacing.md)
                .background(WidgetTheme.Colors.primary.opacity(0.08))
                .cornerRadius(WidgetTheme.Spacing.sm)
                .frame(maxWidth: .infinity)

                VStack(alignment: .trailing, spacing: 6) {
                    HStack {
                        Text("49.8%")
                            .font(WidgetTheme.Typography.caption)
                            .foregroundColor(WidgetTheme.adaptiveOnSurface(colorScheme: colorScheme).opacity(0.6))

                        Spacer()

                        Text(entry.token1Symbol)
                            .font(WidgetTheme.Typography.body)
                            .foregroundColor(WidgetTheme.Colors.secondary)
                            .bold()
                    }

                    Text(String(format: "%.2f", entry.token1Amount))
                        .font(.system(size: 18, weight: .bold))
                        .foregroundColor(WidgetTheme.adaptiveOnSurface(colorScheme: colorScheme))
                        .minimumScaleFactor(0.8)
                        .lineLimit(1)
                }
                .padding(.all, WidgetTheme.Spacing.md)
                .background(WidgetTheme.Colors.secondary.opacity(0.08))
                .cornerRadius(WidgetTheme.Spacing.sm)
                .frame(maxWidth: .infinity)
            }
        }
        .padding(.vertical, WidgetTheme.Spacing.lg)
        .padding(.horizontal, WidgetTheme.Spacing.lg)
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
        .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
    }
}

#Preview(as: .systemSmall) {
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

#Preview(as: .systemLarge) {
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
}
