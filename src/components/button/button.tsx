import { StyleProp, TextStyle, TouchableOpacity, TouchableOpacityProps } from "react-native";
import { StyleSheet, UnistylesVariants } from "react-native-unistyles";

import { Text } from "../typography/text";

export type TComponentVariants = UnistylesVariants<typeof styles>;

export type TButtonProps = TouchableOpacityProps & {
  children: React.ReactNode;
  textInputStyle?: StyleProp<TextStyle>;
} & TComponentVariants;

export const Button = function ({ children, textInputStyle, style, type, ...props }: TButtonProps) {
  styles.useVariants({ disabled: props.disabled, type });

  return (
    <TouchableOpacity style={[styles.button, style]} {...props}>
      <Text type="headline6" style={[styles.text, textInputStyle]}>
        {children}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create((theme) => ({
  button: {
    backgroundColor: theme.colors.surfaceContainer,
    padding: theme.spacing.md,
    borderRadius: theme.spacing.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.surfaceContainerHigh,

    variants: {
      disabled: {
        true: {
          opacity: 0.5,
        },
      },

      type: {
        primary: {
          backgroundColor: theme.colors.primaryContainer,
          borderColor: theme.colors.primaryContainerVariant,
        },

        secondary: {
          backgroundColor: theme.colors.secondaryContainer,
          borderColor: theme.colors.secondaryContainerVariant,
        },

        destructive: {
          backgroundColor: theme.colors.errorContainer,
          borderColor: theme.colors.errorContainerVariant,
        },
      },
    },
  },

  text: {
    color: theme.colors.onSurfaceContainer,

    variants: {
      type: {
        destructive: {
          color: theme.colors.onErrorContainer,
        },

        primary: {
          color: theme.colors.onPrimaryContainer,
        },

        secondary: {
          color: theme.colors.onSecondaryContainer,
        },
      },
    },
  },
}));
