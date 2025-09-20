import Ionicons from "@expo/vector-icons/Ionicons";
import { Box, Column, Columns } from "@grapp/stacks";
import { LinearGradient } from "expo-linear-gradient";
import { observer } from "mobx-react-lite";
import { ImageBackground } from "react-native";
import { StyleSheet, withUnistyles } from "react-native-unistyles";
import { Address } from "viem";

import { Text } from "components/typography/text";
import { addressesStore } from "presentation/stores/addresses-store";
import { formatAddress } from "utils/hash";

const bgBase64 =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAuQAAADACAYAAABMBnZsAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAATWSURBVHgB7d2xbQQgFAXBj2P6cP81XGOmAALrAjaZkci2gBcgWDOzBwAASPwMAACQMcgBACBkkAMAQMggBwCA0HWQfz6f3/knrVar1Wq1Wq1W+327xisrAACQcWUFAABCBjkAAIQMcgAACBnkAAAQMsgBACBkkAMAQMggBwCAkEEOAAAhgxwAAELXQe6rU61Wq9VqtVqt9k27ztkDAAAkXFkBAICQQQ4AACGDHAAAQgY5AACEDHIAAAgZ5AAAEDLIAQAgZJADAEDIIAcAgNB1kPvqVKvVarVarVarfdOuc/YAAAAJV1YAACBkkAMAQMggBwCAkEEOAAAhgxwAAEIGOQAAhAxyAAAIGeQAABAyyAEAIHQd5L461Wq1Wq1Wq9Vq37TrnD0AAEDClRUAAAgZ5AAAEDLIAQAgZJADAEDIIAcAgJBBDgAAIYMcAABCBjkAAIQMcgAACF0Hua9OtVqtVqvVarXaN+06Zw8AAJBwZQUAAEIGOQAAhAxyAAAIGeQAABAyyAEAIGSQAwBAyCAHAICQQQ4AACGDHAAAQtdB7qtTrVar1Wq1Wq32TbvO2QMAACRcWQEAgJBBDgAAIYMcAABCBjkAAIQMcgAACBnkAAAQMsgBACBkkAMAQMggBwCA0HWQ++pUq9VqtVqtVqt9065z9gAAAAlXVgAAIGSQAwBAyCAHAICQQQ4AACGDHAAAQgY5AACEDHIAAAgZ5AAAEDLIAQAgdB3kvjrVarVarVar1WrftOucPQAAQMKVFQAACBnkAAAQMsgBACBkkAMAQMggBwCAkEEOAAAhgxwAAEIGOQAAhAxyAAAIXQe5r061Wq1Wq9Vqtdo37TpnDwAAkHBlBQAAQgY5AACEDHIAAAgZ5AAAEDLIAQAgZJADAEDIIAcAgJBBDgAAIYMcAABC10Huq1OtVqvVarVarfZNu87ZAwAAJFxZAQCAkEEOAAAhgxwAAEIGOQAAhAxyAAAIGeQAABAyyAEAIGSQAwBAyCAHAIDQdZD76lSr1Wq1Wq1Wq33TrnP2AAAACVdWAAAgZJADAEDIIAcAgJBBDgAAIYMcAABCBjkAAIQMcgAACBnkAAAQMsgBACB0HeS+OtVqtVqtVqvVat+065w9AABAwpUVAAAIGeQAABAyyAEAIGSQAwBAyCAHAICQQQ4AACGDHAAAQgY5AACEDHIAAAhdB7mvTrVarVar1Wq12jftOmcPAACQcGUFAABCBjkAAIQMcgAACBnkAAAQMsgBACBkkAMAQMggBwCAkEEOAAAhgxwAAELXQe6rU61Wq9VqtVqt9k27ztkDAAAkXFkBAICQQQ4AACGDHAAAQgY5AACEDHIAAAgZ5AAAEDLIAQAgZJADAEDIIAcAgNB1kPvqVKvVarVarVarfdOuc/YAAAAJV1YAACBkkAMAQMggBwCAkEEOAAAhgxwAAEIGOQAAhAxyAAAIGeQAABAyyAEAIHQd5L461Wq1Wq1Wq9Vq37TrnD0AAEDClRUAAAgZ5AAAEDLIAQAgZJADAEDIIAcAgJBBDgAAIYMcAABCBjkAAIQMcgAACF0Hua9OtVqtVqvVarXaN+06Zw8AAJBwZQUAAEIGOQAAhAxyAAAIGeQAABAyyAEAIGSQAwBAyCAHAICQQQ4AACGDHAAAQn8TgNstrEdwkQAAAABJRU5ErkJggg==";

const WalletIcon = withUnistyles(Ionicons, (theme) => ({
  color: theme.colors.onSurface,
  size: 26,
  name: "wallet" as const,
}));

const UniLinearGradient = withUnistyles(LinearGradient, (theme) => ({
  colors: [theme.colors.surfaceContainer, "transparent"] as const,
  locations: [0, 1] as const,
  end: { x: 0.5, y: 1 },
  start: { x: 1, y: 0 },
}));

type TProps = {
  address: Address;
};

const withDataProvider = (Component: React.ComponentType<TProps>) => {
  return observer(function () {
    const address = addressesStore.activeAddress;
    if (!address) return null;

    return <Component address={address} />;
  });
};

export const ActiveWalletBlock = withDataProvider(function ({ address }: TProps) {
  return (
    <ImageBackground source={{ uri: bgBase64 }} style={styles.wrapper}>
      <UniLinearGradient>
        <Box style={styles.container}>
          <Columns space={4} alignY="center">
            <Column flex="content">
              <WalletIcon />
            </Column>

            <Column flex="fluid">
              <Box rowGap={1}>
                <Text type="subtitle2" color="onSurfaceVariant">
                  Active Wallet
                </Text>

                <Text type="headline5">{formatAddress(address)}</Text>
              </Box>
            </Column>
          </Columns>
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
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
}));
