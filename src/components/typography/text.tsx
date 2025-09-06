import { Text as RNText, TextProps as RNTextProps } from "react-native";
import { StyleSheet, UnistylesVariants } from "react-native-unistyles";

export type TComponentVariants = UnistylesVariants<typeof styles>;

export const Text = function ({ style, type, color, ...props }: RNTextProps & TComponentVariants) {
  styles.useVariants({ type, color });

  return <RNText {...props} style={[styles.text, style]} />;
};

const styles = StyleSheet.create((theme) => ({
  text: {
    color: theme.colors.onBackground,

    variants: {
      color: {
        onPrimary: {
          color: theme.colors.onPrimary,
        },

        onSecondary: {
          color: theme.colors.onSecondary,
        },

        onSurface: {
          color: theme.colors.onSurface,
        },

        success: {
          color: theme.colors.success,
        },

        surface: {
          color: theme.colors.surface,
        },

        outline: {
          color: theme.colors.outline,
        },

        default: {
          color: theme.colors.onBackground,
        },
      },
      type: theme.typography.variants,
      // type: {
      //   primary: {
      //     color: theme.colors.onPrimary,
      //   },
      //   secondary: {
      //     color: theme.colors.onSecondary,
      //   },
      //   tertiary: {
      //     color: theme.colors.onTertiary,
      //   },

      //   default: {
      //     color: theme.colors.onBackground,
      //   },
      // },
    },
  },
}));
