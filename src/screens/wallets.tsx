import React from "react";

import { Box, Stack } from "@grapp/stacks";
import { observer } from "mobx-react-lite";
import { FlatList, TouchableOpacity } from "react-native";
import { StyleSheet, withUnistyles } from "react-native-unistyles";

import { ActiveWallet } from "components/active-wallet";
import { AddWallet } from "components/add-wallet";
import { HelpBlock } from "components/help-block";
import { Text } from "components/typography/text";
import { WalletItem } from "components/wallet-item";
import { addressesStore } from "presentation/stores/addresses-store";

const ListHeaderComponent = () => {
  return (
    <Box gap={6}>
      <ActiveWallet />

      <Stack space={4}>
        <Text type="headline5">Add Wallet</Text>
        <AddWallet />
      </Stack>

      <Text type="headline5">Saved Wallets</Text>
    </Box>
  );
};
const Separator = withUnistyles(Box, (theme) => ({ height: theme.spacing.md }));

export const Wallets = observer(function () {
  React.useEffect(() => {
    addressesStore.hydrate();
  }, []);

  return (
    <FlatList
      contentInsetAdjustmentBehavior="automatic"
      ListHeaderComponent={ListHeaderComponent}
      data={addressesStore.items}
      extraData={addressesStore.activeAddressId}
      ItemSeparatorComponent={Separator}
      renderItem={({ item }) => (
        <TouchableOpacity onPress={() => addressesStore.setActive(item.id)}>
          <WalletItem
            address={item.address}
            name={item.name || "Wallet"}
            isActive={addressesStore.activeAddressId === item.id}
          />
        </TouchableOpacity>
      )}
      ListFooterComponent={<HelpBlock />}
      contentContainerStyle={styles.container}
      ListHeaderComponentStyle={styles.header}
      ListFooterComponentStyle={styles.footer}
    />
  );
});

const styles = StyleSheet.create((theme) => ({
  container: {
    paddingHorizontal: theme.spacing.lg,
  },

  header: {
    marginBottom: theme.spacing.lg,
  },

  footer: {
    marginTop: theme.spacing.xxl * 2,
  },
}));
