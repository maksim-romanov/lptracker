import React from "react";

import { Box, Stack } from "@grapp/stacks";
import { classValidatorResolver } from "@hookform/resolvers/class-validator";
import { IsEthereumAddress, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { router } from "expo-router";
import { observer } from "mobx-react-lite";
import { Controller, useForm } from "react-hook-form";
import { Keyboard } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { Address } from "viem";

import { Button } from "components/button/button";
import { Text } from "components/typography/text";
import { walletsStore } from "presentation/stores/wallets-store";

import { TextInput } from "./adapters/text-input";

class NewWalletForm {
  @IsNotEmpty()
  @IsEthereumAddress()
  walletAddress?: Address;

  @IsOptional()
  @IsString()
  walletName?: string;
}

const resolver = classValidatorResolver(NewWalletForm);

type TAddWalletForm = {
  address?: Address;
  walletName?: string;
  onSubmit: (data: NewWalletForm) => void;
  onClose: () => void;
  isEditing?: boolean;
};

const withDataProvider = (Component: React.ComponentType<TAddWalletForm>) => {
  return observer(({ address, ...rest }: Pick<TAddWalletForm, "address" | "isEditing">) => {
    const isExistingWallet = address && walletsStore.isExistingWallet(address);
    const existingName = address && walletsStore.getWalletName(address);

    const isEditing = isExistingWallet || rest.isEditing;

    const handleClose = () => {
      Keyboard.dismiss();
      router.dismiss();
    };

    const handleSubmit = async (data: NewWalletForm) => {
      Keyboard.dismiss();

      if (!data.walletAddress) throw new Error("Wallet address is required");

      if (isEditing && address) {
        // When editing: update the wallet
        await walletsStore.update(address, { address: data.walletAddress, name: data.walletName });
      } else {
        // When adding: just add new wallet
        await walletsStore.add({ address: data.walletAddress, name: data.walletName });
      }

      handleClose();
    };

    return (
      <Component
        onSubmit={handleSubmit}
        onClose={handleClose}
        walletName={existingName}
        address={address}
        isEditing={isEditing}
      />
    );
  });
};

export const AddWalletForm = withDataProvider(
  ({ address, walletName, onSubmit, onClose, isEditing }: TAddWalletForm) => {
    // const { close } = useBottomSheet();

    const {
      control,
      handleSubmit,
      formState: { isValid },
      setValue,
    } = useForm({
      mode: "onChange",
      resolver,
      defaultValues: {
        walletAddress: address,
        walletName: walletName,
      },
    });

    React.useEffect(() => {
      if (address) setValue("walletAddress", address, { shouldValidate: true });
    }, [address]);

    return (
      <Box gap={4} style={styles.container}>
        <Box gap={4}>
          <Box marginX={2}>
            <Text type="headline5">{isEditing ? "Update Wallet" : "Add New Wallet"}</Text>
          </Box>

          <Controller
            control={control}
            name="walletAddress"
            render={({ field, fieldState }) => (
              <TextInput
                {...field}
                autoFocus={!isEditing}
                disabled={isEditing}
                // ref={addressRef}
                // Component={BottomSheetTextInput}
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
                autoFocus={isEditing}
                // Component={BottomSheetTextInput}
                error={fieldState.error?.message}
                onChangeText={field.onChange}
                placeholder="Wallet name (e.g., My Wallet)"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="default"
              />
            )}
          />
        </Box>

        <Stack horizontal space={4}>
          <Box flex="fluid">
            <Button type="secondary" onPress={onClose}>
              Cancel
            </Button>
          </Box>

          <Box flex="fluid">
            <Button type="primary" onPress={handleSubmit(onSubmit)} disabled={!isValid}>
              {isEditing ? "Update Wallet" : "Add Wallet"}
            </Button>
          </Box>
        </Stack>
      </Box>
    );
  },
);

const styles = StyleSheet.create((theme) => ({
  container: {
    paddingHorizontal: theme.spacing.md,
  },
}));
