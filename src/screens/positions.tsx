import React from "react";

import { Box, Stack } from "@grapp/stacks";
import { FlatList, RefreshControl } from "react-native";
import { StyleSheet, withUnistyles } from "react-native-unistyles";
import tinycolor from "tinycolor2";

import { BaseStats } from "components/base-stats";
import { LPCard } from "components/lp-card";
import { TotalBalance } from "components/total-balance";
import { Text } from "components/typography/text";

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

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  return (
    <FlatList
      ref={null}
      contentContainerStyle={[styles.container]}
      data={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
      renderItem={({ item }) => <LPCard />}
      ListHeaderComponent={ListHeader}
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
  },
  header: {
    marginBottom: theme.spacing.lg,
  },
}));
