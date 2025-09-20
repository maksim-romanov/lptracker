import React from "react";

import { TextInput as RNTextInput, TextInputProps as RNTextInputProps } from "react-native";
import { StyleSheet, withUnistyles } from "react-native-unistyles";

const UniTextInput = withUnistyles(RNTextInput, (theme) => ({}));

type TextInputProps = RNTextInputProps & {
  error?: string;
  Component?: React.ComponentType<TextInputProps>;
};

export const TextInput = React.forwardRef<RNTextInput, TextInputProps>(function TextInput(
  { style, error, Component = UniTextInput, ...props },
  ref,
) {
  return <Component ref={ref} style={[styles.input, error && styles.error, style]} {...props} />;
});

const styles = StyleSheet.create((theme) => ({
  input: {
    padding: theme.spacing.lg,
    fontSize: 16,
    color: theme.colors.onSurface,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.outline,
    fontFamily: theme.typography.body1.fontFamily,
  },

  error: {
    borderColor: theme.colors.error,
  },
}));
