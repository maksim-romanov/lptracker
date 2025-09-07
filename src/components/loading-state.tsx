import { useEffect } from "react";

import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { Box, Stack } from "@grapp/stacks";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";
import { StyleSheet, withUnistyles } from "react-native-unistyles";

import { Text } from "./typography/text";

const SpinnerIcon = withUnistyles(FontAwesome6, (theme) => ({
  color: theme.colors.primary,
  size: 48,
  name: "circle-notch",
}));

export const LoadingState = function () {
  const rotation = useSharedValue(0);
  const pulse = useSharedValue(1);
  const ring1 = useSharedValue(0.6);
  const ring2 = useSharedValue(0.6);

  useEffect(() => {
    rotation.value = withRepeat(withTiming(360, { duration: 1400, easing: Easing.linear }), -1, false);
    pulse.value = withRepeat(withTiming(1.06, { duration: 1200, easing: Easing.inOut(Easing.quad) }), -1, true);
    ring1.value = withRepeat(withTiming(1.2, { duration: 1400, easing: Easing.inOut(Easing.cubic) }), -1, true);
    ring2.value = withRepeat(withTiming(1.3, { duration: 1700, easing: Easing.inOut(Easing.cubic) }), -1, true);
  }, []);

  const rotateStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }, { scale: pulse.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    shadowOpacity: 0.15 + (pulse.value - 1) * 1.2,
    shadowRadius: 12 + (pulse.value - 1) * 20,
  }));

  const ring1Style = useAnimatedStyle(() => ({
    transform: [{ scale: ring1.value }],
    opacity: 0.55 - (ring1.value - 1) * 0.9,
  }));

  const ring2Style = useAnimatedStyle(() => ({
    transform: [{ scale: ring2.value }],
    opacity: 0.35 - (ring2.value - 1) * 0.6,
  }));

  return (
    <Box style={styles.container}>
      <Stack space={8} align="center">
        <Animated.View style={[styles.iconContainer, glowStyle]}>
          <Animated.View style={rotateStyle}>
            <SpinnerIcon />
          </Animated.View>
          <Animated.View style={[styles.ring, styles.ringPrimary, ring1Style]} />
          <Animated.View style={[styles.ring, styles.ringSecondary, ring2Style]} />
        </Animated.View>

        <Stack space={4} align="center">
          <Text type="headline3" color="onSurface">
            Scrapping uniswap
          </Text>

          <Text type="body1" color="outline" style={styles.centeredText}>
            We are searching v3 and v4 LP positions on L1 and L2 chains
          </Text>
        </Stack>
      </Stack>
    </Box>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.giant,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.surface,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: theme.colors.outline,
    borderStyle: "solid",
    position: "relative",
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
  },
  centeredText: {
    textAlign: "center",
  },
  progressContainer: {
    marginTop: theme.spacing.xxl,
  },
  ring: {
    position: "absolute",
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2,
  },
  ringPrimary: {
    borderColor: theme.colors.primary,
  },
  ringSecondary: {
    borderColor: theme.colors.outline,
  },
}));
