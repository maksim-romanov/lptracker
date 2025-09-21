import React from "react";

import { Box } from "@grapp/stacks";
import { router } from "expo-router";
import { observer } from "mobx-react-lite";
import { FlatList, TouchableOpacity } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { ActiveWalletBlock } from "components/blocks/active-wallet";
import { InfoBlock } from "components/blocks/info-block";
import { AddWalletItemBlock, WalletItemBlock } from "components/blocks/wallet-item";
import { ContextMenuButton } from "components/menu/context-menu";
import { Text } from "components/typography/text";
import { Wallet } from "domain/entities/wallets";
import { walletsStore } from "presentation/stores/wallets-store";

const ListFooter = function () {
  return (
    <Box marginTop={6} marginX={4}>
      <InfoBlock title="Track Any Wallet">
        Add any wallet address to track{" "}
        <Text color="primary" type="subtitle2">
          Uniswap
        </Text>{" "}
        V3 & V4 positions.{" "}
        <Text type="body2" color="onSurfaceVariant" underline>
          No private keys needed - view-only access
        </Text>
        .
      </InfoBlock>
    </Box>
  );
};

const ListHeader = function () {
  return (
    <>
      <Box gap={6} marginBottom={4} marginX={4} marginTop={6}>
        <ActiveWalletBlock />

        <Box gap={4}>
          <Text type="headline5">Add Wallet</Text>

          <TouchableOpacity onPress={() => router.push("/wallets/new")}>
            <AddWalletItemBlock />
          </TouchableOpacity>
        </Box>

        <Text type="headline5">Saved Wallets</Text>
      </Box>
    </>
  );
};

const Separator = () => <Box marginBottom={3} />;

export const WalletsScreen = observer(function () {
  return (
    <FlatList<Wallet>
      data={walletsStore.wallets}
      renderItem={({ item }) => {
        const deleteWallet = () => walletsStore.remove(item.address);

        const actions = [
          {
            key: "edit",
            label: "Update Name",
            onSelect: () => router.push({ pathname: "/wallets/[id]", params: { id: item.address } }),
          },
          { destructive: true, key: "delete", label: "Delete Wallet", onSelect: deleteWallet },
        ];

        return (
          <ContextMenuButton sections={[{ actions }]}>
            <Box marginX={4}>
              <TouchableOpacity onPress={() => walletsStore.setActive(item.address)}>
                <WalletItemBlock isActive={walletsStore.activeWallet === item.address} {...item} />
              </TouchableOpacity>
            </Box>
          </ContextMenuButton>
        );
      }}
      ListFooterComponent={ListFooter}
      ItemSeparatorComponent={Separator}
      ListHeaderComponent={ListHeader}
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    />
  );
});

const styles = StyleSheet.create((theme, rt) => ({
  contentContainer: {
    paddingBottom: theme.spacing.lg,
  },

  container: {
    backgroundColor: theme.colors.surface,
  },

  bottomSheetBackground: {
    backgroundColor: theme.colors.surfaceContainer,
  },

  bottomSheet: {},

  bottomSheetView: {
    paddingBottom: rt.insets.bottom || theme.spacing.lg,
  },

  handleIndicator: {
    backgroundColor: theme.colors.outline,
  },
}));
