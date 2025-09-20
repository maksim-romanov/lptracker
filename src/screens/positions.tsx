import { Box } from "@grapp/stacks";
import { FlatList, TouchableOpacity } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { LPPositionBlock } from "components/blocks/lp-position";
import { TotalLockedBlock } from "components/blocks/total-locked";

const Separator = () => <Box marginBottom={3} />;

const ListHeader = function () {
  return (
    <Box marginY={6} marginX={4}>
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
        <Box marginX={4}>
          <TouchableOpacity>
            <LPPositionBlock />
          </TouchableOpacity>
        </Box>
      )}
      ListHeaderComponent={ListHeader}
      ItemSeparatorComponent={Separator}
    />
  );
};

const styles = StyleSheet.create((theme, rt) => ({
  contentContainer: {
    paddingBottom: theme.spacing.lg,
  },

  container: {
    backgroundColor: theme.colors.surface,
  },
}));
