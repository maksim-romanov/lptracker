import React from "react";

import { Box, Stack } from "@grapp/stacks";
import { TextInput, TouchableOpacity } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import Modal from "react-native-modal";
import { StyleSheet, withUnistyles } from "react-native-unistyles";

import { Text } from "./typography/text";

interface AddWalletModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const UniKeyboardAvoidingView = withUnistyles(KeyboardAvoidingView, (theme, rt) => ({
  behavior: "padding" as const,
  keyboardVerticalOffset: -rt.insets.bottom,
}));

export const AddWalletModal: React.FC<AddWalletModalProps> = ({ isVisible, onClose }) => {
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
      avoidKeyboard={false}
      useNativeDriverForBackdrop={true}
    >
      <UniKeyboardAvoidingView style={styles.keyboardAvoidingView}>
        <Box style={styles.container}>
          <Box style={styles.handleBar} />

          <Stack space={8}>
            <Stack space={4}>
              <Text type="headline5">Add New Wallet</Text>

              <Box style={styles.inputContainer}>
                <TextInput
                  autoFocus
                  style={styles.input}
                  placeholder="Enter wallet address (e.g., 0x1234...7890)"
                  placeholderTextColor="#9B9B9B"
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="default"
                />
              </Box>
            </Stack>

            <Stack horizontal space={4}>
              <Box flex="fluid">
                <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                  <Text color="onSurface" type="body1">
                    Cancel
                  </Text>
                </TouchableOpacity>
              </Box>

              <Box flex="fluid">
                <TouchableOpacity style={styles.addButton}>
                  <Text color="onPrimary" type="body1">
                    Add Wallet
                  </Text>
                </TouchableOpacity>
              </Box>
            </Stack>
          </Stack>
        </Box>
      </UniKeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create((theme, rt) => ({
  modal: {
    justifyContent: "flex-end",
    margin: 0,
  },

  keyboardAvoidingView: {},

  container: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.spacing.lg,
    borderTopRightRadius: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: rt.insets.bottom + theme.spacing.lg,
  },

  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: theme.colors.outline,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: theme.spacing.lg,
  },

  inputContainer: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.outline,
  },

  input: {
    padding: theme.spacing.lg,
    fontSize: 16,
    color: theme.colors.onSurface,
    fontFamily: "Inter-Regular",
  },

  cancelButton: {
    padding: theme.spacing.lg,
    borderRadius: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.outline,
    alignItems: "center",
  },

  addButton: {
    padding: theme.spacing.lg,
    borderRadius: theme.spacing.md,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
  },
}));
