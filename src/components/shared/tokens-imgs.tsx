import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

type TProps = {
  tokens: { address: string; symbol?: string }[];
};

export const TokensImages = function ({ tokens }: TProps) {
  styles.useVariants({ size: "sm" });

  return (
    <View style={[styles.itemsContainer({ tokens })]}>
      {tokens.map((token, index) => (
        <View key={token.address} style={[styles.itemContainer, { transform: [{ translateX: index * 21 * -1 }] }]} />
      ))}
    </View>
  );
};

const SMALL = {
  SIZE: 45,
  BORDER_WIDTH: 5,
};

const styles = StyleSheet.create((theme) => ({
  itemsContainer: ({ tokens }: Pick<TProps, "tokens">) => ({
    flexDirection: "row",
    alignItems: "center",

    variants: {
      size: {
        sm: {
          transform: [{ translateX: -(SMALL.BORDER_WIDTH / 2) }],
          width:
            tokens.length * (SMALL.SIZE - SMALL.BORDER_WIDTH / 2) -
            (tokens.length - 1) * (SMALL.SIZE / 2) -
            SMALL.BORDER_WIDTH / 2,
        },
      },
    },
  }),

  itemContainer: {
    borderColor: theme.colors.surface,
    backgroundColor: theme.colors.surfaceContainerHighest,

    variants: {
      size: {
        sm: {
          width: SMALL.SIZE,
          height: SMALL.SIZE,
          borderRadius: SMALL.SIZE,
          borderWidth: SMALL.BORDER_WIDTH,
        },
      },
    },
  },
}));
