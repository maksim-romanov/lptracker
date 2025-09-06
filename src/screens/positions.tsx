import React from "react";

import { Box } from "@grapp/stacks";
import { useHeaderHeight } from "@react-navigation/elements";
import { FlatList } from "react-native";
import { useBottomTabBarHeight } from "react-native-bottom-tabs";
import { StyleSheet, withUnistyles } from "react-native-unistyles";

import { LPCard } from "components/lp-card";
import { TotalBalance } from "components/total-balance";

const Separator = withUnistyles(Box, (theme) => ({ height: theme.spacing.md }));

export const Positions = function () {
  const tabBarHeight = useBottomTabBarHeight();
  const headerHeight = useHeaderHeight();

  return (
    <FlatList
      ref={null}
      contentContainerStyle={[styles.container({ tabBarHeight })]}
      data={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
      renderItem={({ item }) => <LPCard />}
      ListHeaderComponent={TotalBalance}
      // stickyHeaderIndices={[0]}
      ListHeaderComponentStyle={styles.header}
      ItemSeparatorComponent={Separator}
      showsVerticalScrollIndicator={false}
      contentInset={{ top: headerHeight }}
    />
  );
};

const styles = StyleSheet.create((theme, rt) => ({
  container: ({ tabBarHeight }: { tabBarHeight: number }) => ({
    // paddingTop: rt.insets.top,
    paddingHorizontal: theme.spacing.lg,
    // paddingBottom: rt.insets.bottom,
    paddingBottom: tabBarHeight + theme.spacing.lg,
  }),
  header: {
    marginBottom: theme.spacing.lg,
  },
}));
