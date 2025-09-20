import React from "react";

import { BottomSheetBackdrop, BottomSheetBackdropProps, BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import { Box } from "@grapp/stacks";
import { FlatList, Keyboard, TouchableOpacity } from "react-native";
import { StyleSheet, withUnistyles } from "react-native-unistyles";
import { Address } from "viem";

import { ActiveWalletBlock } from "components/blocks/active-wallet";
import { InfoBlock } from "components/blocks/info-block";
import { AddWalletItemBlock, WalletItemBlock } from "components/blocks/wallet-item";
import { AddWalletForm } from "components/form/add-wallet";
import { Text } from "components/typography/text";

const ListFooter = function () {
  return (
    <Box marginTop={8}>
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

const renderBackdrop = (props: BottomSheetBackdropProps) => (
  <BottomSheetBackdrop {...props} onPress={() => Keyboard.dismiss()} appearsOnIndex={0} disappearsOnIndex={-1} />
);

const ListHeader = function () {
  const bottomSheetModalRef = React.useRef<BottomSheetModal>(null);

  const openSheet = React.useCallback(() => {
    bottomSheetModalRef.current?.present?.();
  }, []);

  return (
    <>
      <Box gap={6} marginBottom={4}>
        <ActiveWalletBlock />

        <Box gap={4}>
          <Text type="headline5">Add Wallet</Text>

          <TouchableOpacity onPress={openSheet}>
            <AddWalletItemBlock />
          </TouchableOpacity>
        </Box>

        <Text type="headline5">Saved Wallets</Text>
      </Box>

      <BottomSheetModal
        ref={bottomSheetModalRef}
        backgroundStyle={styles.bottomSheetBackground}
        style={styles.bottomSheet}
        handleIndicatorStyle={styles.handleIndicator}
        keyboardBlurBehavior="restore"
        keyboardBehavior="interactive"
        enableBlurKeyboardOnGesture
        backdropComponent={renderBackdrop}
        animateOnMount={false}
      >
        <BottomSheetView style={styles.bottomSheetView}>
          <AddWalletForm />
        </BottomSheetView>
      </BottomSheetModal>
    </>
  );
};

const Separator = withUnistyles(Box, (theme) => ({ height: theme.spacing.md }));

const addresses = [
  "0x1234567890123456789012345678901234567890",
  "0x1234567890123456789012345678901234567891",
  "0x1234567890123456789012345678901234567892",
] as const;

export const WalletsScreen = function () {
  const [activeAddress, setActiveAddress] = React.useState<Address>(addresses[0]);

  return (
    <FlatList
      data={addresses}
      renderItem={({ item }) => (
        <TouchableOpacity onPress={() => setActiveAddress(item)}>
          <WalletItemBlock isActive={activeAddress === item} address={item} />
        </TouchableOpacity>
      )}
      ListFooterComponent={ListFooter}
      ItemSeparatorComponent={Separator}
      ListHeaderComponent={ListHeader}
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    />
  );
};

const styles = StyleSheet.create((theme, rt) => ({
  contentContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
  },

  container: {
    paddingTop: theme.spacing.lg,
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
