import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Box, Column, Columns } from "@grapp/stacks";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { useAnimatedStyle, withSpring } from "react-native-reanimated";
import { Shadow } from "react-native-shadow-2";
import { StyleSheet, withUnistyles } from "react-native-unistyles";
import tinycolor from "tinycolor2";
import { Address } from "viem";

import { PrimaryTag } from "components/tag/presets";
import { Text } from "components/typography/text";
import { formatAddress } from "utils/hash";

const WalletIcon = withUnistyles(Ionicons, (theme) => ({
  color: theme.colors.onSurface,
  size: 24,
  name: "wallet-outline" as const,
}));

const WalletIconActive = withUnistyles(WalletIcon, (theme) => ({
  color: theme.colors.onPrimaryContainer,
  name: "wallet" as const,
}));

type TProps = {
  isActive: boolean;
  address: Address;
  name?: string;
};

const UniShadow = withUnistyles(Shadow, (theme) => ({
  startColor: tinycolor(theme.colors.primaryContainer).setAlpha(0.1).toRgbString(),
  distance: 10,
  stretch: true,
}));

export const WalletItemBlock = function ({ isActive, address, name }: TProps) {
  styles.useVariants({ isActive });

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(isActive ? 1.01 : 1) }],
    opacity: withSpring(isActive ? 1 : 0.6),
  }));

  return (
    <Animated.View style={containerStyle}>
      <UniShadow disabled={!isActive}>
        <Box style={styles.container}>
          <Columns alignY="center" space={2}>
            <Column flex="content">{isActive ? <WalletIconActive /> : <WalletIcon />}</Column>

            <Column flex="fluid">
              <Box gap={1}>
                {name && (
                  <Text type="caption" color="onSurfaceVariant">
                    {name}
                  </Text>
                )}

                <Text type="subtitle1">{formatAddress(address)}</Text>
              </Box>
            </Column>

            <Column flex="content">{isActive && <PrimaryTag>Active</PrimaryTag>}</Column>
          </Columns>
        </Box>
      </UniShadow>
    </Animated.View>
  );
};

const PlusIcon = withUnistyles(FontAwesome6, (theme) => ({
  color: theme.colors.primary,
  size: 24,
  name: "plus" as const,
}));

const PrimaryLinearGradient = withUnistyles(LinearGradient, (theme) => ({
  colors: [theme.colors.primaryContainer, "transparent", theme.colors.tertiaryContainer] as const,
  start: { x: 0, y: 0 },
  end: { x: 1, y: 1 },
}));

export const AddWalletItemBlock = function () {
  return (
    <PrimaryLinearGradient style={styles.addWalletGradient}>
      <Box style={styles.addWalletContainer}>
        <Columns alignY="center" space={3}>
          <Column flex="content">
            <PlusIcon />
          </Column>

          <Column flex="fluid">
            <Box gap={1}>
              <Text type="headline6" color="primary">
                Add New Wallet
              </Text>

              <Text type="caption">Connect or import a wallet</Text>
            </Box>
          </Column>

          <Column flex="content">
            <Box style={styles.addWalletArrow}>
              <Ionicons name="chevron-forward" size={16} color="#ff37c7" />
            </Box>
          </Column>
        </Columns>
      </Box>
    </PrimaryLinearGradient>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: theme.colors.outline,

    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.lg,

    variants: {
      isActive: {
        true: {
          backgroundColor: theme.colors.primaryContainer,
          borderColor: theme.colors.onPrimaryContainer,
        },
      },
    },
  },

  // Styles for AddWalletItemBlock
  addWalletPressable: {
    borderRadius: 12,
    overflow: "hidden",
  },

  addWalletGradient: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 55, 199, 0.2)",
  },

  addWalletContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    backgroundColor: "transparent",
  },

  addWalletText: {
    fontWeight: "600",
  },

  addWalletSubtext: {
    color: theme.colors.onSurfaceVariant,
    opacity: 0.8,
  },

  addWalletArrow: {
    backgroundColor: "rgba(255, 55, 199, 0.1)",
    borderRadius: 20,
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
}));
