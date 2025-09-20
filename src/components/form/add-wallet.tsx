import React from "react";

import { BottomSheetTextInput, useBottomSheet } from "@gorhom/bottom-sheet";
import { Box, Stack } from "@grapp/stacks";
import { classValidatorResolver } from "@hookform/resolvers/class-validator";
import { IsEthereumAddress, IsNotEmpty, IsString } from "class-validator";
import { Controller, useForm } from "react-hook-form";
import { Keyboard, TextInput as RNTextInput } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { Button } from "components/button/button";
import { Text } from "components/typography/text";

import { TextInput } from "./adapters/text-input";

class NewWalletForm {
  @IsNotEmpty()
  @IsEthereumAddress()
  walletAddress?: string;

  @IsString()
  walletName?: string;
}

const resolver = classValidatorResolver(NewWalletForm);

export const AddWalletForm = () => {
  const addressRef = React.useRef<RNTextInput>(null);
  const { close } = useBottomSheet();

  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = useForm({
    mode: "onChange",
    defaultValues: { walletAddress: "", walletName: "" },
    resolver,
  });

  const onSubmit = (data: NewWalletForm) => {
    console.log(data);
    handleClose();
  };

  const handleClose = () => {
    Keyboard.dismiss();
    close();
  };

  React.useEffect(() => {
    setImmediate(async () => {
      await new Promise((resolve) => setTimeout(resolve, 250));
      addressRef.current?.focus();
    });
  }, []);

  return (
    <Box gap={4} style={styles.container}>
      <Box gap={4}>
        <Text type="headline5">Add New Wallet</Text>

        <Controller
          control={control}
          name="walletAddress"
          render={({ field, fieldState }) => (
            <TextInput
              {...field}
              ref={addressRef}
              Component={BottomSheetTextInput}
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
              Component={BottomSheetTextInput}
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
          <Button type="secondary" onPress={handleClose}>
            Cancel
          </Button>
        </Box>

        <Box flex="fluid">
          <Button type="primary" onPress={handleSubmit(onSubmit)} disabled={!isValid}>
            Add Wallet
          </Button>
        </Box>
      </Stack>
    </Box>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    paddingHorizontal: theme.spacing.md,
  },
}));
