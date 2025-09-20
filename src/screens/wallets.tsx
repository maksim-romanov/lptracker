import React from "react";

import { BottomSheetBackdrop, BottomSheetBackdropProps, BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import { Box } from "@grapp/stacks";
import { observer } from "mobx-react-lite";
import { FlatList, Keyboard, TouchableOpacity } from "react-native";
import { StyleSheet, withUnistyles } from "react-native-unistyles";

import { ActiveWalletBlock } from "components/blocks/active-wallet";
import { InfoBlock } from "components/blocks/info-block";
import { AddWalletItemBlock, WalletItemBlock } from "components/blocks/wallet-item";
import { AddWalletForm } from "components/form/add-wallet";
import { ContextMenuButton } from "components/menu/context-menu";
import { Text } from "components/typography/text";
import { ERC20Address } from "domain/entities/addresses";
import { addressesStore } from "presentation/stores/addresses-store";

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

export const WalletsScreen = observer(function () {
  return (
    <FlatList<ERC20Address>
      data={addressesStore.items}
      renderItem={({ item }) => (
        <ContextMenuButton
          sections={[
            {
              label: "Wallet",
              actions: [
                {
                  key: "delete",
                  label: "Delete",
                  onSelect: () => addressesStore.remove(item.address),
                },
              ],
            },
          ]}
        >
          <TouchableOpacity onPress={() => addressesStore.setActive(item.address)}>
            <WalletItemBlock isActive={addressesStore.activeAddress === item.address} {...item} />
          </TouchableOpacity>
        </ContextMenuButton>
      )}
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
