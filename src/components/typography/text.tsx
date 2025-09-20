import React from "react";

import { Text as RNText, TextProps as RNTextProps } from "react-native";
import { StyleSheet, UnistylesVariants } from "react-native-unistyles";

export type TComponentVariants = UnistylesVariants<typeof styles>;

export const Text = React.forwardRef<RNText, RNTextProps & TComponentVariants>(function Text(
  { style, type, color, underline, ...props },
  ref,
) {
  styles.useVariants({ type, color, underline });
  return <RNText {...props} style={[styles.text, style]} ref={ref} />;
});

const styles = StyleSheet.create((theme) => ({
  text: {
    variants: {
      underline: {
        true: {
          textDecorationLine: "underline",
          textDecorationColor: theme.colors.outlineVariant,
        },
      },

      color: {
        primary: {
          color: theme.colors.primary,
        },

        onPrimary: {
          color: theme.colors.onPrimary,
        },

        onPrimaryContainer: {
          color: theme.colors.onPrimaryContainer,
        },

        onSurfaceVariant: {
          color: theme.colors.onSurfaceVariant,
        },

        default: {
          color: theme.colors.onSurface,
        },
      },

      type: {
        ...theme.typography,
        default: theme.typography.body1,
      },
    },
  },
}));
