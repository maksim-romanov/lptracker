import { ScrollView, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { InfoBlock } from "components/block";
import { Text } from "components/typography/text";
import { Title } from "components/typography/title";

export const Positions = function () {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text>Positions</Text>

      <InfoBlock type="active">
        <Title>Position 1</Title>
      </InfoBlock>

      <View style={styles.hstack}>
        <InfoBlock>
          <Text weight="semiBold">Position 2</Text>
        </InfoBlock>

        <InfoBlock>
          <Text weight="bold">Position 2</Text>
        </InfoBlock>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create((theme, rt) => ({
  container: {
    paddingTop: rt.insets.top,
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.md,
  },

  hstack: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
  },

  vstack: {
    flexDirection: "column",
    gap: theme.spacing.md,
  },
}));
