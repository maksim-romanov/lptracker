import React from "react";

import { Image } from "expo-image";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { isAddress } from "viem";

import { ChainId } from "domain/entities/blockchain";
import { useTokenMetadata } from "features/token-metadata/presentation/hooks";

type TProps = {
  chainId: ChainId;
  tokens: { address: string; symbol?: string }[];
};

const TokenImage = React.memo(function TokenImage({
  token,
  chainId,
}: {
  token: { address: string; symbol?: string };
  chainId: ChainId;
}) {
  if (!isAddress(token.address)) throw new Error("Invalid token address");
  const { data: metadata, isLoading } = useTokenMetadata(token.address, chainId);
  if (isLoading) return <View style={[styles.image, styles.placeholder]} />;
  if (!metadata) return <View style={[styles.image, styles.fallback]} />;
  return <Image contentFit="contain" style={[styles.image]} source={{ uri: metadata.logoUrl }} />;
});

export const TokensImages = React.memo(function TokensImages({ tokens, chainId }: TProps) {
  styles.useVariants({ size: "sm" });

  return (
    <View style={[styles.itemsContainer({ tokens })]}>
      {tokens.map((token, index) => (
        <View key={token.address} style={[styles.itemContainer({ index })]}>
          <TokenImage token={token} chainId={chainId} />
        </View>
      ))}
    </View>
  );
});

const SMALL = {
  SIZE: 46,
  BORDER_WIDTH: 4,
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

  itemContainer: ({ index }: { index: number }) => ({
    borderColor: theme.colors.surface,
    backgroundColor: theme.colors.surfaceContainerHighest,

    variants: {
      size: {
        sm: {
          borderWidth: SMALL.BORDER_WIDTH,
          width: SMALL.SIZE,
          height: SMALL.SIZE,
          borderRadius: SMALL.SIZE,

          transform: [{ translateX: index * (SMALL.SIZE / 2) * -1 }],
        },
      },
    },
  }),

  image: {
    flex: 1,
    backgroundColor: theme.colors.surfaceContainerHighest,
    borderRadius: 9999,
  },

  placeholder: {
    backgroundColor: theme.colors.surfaceContainerHigh,
  },

  fallback: {
    backgroundColor: theme.colors.primaryContainer,
    justifyContent: "center",
    alignItems: "center",
  },
}));
