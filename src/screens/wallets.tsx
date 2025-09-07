import React from "react";

import Ionicons from "@expo/vector-icons/Ionicons";
import { Box, Stack } from "@grapp/stacks";
import { observer } from "mobx-react-lite";
import { FlatList, TouchableOpacity } from "react-native";
import ReanimatedSwipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import Animated, { Extrapolation, SharedValue, interpolate, useAnimatedStyle } from "react-native-reanimated";
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
const TrashIcon = withUnistyles(Ionicons, (theme) => ({
  name: "close-circle" as const,
  size: 32,
  color: theme.colors.error,
}));

export const Wallets = observer(function () {
  React.useEffect(() => {
    addressesStore.hydrate();
  }, []);

  return (
    <FlatList
      contentInsetAdjustmentBehavior="automatic"
      ListHeaderComponent={ListHeaderComponent}
      data={addressesStore.items}
      extraData={addressesStore.activeAddress}
      keyExtractor={(item) => item.address}
      ItemSeparatorComponent={Separator}
      renderItem={({ item }) => (
        <ReanimatedSwipeable
          overshootRight={true}
          rightThreshold={120}
          onSwipeableOpen={(direction) => {
            if (direction === "right") {
              addressesStore.remove(item.address);
            }
          }}
          renderRightActions={(progress) => (
            <SwipeDeleteAction progress={progress} onPress={() => addressesStore.remove(item.address)} />
          )}
        >
          <TouchableOpacity onPress={() => addressesStore.setActive(item.address)} activeOpacity={1}>
            <WalletItem
              address={item.address}
              name={item.name || "Wallet"}
              isActive={addressesStore.activeAddress === item.address}
            />
          </TouchableOpacity>
        </ReanimatedSwipeable>
      )}
      ListFooterComponent={<HelpBlock />}
      contentContainerStyle={styles.container}
      ListHeaderComponentStyle={styles.header}
      ListFooterComponentStyle={styles.footer}
    />
  );
});

type SwipeDeleteActionProps = {
  progress: SharedValue<number>;
  onPress: () => void;
};

const SwipeDeleteAction = ({ progress, onPress }: SwipeDeleteActionProps) => {
  const iconStyle = useAnimatedStyle(() => {
    const scale = interpolate(progress.value, [0, 1, 2], [0.8, 1, 1.4], Extrapolation.CLAMP);
    return { transform: [{ scale }] };
  });

  return (
    <TouchableOpacity onPress={onPress} style={styles.deleteAction} activeOpacity={1}>
      <Animated.View style={iconStyle}>
        <TrashIcon />
      </Animated.View>
    </TouchableOpacity>
  );
};

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

  deleteAction: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: theme.spacing.xl,
  },
}));
