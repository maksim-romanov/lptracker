import { argbFromHex, hexFromArgb, Scheme, themeFromSourceColor } from "@material/material-color-utilities";

import { typography } from "./typography";

const seedColor = argbFromHex("#FF007A"); // Uniswap pink

const theme = themeFromSourceColor(seedColor);

// Spacing system (8px base scale like Uniswap and modern design systems)
const spacing = {
  none: 0,
  xxs: 2,
  xs: 4, // 0.25rem
  sm: 8, // 0.5rem
  md: 12, // 0.75rem
  lg: 16, // 1rem
  xl: 20, // 1.25rem
  xxl: 24, // 1.5rem
  xxxl: 32, // 2rem
  huge: 40, // 2.5rem
  massive: 48, // 3rem
  giant: 64, // 4rem
  colossal: 80, // 5rem
} as const;

const lightSchemaColors = theme.schemes.light.toJSON();
const darkSchemaColors = theme.schemes.dark.toJSON();

const commonColors = {
  primary: "#FF007A",
  onPrimary: "#FFFFFF",

  secondary: "#4C82FB",
  onSecondary: "#FFFFFF",

  success: "#40B66B", // Uniswap green
  warning: "#FF9F0A", // Uniswap orange
} as const;

export const lightTheme = {
  colors: {
    ...Object.keys(lightSchemaColors).reduce(
      (acc, key) => {
        acc[key as keyof Scheme] = hexFromArgb(lightSchemaColors[key as keyof typeof lightSchemaColors]);
        return acc;
      },
      {} as Record<keyof Scheme, string>,
    ),
    ...commonColors,

    background: "#fff",
    surface: "#f0f0f0",
    outline: "#e0e0e0",
  } as const,

  spacing,
  typography,

  stacks: {
    spacing: 4,
  },
};
export const darkTheme = {
  colors: {
    ...Object.keys(darkSchemaColors).reduce(
      (acc, key) => {
        acc[key as keyof Scheme] = hexFromArgb(darkSchemaColors[key as keyof typeof darkSchemaColors]);
        return acc;
      },
      {} as Record<keyof Scheme, string>,
    ),
    ...commonColors,

    background: "#0D111C",
    surface: "#1B2236",
    outline: "#4C5665",

    onSurface: "#FFFFFF",
  } as const,

  spacing,
  typography,

  stacks: {
    spacing: 4,
  },
};

// // Uniswap v4 design system colors - Light Theme

// export const lightTheme = {
//   colors: {
//     // Primary Uniswap brand colors
//     primary: "#FF007A", // Uniswap signature pink
//     primaryHover: "#E6006E",
//     primaryActive: "#CC005C",

//     // Secondary colors
//     secondary: "#4C82FB", // Uniswap blue
//     secondaryHover: "#3D6FE8",
//     secondaryActive: "#2E5CD5",

//     // Background hierarchy
//     background: "#FFFFFF",
//     backgroundModule: "#FFFFFF",
//     backgroundSurface: "#F7F8FA",
//     backgroundInteractive: "#F7F8FA",
//     backgroundFloating: "#FFFFFF",
//     backgroundOutline: "#F7F8FA",

//     // Text colors
//     textPrimary: "#0D111C",
//     textSecondary: "#5D6785",
//     textTertiary: "#9B9B9B",

//     // Interactive states
//     interactive: "#FF007A",
//     interactiveHover: "#E6006E",
//     interactiveActive: "#CC005C",
//     interactiveDisabled: "#F7F8FA",

//     // Borders and dividers
//     border: "#E7E8EA",
//     borderLight: "#F0F0F0",
//     outline: "#CECDD2",

//     // Status colors (Uniswap style)
//     success: "#40B66B",
//     successBackground: "#E8F5E8",
//     warning: "#FF9F0A",
//     warningBackground: "#FFF4E5",
//     error: "#FF5F5F",
//     errorBackground: "#FFE8E8",

//     // Special effects
//     shadow: "rgba(13, 17, 28, 0.04)",
//     shadowDeep: "rgba(13, 17, 28, 0.12)",
//     overlay: "rgba(0, 0, 0, 0.6)",
//     scrim: "rgba(13, 17, 28, 0.6)",

//     // Accent colors for highlights
//     accent1: "#FF007A",
//     accent2: "#4C82FB",
//     accent3: "#9750DD", // Purple
//     accent4: "#40B66B", // Green
//   },
//   spacing,
// } as const;

// // Uniswap v4 design system colors - Dark Theme

// export const darkTheme = {
//   colors: {
//     // Primary Uniswap brand colors (consistent across themes)
//     primary: "#FF007A", // Uniswap signature pink
//     primaryHover: "#FF1A8A",
//     primaryActive: "#E6006E",

//     // Secondary colors
//     secondary: "#4C82FB", // Uniswap blue
//     secondaryHover: "#5A8FFC",
//     secondaryActive: "#3D6FE8",

//     // Background hierarchy (dark mode)
//     background: "#0D111C",
//     backgroundModule: "#131A2A",
//     backgroundSurface: "#1B2236",
//     backgroundInteractive: "#222B45",
//     backgroundFloating: "#131A2A",
//     backgroundOutline: "#1B2236",

//     // Text colors (dark mode)
//     textPrimary: "#FFFFFF",
//     textSecondary: "#98A1C0",
//     textTertiary: "#7D8399",

//     // Interactive states (dark mode)
//     interactive: "#FF007A",
//     interactiveHover: "#FF1A8A",
//     interactiveActive: "#E6006E",
//     interactiveDisabled: "#222B45",

//     // Borders and dividers (dark mode)
//     border: "#2C2F36",
//     borderLight: "#40444F",
//     outline: "#4C5665",

//     // Status colors (consistent but with dark backgrounds)
//     success: "#40B66B",
//     successBackground: "#1A3A1A",
//     warning: "#FF9F0A",
//     warningBackground: "#3A2F1A",
//     error: "#FF5F5F",
//     errorBackground: "#3A1A1A",

//     // Special effects (dark mode)
//     shadow: "rgba(0, 0, 0, 0.3)",
//     shadowDeep: "rgba(0, 0, 0, 0.5)",
//     overlay: "rgba(0, 0, 0, 0.8)",
//     scrim: "rgba(0, 0, 0, 0.8)",

//     // Accent colors for highlights (same as light)
//     accent1: "#FF007A",
//     accent2: "#4C82FB",
//     accent3: "#9750DD", // Purple
//     accent4: "#40B66B", // Green
//   },
//   spacing,
// } as const;

// Mobile-first breakpoints for iOS/iPad and Android/Tablets
export const breakpoints = {
  small: 0, // up to 360px (small phones)
  medium: 361, // 361px – 767px (most phones)
  large: 768, // 768px – 1023px (small tablets)
  xlarge: 1024, // 1024px+ (tablets, foldables)
} as const;

// // TypeScript types
// export type AppThemes = {
//   light: typeof lightTheme;
//   dark: typeof darkTheme;
// };

// export type AppBreakpoints = typeof breakpoints;
