import React from "react";

import { Box, Stack } from "@grapp/stacks";
import { classValidatorResolver } from "@hookform/resolvers/class-validator";
import { IsEthereumAddress, IsNotEmpty, IsString } from "class-validator";
import { Controller, useForm } from "react-hook-form";
import { InteractionManager, Keyboard, TextInput as RNTextInput, TouchableOpacity } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import Modal from "react-native-modal";
import { StyleSheet, withUnistyles } from "react-native-unistyles";

import { addressesStore } from "presentation/stores/addresses-store";
import { TextInput } from "./text-input";
import { Text } from "./typography/text";

interface AddWalletModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const UniKeyboardAvoidingView = withUnistyles(KeyboardAvoidingView, (theme, rt) => ({
  behavior: "padding" as const,
  keyboardVerticalOffset: -rt.insets.bottom,
}));

class NewWalletForm {
  @IsNotEmpty()
  @IsEthereumAddress()
  walletAddress?: string;

  @IsString()
  walletName?: string;
}

const resolver = classValidatorResolver(NewWalletForm);

export const AddWalletModal: React.FC<AddWalletModalProps> = ({ isVisible, onClose }) => {
  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = useForm({
    mode: "onChange",
    defaultValues: { walletAddress: "", walletName: "" },
    resolver,
  });
  const addressRef = React.useRef<RNTextInput>(null);
  const onSubmit = async (data: NewWalletForm) => {
    await addressesStore.add({
      address: data.walletAddress!,
      name: data.walletName || "Wallet",
    });
    onClose();
  };

  const handleClose = () => {
    Keyboard.dismiss();
    onClose();
  };

  React.useEffect(() => {
    if (isVisible) {
      InteractionManager.runAfterInteractions(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        addressRef.current?.focus();
      });
    }
  }, [isVisible]);

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={handleClose}
      hasBackdrop
      onSwipeComplete={handleClose}
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

              <Controller
                control={control}
                name="walletAddress"
                render={({ field, fieldState }) => (
                  <TextInput
                    {...field}
                    ref={addressRef}
                    error={fieldState.error?.message}
                    onChangeText={field.onChange}
                    placeholder="Address (e.g., 0x1234...7890)"
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="default"
                  />
                )}
              />

              <Controller
                control={control}
                name="walletName"
                render={({ field, fieldState }) => (
                  <TextInput
                    {...field}
                    error={fieldState.error?.message}
                    onChangeText={field.onChange}
                    placeholder="Wallet name (e.g., My Wallet)"
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="default"
                  />
                )}
              />
            </Stack>

            <Stack horizontal space={4}>
              <Box flex="fluid">
                <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
                  <Text color="onSurface" type="body1">
                    Cancel
                  </Text>
                </TouchableOpacity>
              </Box>

              <Box flex="fluid">
                <TouchableOpacity
                  style={[styles.addButton, !isValid && { opacity: 0.5 }]}
                  onPress={handleSubmit(onSubmit)}
                  disabled={!isValid}
                >
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

  errorText: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
    color: "#FF6B6B", // Red color for error text
  },
}));
