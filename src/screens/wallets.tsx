import React from "react";

import { Box, Stack } from "@grapp/stacks";
import { FlatList, TouchableOpacity } from "react-native";
import { StyleSheet, withUnistyles } from "react-native-unistyles";

import { ActiveWallet } from "components/active-wallet";
import { AddWallet } from "components/add-wallet";
import { Text } from "components/typography/text";
import { WalletItem } from "components/wallet-item";

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

const walletsData = [
  {
    name: "Wallet 1",
    address: "0x1234567890123456789012345678901234567890",
  },
  {
    name: "Wallet 2",
    address: "0x9012345678901234567890123456789012345678",
  },
];

const Separator = withUnistyles(Box, (theme) => ({ height: theme.spacing.md }));

export const Wallets = function () {
  const [activeWallet, setActiveWallet] = React.useState<string>(walletsData[0].address);

  return (
    <FlatList
      contentInsetAdjustmentBehavior="automatic"
      ListHeaderComponent={ListHeaderComponent}
      data={walletsData}
      ItemSeparatorComponent={Separator}
      renderItem={({ item }) => (
        <TouchableOpacity>
          <WalletItem {...item} isActive={activeWallet === item.address} />
        </TouchableOpacity>
      )}
      contentContainerStyle={styles.container}
      ListHeaderComponentStyle={styles.header}
    />
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    paddingHorizontal: theme.spacing.lg,
  },

  header: {
    marginBottom: theme.spacing.lg,
  },
}));
