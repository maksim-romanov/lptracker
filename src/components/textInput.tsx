import React from "react";

import { Box } from "@grapp/stacks";
import { TextInput as RNTextInput, TextInputProps as RNTextInputProps } from "react-native";
import { StyleSheet, withUnistyles } from "react-native-unistyles";

import { Text } from "./typography/text";

interface TextInputProps extends Omit<RNTextInputProps, "style"> {
  error?: string;
  containerStyle?: any;
}

const UniInput = withUnistyles(RNTextInput, (theme) => ({
  padding: theme.spacing.lg,
  fontSize: 16,
  color: theme.colors.onSurface,
  fontFamily: "Inter-Regular",
}));

const UniInputContainer = withUnistyles(Box, (theme) => ({
  backgroundColor: theme.colors.background,
  borderRadius: theme.spacing.md,
  borderWidth: 1,
  borderColor: theme.colors.outline,
}));

export const TextInput: React.FC<TextInputProps> = ({ error, containerStyle, ...textInputProps }) => {
  return (
    <UniInputContainer style={containerStyle}>
      <UniInput {...textInputProps} />
      {error && (
        <Text color="onSurface" type="caption" style={styles.errorText}>
          {error}
        </Text>
      )}
    </UniInputContainer>
  );
};

const styles = StyleSheet.create((theme) => ({
  errorText: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
    color: "#FF6B6B", // Red color for error text
  },
}));
