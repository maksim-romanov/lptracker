import { ScrollView } from "react-native";
import { StyleSheet, UnistylesRuntime } from "react-native-unistyles";
import { Col, Container, Row } from "react-native-unistyles-grid";

import { InfoBlock } from "components/block";
import { Text } from "components/typography/text";
import { Title } from "components/typography/title";

export const Positions = function () {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Container>
        <Text>
          {" "}
          Current breakpoint is {UnistylesRuntime.breakpoint} {UnistylesRuntime.screen.width}{" "}
          {UnistylesRuntime.screen.height}
        </Text>

        <InfoBlock type="active">
          <Title>Position 1</Title>
        </InfoBlock>

        <Row>
          <Col>
            <InfoBlock>
              <Text weight="semiBold">Position 2</Text>
            </InfoBlock>
          </Col>

          <Col>
            <InfoBlock>
              <Text weight="bold">Position 2</Text>
            </InfoBlock>
          </Col>
        </Row>
      </Container>
    </ScrollView>
  );
};

const styles = StyleSheet.create((theme, rt) => ({
  container: {
    paddingTop: rt.insets.top,
    gap: theme.spacing.md,
  },
}));
