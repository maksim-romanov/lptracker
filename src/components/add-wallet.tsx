import React from "react";

import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { Box, Inline } from "@grapp/stacks";
import { TouchableOpacity } from "react-native";
import { StyleSheet, withUnistyles } from "react-native-unistyles";

import { AddWalletModal } from "./add-wallet-modal";
import { Text } from "./typography/text";

const PlusIcon = withUnistyles(FontAwesome6, (theme) => ({
  color: theme.colors.primary,
  size: 24,
  name: "plus" as const,
}));

export const AddWallet = function () {
  const [isModalVisible, setIsModalVisible] = React.useState(false);

  const handleOpenModal = () => {
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
  };

  return (
    <>
      <TouchableOpacity onPress={handleOpenModal}>
        <Box style={styles.container} gap={2}>
          <Inline alignY="center" space={4}>
            <PlusIcon />
            <Text color="primary" type="headline6">
              Add New Wallet
            </Text>
          </Inline>
        </Box>
      </TouchableOpacity>

      <AddWalletModal isVisible={isModalVisible} onClose={handleCloseModal} />
    </>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.spacing.md,
  },
}));
