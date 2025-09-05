import { TextProps } from "react-native";
import { StyleSheet, UnistylesVariants } from "react-native-unistyles";

import { TComponentVariants as TTextVariants, Text } from "./text";

export type TComponentVariants = UnistylesVariants<typeof styles>;

export const Title = function ({
  style,
  size,
  ...props
}: TextProps & TComponentVariants & Omit<TTextVariants, "size">) {
  styles.useVariants({ size });

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
          fontFamily: "Inter18pt-SemiBold",
          fontSize: 24,
        },
      },
    },
  },
}));
