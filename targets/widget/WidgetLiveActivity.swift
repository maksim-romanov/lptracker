import ActivityKit
import WidgetKit
import SwiftUI

struct WidgetAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        // Dynamic stateful properties about your activity go here!
        var emoji: String
    }

    // Fixed non-changing properties about your activity go here!
    var name: String
}

struct WidgetLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: WidgetAttributes.self) { context in
            // Lock screen/banner UI goes here
            VStack(spacing: WidgetTheme.Spacing.sm) {
                Text("Hello \(context.state.emoji)")
                    .font(WidgetTheme.Typography.body)
                    .foregroundColor(WidgetTheme.Colors.onPrimary)
            }
            .padding(WidgetTheme.Spacing.md)
            .activityBackgroundTint(WidgetTheme.Colors.primary)
            .activitySystemActionForegroundColor(WidgetTheme.Colors.onPrimary)

        } dynamicIsland: { context in
            DynamicIsland {
                // Expanded UI goes here.  Compose the expanded UI through
                // various regions, like leading/trailing/center/bottom
                DynamicIslandExpandedRegion(.leading) {
                    Text("Leading")
                        .font(WidgetTheme.Typography.caption)
                        .foregroundColor(WidgetTheme.Colors.primary)
                }
                DynamicIslandExpandedRegion(.trailing) {
                    Text("Trailing")
                        .font(WidgetTheme.Typography.caption)
                        .foregroundColor(WidgetTheme.Colors.secondary)
                }
                DynamicIslandExpandedRegion(.bottom) {
                    VStack(spacing: WidgetTheme.Spacing.xs) {
                        Text("Bottom \(context.state.emoji)")
                            .font(WidgetTheme.Typography.body)
                        // more content
                    }
                }
            } compactLeading: {
                Text("L")
                    .font(WidgetTheme.Typography.caption)
                    .foregroundColor(WidgetTheme.Colors.primary)
            } compactTrailing: {
                Text("T \(context.state.emoji)")
                    .font(WidgetTheme.Typography.caption)
                    .foregroundColor(WidgetTheme.Colors.secondary)
            } minimal: {
                Text(context.state.emoji)
                    .font(WidgetTheme.Typography.body)
            }
            .widgetURL(URL(string: "https://www.expo.dev"))
            .keylineTint(WidgetTheme.Colors.primary)
        }
    }
}

extension WidgetAttributes {
    fileprivate static var preview: WidgetAttributes {
        WidgetAttributes(name: "World")
    }
}

extension WidgetAttributes.ContentState {
    fileprivate static var smiley: WidgetAttributes.ContentState {
        WidgetAttributes.ContentState(emoji: "😀")
     }
     
     fileprivate static var starEyes: WidgetAttributes.ContentState {
         WidgetAttributes.ContentState(emoji: "🤩")
     }
}

#Preview("Notification", as: .content, using: WidgetAttributes.preview) {
   WidgetLiveActivity()
} contentStates: {
    WidgetAttributes.ContentState.smiley
    WidgetAttributes.ContentState.starEyes
}
