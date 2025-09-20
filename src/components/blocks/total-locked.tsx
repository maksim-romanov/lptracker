import Ionicons from "@expo/vector-icons/Ionicons";
import { Box, Inline, Stack } from "@grapp/stacks";
import { LinearGradient } from "expo-linear-gradient";
import { observer } from "mobx-react-lite";
import numbro from "numbro";
import { ImageBackground } from "react-native";
import { StyleSheet, withUnistyles } from "react-native-unistyles";
import { Address } from "viem";

import { TertiaryTag } from "components/tag/presets";
import { Text } from "components/typography/text";
import { addressesStore } from "presentation/stores/addresses-store";
import { formatAddress } from "utils/hash";

const bgBase64 =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAuQAAADACAYAAABMBnZsAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAATWSURBVHgB7d2xbQQgFAXBj2P6cP81XGOmAALrAjaZkci2gBcgWDOzBwAASPwMAACQMcgBACBkkAMAQMggBwCA0HWQfz6f3/knrVar1Wq1Wq1W+327xisrAACQcWUFAABCBjkAAIQMcgAACBnkAAAQMsgBACBkkAMAQMggBwCAkEEOAAAhgxwAAELXQe6rU61Wq9VqtVqt9k27ztkDAAAkXFkBAICQQQ4AACGDHAAAQgY5AACEDHIAAAgZ5AAAEDLIAQAgZJADAEDIIAcAgNB1kPvqVKvVarVarVarfdOuc/YAAAAJV1YAACBkkAMAQMggBwCAkEEOAAAhgxwAAEIGOQAAhAxyAAAIGeQAABAyyAEAIHQd5L461Wq1Wq1Wq9Vq37TrnD0AAEDClRUAAAgZ5AAAEDLIAQAgZJADAEDIIAcAgJBBDgAAIYMcAABCBjkAAIQMcgAACF0Hua9OtVqtVqvVarXaN+06Zw8AAJBwZQUAAEIGOQAAhAxyAAAIGeQAABAyyAEAIGSQAwBAyCAHAICQQQ4AACGDHAAAQtdB7qtTrVar1Wq1Wq32TbvO2QMAACRcWQEAgJBBDgAAIYMcAABCBjkAAIQMcgAACBnkAAAQMsgBACBkkAMAQMggBwCA0HWQ++pUq9VqtVqtVqt9065z9gAAAAlXVgAAIGSQAwBAyCAHAICQQQ4AACGDHAAAQgY5AACEDHIAAAgZ5AAAEDLIAQAgdB3kvjrVarVarVar1WrftOucPQAAQMKVFQAACBnkAAAQMsgBACBkkAMAQMggBwCAkEEOAAAhgxwAAEIGOQAAhAxyAAAIXQe5r061Wq1Wq9Vqtdo37TpnDwAAkHBlBQAAQgY5AACEDHIAAAgZ5AAAEDLIAQAgZJADAEDIIAcAgJBBDgAAIYMcAABC10Huq1OtVqvVarVarfZNu87ZAwAAJFxZAQCAkEEOAAAhgxwAAEIGOQAAhAxyAAAIGeQAABAyyAEAIGSQAwBAyCAHAIDQdZD76lSr1Wq1Wq1Wq33TrnP2AAAACVdWAAAgZJADAEDIIAcAgJBBDgAAIYMcAABCBjkAAIQMcgAACBnkAAAQMsgBACB0HeS+OtVqtVqtVqvVat+065w9AABAwpUVAAAIGeQAABAyyAEAIGSQAwBAyCAHAICQQQ4AACGDHAAAQgY5AACEDHIAAAhdB7mvTrVarVar1Wq12jftOmcPAACQcGUFAABCBjkAAIQMcgAACBnkAAAQMsgBACBkkAMAQMggBwCAkEEOAAAhgxwAAELXQe6rU61Wq9VqtVqt9k27ztkDAAAkXFkBAICQQQ4AACGDHAAAQgY5AACEDHIAAAgZ5AAAEDLIAQAgZJADAEDIIAcAgNB1kPvqVKvVarVarVarfdOuc/YAAAAJV1YAACBkkAMAQMggBwCAkEEOAAAhgxwAAEIGOQAAhAxyAAAIGeQAABAyyAEAIHQd5L461Wq1Wq1Wq9Vq37TrnD0AAEDClRUAAAgZ5AAAEDLIAQAgZJADAEDIIAcAgJBBDgAAIYMcAABCBjkAAIQMcgAACF0Hua9OtVqtVqvVarXaN+06Zw8AAJBwZQUAAEIGOQAAhAxyAAAIGeQAABAyyAEAIGSQAwBAyCAHAICQQQ4AACGDHAAAQn8TgNstrEdwkQAAAABJRU5ErkJggg==";

const UniLinearGradient = withUnistyles(LinearGradient, (theme) => ({
  colors: [theme.colors.surfaceContainer, "transparent"] as const,
  locations: [0, 1] as const,
  end: { x: 0, y: 1 },
  start: { x: 1, y: 0 },
}));

const LockIcon = withUnistyles(Ionicons, (theme) => ({
  name: "lock-closed" as const,
  size: 16,
  color: theme.colors.primary,
}));

type TProps = {
  totalLocked: number;
  address: Address;
};

const withDataProvider = (Component: React.ComponentType<TProps>) => {
  return observer(function () {
    const totalLocked = 5460.23;
    const address = addressesStore.activeAddress;
    if (!address) return null;

    return <Component totalLocked={totalLocked} address={address} />;
  });
};

export const TotalLockedBlock = withDataProvider(function ({ totalLocked, address }: TProps) {
  return (
    <ImageBackground source={{ uri: bgBase64 }} style={styles.wrapper}>
      <UniLinearGradient>
        <Box rowGap={4} style={styles.container}>
          <Inline alignX="center" alignY="center" space={2}>
            <Box style={styles.lockIconContainer}>
              <LockIcon />
            </Box>

            <Text type="subtitle2" color="onSurfaceVariant">
              Total Value Locked
            </Text>
          </Inline>

          <Stack align="center" space={4}>
            <Text type="headline1">
              {numbro(totalLocked).formatCurrency({
                mantissa: 0,
                thousandSeparated: true,
                trimMantissa: true,
                spaceSeparated: false,
              })}
            </Text>

            <TertiaryTag rounded>{formatAddress(address)}</TertiaryTag>
          </Stack>
        </Box>
      </UniLinearGradient>
    </ImageBackground>
  );
});

const styles = StyleSheet.create((theme) => ({
  wrapper: {
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: theme.colors.surfaceContainer,
  },

  container: {
    // backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderRadius: 12,
    borderColor: theme.colors.outline,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xxl,
  },

  lockIconContainer: {
    backgroundColor: theme.colors.primaryContainer,
    borderRadius: 8,
    padding: theme.spacing.xs,
  },
}));
