import React from "react";

import { Box, Stack } from "@grapp/stacks";
import { FlatList, TouchableOpacity } from "react-native";
import Modal from "react-native-modal";
import { StyleSheet, withUnistyles } from "react-native-unistyles";

import { addressesStore } from "presentation/stores/addresses-store";

import { Text } from "./typography/text";
import { WalletItem } from "./wallet-item";

interface SelectWalletModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const Separator = withUnistyles(Box, (theme) => ({ height: theme.spacing.md }));

export const SelectWalletModal: React.FC<SelectWalletModalProps> = ({ isVisible, onClose }) => {
  const handleSelect = async (address: string) => {
    await addressesStore.setActive(address);
    onClose();
  };

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      hasBackdrop
      onSwipeComplete={onClose}
      swipeDirection={["down"]}
      style={styles.modal}
      backdropOpacity={0.5}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      useNativeDriverForBackdrop={true}
    >
      <Box style={styles.container}>
        <Box style={styles.handleBar} />
        <Stack space={6}>
          <Text type="headline5">Select Active Wallet</Text>

          <FlatList
            data={addressesStore.items}
            ItemSeparatorComponent={Separator}
            keyExtractor={(item) => item.address}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => handleSelect(item.address)}>
                <WalletItem
                  address={item.address}
                  name={item.name || "Wallet"}
                  isActive={addressesStore.activeAddress === item.address}
                />
              </TouchableOpacity>
            )}
          />
        </Stack>
      </Box>
    </Modal>
  );
};

const styles = StyleSheet.create((theme) => ({
  modal: {
    justifyContent: "flex-end",
    margin: 0,
  },

  container: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.spacing.lg,
    borderTopRightRadius: theme.spacing.lg,
    padding: theme.spacing.lg,
  },

  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: theme.colors.outline,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: theme.spacing.lg,
  },
}));
