import { ScrollView } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { Block } from "components/block";
import { Text } from "components/typography/text";

export const Positions = function () {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text>Positions</Text>

      <Block type="active">
        <Text>Position 1</Text>
      </Block>

      <Block>
        <Text weight="semiBold">Position 2</Text>
      </Block>

      <Block>
        <Text weight="bold">Position 2</Text>
      </Block>
    </ScrollView>
  );
};

const styles = StyleSheet.create((theme, rt) => ({
  container: {
    paddingTop: rt.insets.top,
    paddingHorizontal: 12,
  },
}));
