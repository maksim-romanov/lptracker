import React, { useEffect } from "react";

import { Box, Stack } from "@grapp/stacks";
import { LinearGradient } from "expo-linear-gradient";
import { TouchableOpacity, View } from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { StyleSheet } from "react-native-unistyles";

import UnicornWhite from "assets/icons/unicorn-white.svg";
import { AddWalletModal } from "components/add-wallet-modal";

import { Text } from "../components/typography/text";

export const WelcomeScreen = function () {
  const [isVisible, setIsVisible] = React.useState(false);

  // Animation values
  const iconScale = useSharedValue(0);
  const iconOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(30);
  const buttonOpacity = useSharedValue(0);
  const buttonScale = useSharedValue(0.8);
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    // Icon entrance animation
    iconScale.value = withDelay(200, withTiming(1, { duration: 800 }));
    iconOpacity.value = withDelay(200, withTiming(1, { duration: 600 }));

    // Text entrance animation
    textOpacity.value = withDelay(600, withTiming(1, { duration: 600 }));
    textTranslateY.value = withDelay(600, withTiming(0, { duration: 600 }));

    // Button entrance animation
    buttonOpacity.value = withDelay(1200, withTiming(1, { duration: 600 }));
    buttonScale.value = withDelay(1200, withTiming(1, { duration: 600 }));

    // Continuous pulse animation for icon
    pulseScale.value = withDelay(
      1500,
      withRepeat(withSequence(withTiming(1.05, { duration: 1000 }), withTiming(1, { duration: 1000 })), -1, false),
    );
  }, [buttonOpacity, buttonScale, iconOpacity, iconScale, pulseScale, textOpacity, textTranslateY]);

  const handleAddWalletPress = () => {
    // TODO: In the future, a modal window for adding a wallet will open here
    console.log("Add wallet modal will open here");
  };

  // Animated styles
  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: iconScale.value * pulseScale.value },
      { rotate: `${interpolate(iconScale.value, [0, 1], [180, 0])}deg` },
    ],
    opacity: iconOpacity.value,
  }));

  const textAnimatedStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
    transform: [{ scale: buttonScale.value }],
  }));

  return (
    <>
      <Box style={styles.container}>
        <Stack space={12} align="center">
          {/* Hero Icon with Gradient Background */}
          <Animated.View style={[styles.iconContainer, iconAnimatedStyle]}>
            <LinearGradient
              colors={["#FF007A", "#FF1A8A", "#E6006E"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientIcon}
            >
              <UnicornWhite />
            </LinearGradient>
          </Animated.View>

          {/* Content Stack */}
          <Animated.View style={textAnimatedStyle}>
            <Stack space={6} align="center">
              <Stack space={3} align="center">
                <Text type="headline1" color="onSurface" style={styles.title}>
                  Welcome to UniApp
                </Text>

                <View style={styles.subtitleContainer}>
                  <Text type="body1" color="outline" style={styles.subtitle}>
                    Track your LP positions
                  </Text>
                </View>
              </Stack>

              {/* CTA Button */}
              <Animated.View style={buttonAnimatedStyle}>
                <TouchableOpacity style={styles.ctaButton} onPress={() => setIsVisible(true)} activeOpacity={0.8}>
                  <LinearGradient
                    colors={["#FF007A", "#FF1A8A"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.buttonGradient}
                  >
                    <Text type="body1" color="onPrimary" style={styles.buttonText}>
                      Add Wallet
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            </Stack>
          </Animated.View>
        </Stack>
      </Box>
      <AddWalletModal isVisible={isVisible} onClose={() => setIsVisible(false)} />
    </>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: theme.spacing.xxl,
    paddingVertical: theme.spacing.giant,
    backgroundColor: theme.colors.background,
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: theme.colors.primary,
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 12,
  },
  gradientIcon: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    textAlign: "center",
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  subtitleContainer: {
    maxWidth: 280,
  },
  subtitle: {
    textAlign: "center",
    lineHeight: 24,
    opacity: 0.8,
  },
  ctaButton: {
    marginTop: theme.spacing.lg,
    borderRadius: 16,
    shadowColor: theme.colors.primary,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  buttonGradient: {
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xxl,
    borderRadius: 16,
    minWidth: 200,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    textAlign: "center",
    fontWeight: "600",
    fontSize: 16,
    letterSpacing: 0.5,
  },
}));
