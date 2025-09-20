import tinycolor from "tinycolor2";

export const ColorsPaletteDark = {
  primary: "#FF37C7",
  onPrimary: "#fff",
  primaryContainer: tinycolor("#FF37C7").setAlpha(0.2).toRgbString(),
  primaryContainerVariant: tinycolor("#FF37C7").setAlpha(0.3).toRgbString(),
  onPrimaryContainer: "#FF37C7",

  // Secondary
  secondary: "#494949",
  onSecondary: "#B7B7B7",
  secondaryContainer: tinycolor("#B7B7B7").setAlpha(0.2).toRgbString(),
  secondaryContainerVariant: tinycolor("#B7B7B7").setAlpha(0.3).toRgbString(),
  onSecondaryContainer: "#B7B7B7",

  // Tertiary
  tertiary: "#4C82FB",
  onTertiary: "#1A1A1A",
  tertiaryContainer: tinycolor("#4C82FB").setAlpha(0.2).toRgbString(),
  tertiaryContainerVariant: tinycolor("#4C82FB").setAlpha(0.3).toRgbString(),
  onTertiaryContainer: "#4C82FB",

  // Error
  error: "#FF5F5F",
  onError: "#FFFFFF",
  errorContainer: tinycolor("#FF5F5F").setAlpha(0.2).toRgbString(),
  errorContainerVariant: tinycolor("#FF5F5F").setAlpha(0.3).toRgbString(),
  onErrorContainer: "#FF5F5F",

  // Surface
  surface: "#131313", // Default color for backgrounds
  onSurface: "#ffffff",
  onSurfaceVariant: "rgba(255, 255, 255, 0.35)",
  surfaceContainer: "#1F1F1F",
  onSurfaceContainer: "#ffffff",

  surfaceContainerLow: "#1A1A1A",
  surfaceContainerHigh: "#262626",
  surfaceContainerHighest: "#2D2D2D",
  // surfaceContainerLow: "rgba(255, 255, 255, 0.12)",
  // surfaceContainerHigh: "rgba(255, 255, 255, 0.16)",
  // surfaceContainerHighest: "rgba(255, 255, 255, 0.20)",

  // Outline
  outline: "rgba(255, 255, 255, 0.12)",
  outlineVariant: "rgba(255, 255, 255, 0.20)",

  success: "#40B66B",
  onSuccess: "#FFFFFF",
  successContainer: tinycolor("#40B66B").setAlpha(0.2).toRgbString(),
  successContainerVariant: tinycolor("#40B66B").setAlpha(0.3).toRgbString(),
  onSuccessContainer: "#40B66B",
};
