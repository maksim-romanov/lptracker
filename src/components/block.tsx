import { View, ViewProps } from "react-native";
import { StyleSheet, UnistylesVariants } from "react-native-unistyles";

type TComponentVariants = UnistylesVariants<typeof styles>;

export const Block = function ({ style, type, ...props }: ViewProps & TComponentVariants) {
  styles.useVariants({ type });

  return <View style={[styles.block, style]} {...props} />;
};

const styles = StyleSheet.create((theme) => ({
  block: {
    padding: 12,
    borderRadius: 12,

    variants: {
      type: {
        active: {
          backgroundColor: theme.colors.interactiveActive,
        },

        default: {
          backgroundColor: theme.colors.backgroundModule,
        },
      },
    },
  },
}));
