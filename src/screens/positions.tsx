import { Box } from "@grapp/stacks";
import { FlatList, TouchableOpacity } from "react-native";
import { StyleSheet, withUnistyles } from "react-native-unistyles";

import { LPPositionBlock } from "components/blocks/lp-position";
import { TotalLockedBlock } from "components/blocks/total-locked";

const Separator = withUnistyles(Box, (theme) => ({ height: theme.spacing.md }));

const ListHeader = function () {
  return (
    <Box marginBottom={6}>
      <TotalLockedBlock />
    </Box>
  );
};

export const PositionsScreen = function () {
  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      data={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
      renderItem={({ item }) => (
        <TouchableOpacity>
          <LPPositionBlock />
        </TouchableOpacity>
      )}
      ListHeaderComponent={ListHeader}
      ItemSeparatorComponent={Separator}
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

  header: {
    paddingBottom: theme.spacing.lg,
  },

  bgHeader: {
    width: 200,
    height: 200,
    position: "absolute",
  },
}));
