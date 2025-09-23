import React from "react";

import { Box } from "@grapp/stacks";
import { StyleSheet } from "react-native-unistyles";

import type { PositionData } from "./types";
import { WarningTag } from "../tag/presets";
import { Text } from "../typography/text";

interface UnknownProtocolCardProps {
  data: PositionData;
}

export const UnknownProtocolCard: React.FC<UnknownProtocolCardProps> = ({ data }) => {
  return (
    <Box style={styles.container} rowGap={8}>
      <Text type="headline4">Unknown Protocol</Text>
      <Text type="body2" color="onSurfaceVariant">
        Protocol: {data.protocol}
      </Text>
      <Text type="body2" color="onSurfaceVariant">
        Chain ID: {data.chainId}
      </Text>
      <WarningTag>Unsupported</WarningTag>
    </Box>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderRadius: 12,
    borderColor: theme.colors.warning,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
}));
