import React from "react";

import { ViewProps } from "react-native";
import { Shadow } from "react-native-shadow-2";
import { StyleSheet, UnistylesVariants, withUnistyles } from "react-native-unistyles";

import { Text } from "../typography/text";

export type TComponentVariants = UnistylesVariants<typeof styles>;

export type TProps = {
  colors: {
    surface: string;
    onSurface: string;
    outline: string;
    shadow: string;
  };

  glow?: boolean;
} & Pick<ViewProps, "style"> &
  TComponentVariants;

const UniShadow = withUnistyles(Shadow, (theme) => ({ distance: 2, stretch: true }));

export const Tag = function ({ children, colors, rounded, glow, style }: React.PropsWithChildren<TProps>) {
  styles.useVariants({ rounded });

  return (
    <UniShadow
      distance={glow ? 4 : 2}
      startColor={colors?.shadow}
      style={[styles.container, { backgroundColor: colors?.surface, borderColor: colors?.outline }, style]}
    >
      <Text type="caption" style={[styles.text, { color: colors?.onSurface }]}>
        {children}
      </Text>
    </UniShadow>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: theme.spacing.xxs,
    borderRadius: theme.spacing.xs,
    borderWidth: 1,

    variants: {
      rounded: {
        true: {
          borderRadius: theme.spacing.xl,
          paddingHorizontal: theme.spacing.sm,
        },
      },
    },
  },

  text: {
    textTransform: "capitalize",
  },
}));
