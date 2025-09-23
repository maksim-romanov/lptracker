import { Box } from "@grapp/stacks";
import { observer } from "mobx-react-lite";
import { FlatList, TouchableOpacity } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { LPPositionBlock } from "components/blocks/lp-position";
import { TotalLockedBlock } from "components/blocks/total-locked";
import { useMultiChainPositionsAuto } from "features/uniswap-v4/presentation/hooks";
import { walletsStore } from "presentation/stores/wallets-store";

const Separator = () => <Box marginBottom={3} />;

const ListHeader = function () {
  return (
    <Box marginY={6} marginX={4}>
      <TotalLockedBlock />
    </Box>
  );
};

export const PositionsScreen = observer(function () {
  const activeWallet = walletsStore.activeWallet || null;
  const { data } = useMultiChainPositionsAuto(activeWallet);

  const positionsIds = data?.positionsWithChain || [];

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      data={positionsIds}
      renderItem={({ item }) => (
        <Box marginX={4}>
          <TouchableOpacity>
            <LPPositionBlock {...item} />
          </TouchableOpacity>
        </Box>
      )}
      ListHeaderComponent={ListHeader}
      ItemSeparatorComponent={Separator}
    />
  );
});

const styles = StyleSheet.create((theme, rt) => ({
  contentContainer: {
    paddingBottom: theme.spacing.lg,
  },

  container: {
    backgroundColor: theme.colors.surface,
  },
}));
