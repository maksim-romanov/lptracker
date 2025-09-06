import React from "react";

import { Column, Columns } from "@grapp/stacks";
import { View, ViewProps } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import tinycolor from "tinycolor2";

import { Text } from "./typography/text";

type TProps = {
  color?: string;
  prefix?: React.ReactNode;
} & Pick<ViewProps, "style">;

export const Tag = function ({ children, color = "#6F707B", prefix, style }: React.PropsWithChildren<TProps>) {
  return (
    <View style={[styles.chip({ color }), style]}>
      <Columns space={3} alignY="center">
        {!!prefix && <>{prefix}</>}

        <Column flex="content">
          <Text type="caption" style={{ color }}>
            {children}
          </Text>
        </Column>
      </Columns>
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  chip: ({ color }: { color: string }) => ({
    backgroundColor: tinycolor(color).setAlpha(0.2).toRgbString(),
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.spacing.xs,
    borderWidth: 1,
    borderColor: tinycolor(color).setAlpha(0.1).toRgbString(),
  }),
}));
