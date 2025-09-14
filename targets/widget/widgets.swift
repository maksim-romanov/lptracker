import WidgetKit
import SwiftUI

struct Provider: AppIntentTimelineProvider {
    func placeholder(in context: Context) -> SimpleEntry {
        SimpleEntry(date: Date(), configuration: ConfigurationAppIntent())
    }

    func snapshot(for configuration: ConfigurationAppIntent, in context: Context) async -> SimpleEntry {
        SimpleEntry(date: Date(), configuration: configuration)
    }

    func timeline(for configuration: ConfigurationAppIntent, in context: Context) async -> Timeline<SimpleEntry> {
        var entries: [SimpleEntry] = []

        // Generate a timeline consisting of five entries an hour apart, starting from the current date.
        let currentDate = Date()
        for hourOffset in 0 ..< 5 {
            let entryDate = Calendar.current.date(byAdding: .hour, value: hourOffset, to: currentDate)!
            let entry = SimpleEntry(date: entryDate, configuration: configuration)
            entries.append(entry)
        }

        return Timeline(entries: entries, policy: .atEnd)
    }
}


struct SimpleEntry: TimelineEntry {
    let date: Date
    let configuration: ConfigurationAppIntent
}


struct widgetEntryView : View {
    var entry: Provider.Entry
    @Environment(\.colorScheme) var colorScheme

    var body: some View {
        VStack(spacing: WidgetTheme.Spacing.md) {
            Text("Time:")
                .font(WidgetTheme.Typography.caption)
                .foregroundColor(WidgetTheme.adaptiveOnSurface(colorScheme: colorScheme).opacity(0.7))

            Text(entry.date, style: .time)
                .font(WidgetTheme.Typography.title)
                .foregroundColor(WidgetTheme.adaptiveOnSurface(colorScheme: colorScheme))

            Text("Favorite Emoji:")
                .font(WidgetTheme.Typography.caption)
                .foregroundColor(WidgetTheme.adaptiveOnSurface(colorScheme: colorScheme).opacity(0.7))

            Text(entry.configuration.favoriteEmoji)
                .font(WidgetTheme.Typography.headline)
        }
        .padding(WidgetTheme.Spacing.lg)
    }
}

struct AdaptiveWidgetView: View {
    var entry: Provider.Entry
    @Environment(\.colorScheme) var colorScheme

    var body: some View {
        widgetEntryView(entry: entry)
            .containerBackground(WidgetTheme.adaptiveSurface(colorScheme: colorScheme), for: .widget)
    }
}


struct widget: Widget {
    let kind: String = "widget"

    var body: some WidgetConfiguration {
        AppIntentConfiguration(kind: kind, intent: ConfigurationAppIntent.self, provider: Provider()) { entry in
            AdaptiveWidgetView(entry: entry)
        }
    }
}


extension ConfigurationAppIntent {
    fileprivate static var smiley: ConfigurationAppIntent {
        let intent = ConfigurationAppIntent()
        intent.favoriteEmoji = "😀"
        return intent
    }
    
    fileprivate static var starEyes: ConfigurationAppIntent {
        let intent = ConfigurationAppIntent()
        intent.favoriteEmoji = "🤩"
        return intent
    }
}

#Preview(as: .systemSmall) {
    widget()
} timeline: {
    SimpleEntry(date: .now, configuration: .smiley)
    SimpleEntry(date: .now, configuration: .starEyes)
}

