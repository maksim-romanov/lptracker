import React from "react";

import { Box } from "@grapp/stacks";
import { FlatList } from "react-native";
import { StyleSheet, withUnistyles } from "react-native-unistyles";

import { LPCard } from "components/lp-card";

// import { Container } from "react-native-unistyles-grid";

// import { InfoBlock } from "components/block";
// import { LPCard } from "components/lp-card";
// import { Text } from "components/typography/text";

const Separator = withUnistyles(Box, (theme) => ({ height: theme.spacing.md }));

export const Positions = function () {
  return (
    <FlatList
      ref={null}
      contentContainerStyle={styles.container}
      data={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
      renderItem={({ item }) => <LPCard />}
      ItemSeparatorComponent={Separator}
    />
  );
};

const styles = StyleSheet.create((theme, rt) => ({
  container: {
    paddingTop: rt.insets.top,
  },
}));
