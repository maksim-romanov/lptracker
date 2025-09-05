import { Text as RNText, TextProps as RNTextProps } from "react-native";
import { StyleSheet, UnistylesVariants } from "react-native-unistyles";

export type TComponentVariants = UnistylesVariants<typeof styles>;

export const Text = function ({ style, weight, size, type, ...props }: RNTextProps & TComponentVariants) {
  styles.useVariants({ weight, size, type });

  return <RNText {...props} style={[styles.text, style]} />;
};

const styles = StyleSheet.create((theme) => ({
  text: {
    variants: {
      weight: {
        light: {
          fontFamily: "Inter18pt-Light",
        },
        regular: {
          fontFamily: "Inter18pt-Regular",
        },
        semiBold: {
          fontFamily: "Inter18pt-SemiBold",
        },
        bold: {
          fontFamily: "Inter24pt-Bold",
        },
        default: {
          fontFamily: "Inter18pt-Medium",
        },
      },

      size: {
        small: {
          fontSize: 14,
        },
        caption: {
          fontSize: 12,
        },
        default: {
          fontSize: 16,
        },
      },

      type: {
        accent: {
          color: theme.colors.accent1,
        },
        accent2: {
          color: theme.colors.accent2,
        },
        accent3: {
          color: theme.colors.accent3,
        },
        accent4: {
          color: theme.colors.accent4,
        },

        secondary: {
          color: theme.colors.textSecondary,
        },
        tertiary: {
          color: theme.colors.textTertiary,
        },
        default: {
          color: theme.colors.textPrimary,
        },
      },
    },
  },
}));
