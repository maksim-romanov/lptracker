import React from "react";

import { Box, Stack } from "@grapp/stacks";
import { FlatList, RefreshControl } from "react-native";
import { StyleSheet, withUnistyles } from "react-native-unistyles";
import tinycolor from "tinycolor2";
import { Address } from "viem";

import { BaseStats } from "components/base-stats";
import { EmptyState } from "components/empty-state";
import { LPCard } from "components/lp-card";
import { TotalBalance } from "components/total-balance";
import { Text } from "components/typography/text";
import { useUniswapV4Test } from "hooks/use-uniswap-v4-test";

const Separator = withUnistyles(Box, (theme) => ({ height: theme.spacing.md }));
const BrandRefreshControl = withUnistyles(RefreshControl, (theme) => ({
  tintColor: tinycolor(theme.colors.primary).darken(10).toRgbString(),
}));

const ListHeader = function () {
  return (
    <Box rowGap={6}>
      <Stack space={4}>
        <TotalBalance />
        <BaseStats />
      </Stack>

      <Text type="headline4">Your positions</Text>
    </Box>
  );
};

export const Positions = function () {
  const [refreshing, setRefreshing] = React.useState(false);
  // Simulate empty state - change this to [] to see the empty state
  const positions: number[] = [];

  // Test hook for Uniswap V4 positions
  useUniswapV4Test("0xeca0b7cdd7f2fe6389ee3720ae415d07abe0ed58" as Address, "arbitrum");

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  return (
    <FlatList<number>
      ref={null}
      contentContainerStyle={[styles.container]}
      data={positions}
      renderItem={({ item }) => <LPCard />}
      ListHeaderComponent={positions.length > 0 ? ListHeader : null}
      ListEmptyComponent={EmptyState}
      // stickyHeaderIndices={[0]}
      ListHeaderComponentStyle={styles.header}
      ItemSeparatorComponent={Separator}
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior="automatic"
      // contentInset={{ top: headerHeight }}
      refreshControl={<BrandRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    />
  );
};

const styles = StyleSheet.create((theme, rt) => ({
  container: {
    // paddingTop: rt.insets.top,
    paddingHorizontal: theme.spacing.lg,
    // paddingBottom: rt.insets.bottom,
    paddingBottom: theme.spacing.lg,
    flexGrow: 0.5,
  },
  header: {
    marginBottom: theme.spacing.lg,
  },
}));
