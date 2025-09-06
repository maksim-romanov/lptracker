import { ScrollView } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { Col, Container, Row } from "react-native-unistyles-grid";

import { InfoBlock } from "components/block";
import { Text } from "components/typography/text";

export const Positions = function () {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Container>
        <InfoBlock type="primary">
          <Text type="headline2" color="primary">
            Position 1
          </Text>
        </InfoBlock>

        <Row>
          <Col>
            <InfoBlock type="primary">
              <Text type="subtitle1" color="primary">
                Position 2
              </Text>
            </InfoBlock>
          </Col>

          <Col>
            <InfoBlock>
              <Text type="subtitle2">Position 2</Text>
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
