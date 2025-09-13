import React, { useEffect } from "react";

import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { Box, Stack } from "@grapp/stacks";
import { Canvas, Fill, LinearGradient, interpolateColors, vec } from "@shopify/react-native-skia";
import { router } from "expo-router";
import { TouchableOpacity, useWindowDimensions } from "react-native";
import Animated, {
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
} from "react-native-reanimated";
import { StyleSheet, withUnistyles } from "react-native-unistyles";

import { Text } from "components/typography/text";

const NotFoundIcon = withUnistyles(FontAwesome6, (theme) => ({
  color: theme.colors.primary,
  size: 64,
  name: "triangle-exclamation",
}));

const startColors = [
  "rgba(255, 0, 122, 0.15)", // primary with low opacity
  "rgba(255, 26, 138, 0.1)",
  "rgba(99, 148, 251, 0.1)",
  "rgba(34, 193, 195, 0.1)",
];

const endColors = [
  "rgba(0, 212, 255, 0.1)",
  "rgba(253, 187, 45, 0.1)",
  "rgba(252, 70, 107, 0.15)",
  "rgba(252, 176, 69, 0.1)",
];

export default function NotFoundScreen() {
  const { width, height } = useWindowDimensions();
  const colorsIndex = useSharedValue(0);
  const iconScale = useSharedValue(1);

  useEffect(() => {
    colorsIndex.value = withRepeat(
      withTiming(startColors.length - 1, {
        duration: 6000,
      }),
      -1,
      true,
    );

    iconScale.value = withRepeat(
      withSequence(withTiming(1.1, { duration: 2000 }), withTiming(1, { duration: 2000 })),
      -1,
      true,
    );
  }, []);

  const gradientColors = useDerivedValue(() => {
    return [
      interpolateColors(colorsIndex.value, [0, 1, 2, 3], startColors),
      interpolateColors(colorsIndex.value, [0, 1, 2, 3], endColors),
    ];
  });

  return (
    <>
      <Canvas style={StyleSheet.absoluteFill}>
        <Fill>
          <LinearGradient start={vec(0, 0)} end={vec(width, height)} colors={gradientColors} />
        </Fill>
      </Canvas>

      <Box style={styles.container} flex="fluid" alignX="center" alignY="center">
        <Stack space={8} align="center">
          <Animated.View style={{ transform: [{ scale: iconScale }] }}>
            <Box style={styles.iconContainer} alignX="center" alignY="center">
              <NotFoundIcon />
            </Box>
          </Animated.View>

          <Stack space={4} align="center">
            <Text type="headline3" color="onSurface" style={styles.centeredText}>
              This screen doesn&apos;t exist
            </Text>
            <Text type="body1" color="outline" style={styles.centeredText}>
              The page you&apos;re looking for could not be found.
            </Text>
          </Stack>

          <TouchableOpacity style={styles.button} onPress={() => router.replace("/")}>
            <Text type="headline6" color="onPrimary">
              Go to home screen
            </Text>
          </TouchableOpacity>
        </Stack>
      </Box>
    </>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    paddingHorizontal: theme.spacing.xl,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: theme.colors.outline,
    borderStyle: "dashed",
  },
  centeredText: {
    textAlign: "center",
  },
  button: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.spacing.md,
  },
}));
