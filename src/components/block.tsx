import { View, ViewProps } from "react-native";
import { StyleSheet, UnistylesVariants } from "react-native-unistyles";

type TComponentVariants = UnistylesVariants<typeof styles>;

export const InfoBlock = function ({ style, type, padding, margin, ...props }: ViewProps & TComponentVariants) {
  styles.useVariants({ type, padding, margin });

  return <View style={[styles.block, style]} {...props} />;
};

const styles = StyleSheet.create((theme) => ({
  block: {
    flexGrow: 1,
    borderRadius: theme.spacing.md,

    variants: {
      type: {
        primary: {
          backgroundColor: theme.colors.primary,
        },
        secondary: {
          backgroundColor: theme.colors.secondary,
        },
        tertiary: {
          backgroundColor: theme.colors.tertiary,
        },
        default: {
          backgroundColor: theme.colors.surface,
        },
      },

      padding: {
        none: { padding: theme.spacing.none },
        xs: { padding: theme.spacing.xs },
        sm: { padding: theme.spacing.sm },
        md: { padding: theme.spacing.md },
        lg: { padding: theme.spacing.lg },
        xl: { padding: theme.spacing.xl },
        xxl: { padding: theme.spacing.xxl },
        default: { padding: theme.spacing.lg },
      },

      margin: {
        none: { margin: theme.spacing.none },
        xs: { margin: theme.spacing.xs },
        sm: { margin: theme.spacing.sm },
        md: { margin: theme.spacing.md },
        lg: { margin: theme.spacing.lg },
        xl: { margin: theme.spacing.xl },
        xxl: { margin: theme.spacing.xxl },
        default: { margin: theme.spacing.none },
      },
    },
  },
}));
