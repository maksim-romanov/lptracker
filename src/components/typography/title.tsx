import { TextProps } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { TComponentVariants, Text } from "./text";

export const Title = function ({ style, ...props }: TextProps & Omit<TComponentVariants, "size">) {
  return <Text style={[styles.title, style]} {...props} />;
};

const styles = StyleSheet.create((theme) => ({
  title: {
    variants: {
      size: {
        display: {
          fontSize: 24,
        },
        default: {
          fontSize: 20,
        },
      },
    },
  },
}));
