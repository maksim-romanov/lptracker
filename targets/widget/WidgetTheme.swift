import SwiftUI

struct WidgetTheme {
    // MARK: - Colors based on React Native theme

    struct Colors {
        // Primary Uniswap brand colors (consistent with React Native theme)
        static let primary = Color(hex: "FF007A") // Uniswap signature pink
        static let onPrimary = Color.white

        // Secondary colors
        static let secondary = Color(hex: "4C82FB") // Uniswap blue
        static let onSecondary = Color.white

        // Status colors (matching React Native theme)
        static let success = Color(hex: "40B66B") // Uniswap green
        static let warning = Color(hex: "FF9F0A") // Uniswap orange
        static let error = Color(hex: "FF4444") // Error red

        // Common outline color
        static let outline = Color(hex: "9E9E9E")

        // Adaptive colors that work with light/dark mode
        struct Light {
            static let background = Color.white
            static let surface = Color(hex: "F0F0F0")
            static let onSurface = Color(hex: "0D111C")
            static let outline = Color(hex: "9E9E9E")
            static let surfaceVariant = Color(hex: "F7F8FA")
        }

        struct Dark {
            static let background = Color(hex: "000000") // Pure black
            static let surface = Color(hex: "0A0A0A") // Very dark gray
            static let onSurface = Color.white
            static let outline = Color(hex: "2A2A2A") // Darker outline
            static let surfaceVariant = Color(hex: "1A1A1A") // Darker variant
        }
    }

    // MARK: - Typography (matching React Native theme)

    struct Typography {
        static let title = Font.system(size: 16, weight: .semibold)
        static let body = Font.system(size: 14, weight: .regular)
        static let caption = Font.system(size: 12, weight: .regular)
        static let headline = Font.system(size: 18, weight: .bold)
    }

    // MARK: - Spacing (matching React Native 8px base scale)

    struct Spacing {
        static let xs: CGFloat = 4
        static let sm: CGFloat = 8
        static let md: CGFloat = 12
        static let lg: CGFloat = 16
        static let xl: CGFloat = 20
        static let xxl: CGFloat = 24
        static let xxxl: CGFloat = 32
    }

    // MARK: - Adaptive Color Helpers

    static func adaptiveBackground(colorScheme: ColorScheme) -> Color {
        colorScheme == .dark ? Colors.Dark.background : Colors.Light.background
    }

    static func adaptiveSurface(colorScheme: ColorScheme) -> Color {
        colorScheme == .dark ? Colors.Dark.surface : Colors.Light.surface
    }

    static func adaptiveOnSurface(colorScheme: ColorScheme) -> Color {
        colorScheme == .dark ? Colors.Dark.onSurface : Colors.Light.onSurface
    }

    static func adaptiveOutline(colorScheme: ColorScheme) -> Color {
        colorScheme == .dark ? Colors.Dark.outline : Colors.Light.outline
    }

    static func adaptiveSurfaceVariant(colorScheme: ColorScheme) -> Color {
        colorScheme == .dark ? Colors.Dark.surfaceVariant : Colors.Light.surfaceVariant
    }
}

// MARK: - Color Extension for Hex Support

extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3: // RGB (12-bit)
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: // RGB (24-bit)
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB (32-bit)
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (1, 1, 1, 0)
        }

        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue:  Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}