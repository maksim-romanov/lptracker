import { StyleSheet } from "react-native-unistyles";

import { breakpoints, darkTheme, lightTheme } from "./themes";

// Configure Unistyles with themes, breakpoints, and spacing
StyleSheet.configure({
  themes: {
    light: lightTheme,
    dark: darkTheme,
  },
  breakpoints,
  settings: {
    adaptiveThemes: true,
  },
});

// UnistylesGrid.init((theme) => ({
//   // containerPaddingVertical: 0,
//   // containerPaddingHorizontal: 0,
//   containerStyles: {
//     paddingVertical: theme.spacing.md,
//     paddingHorizontal: theme.spacing.lg,
//   },
//   rowGap: theme.spacing.sm,
//   columnGap: {
//     medium: theme.spacing.sm,
//     large: 100,
//   },
// }));

// TypeScript module augmentation
// declare module "react-native-unistyles" {
//   export interface UnistylesThemes {
//     light: typeof lightTheme;
//     dark: typeof darkTheme;
//   }

//   type AppBreakpoints = typeof breakpoints;
//   export interface UnistylesBreakpoints extends AppBreakpoints {}
// }

// declare module "@grapp/stacks" {
//   type AppBreakpoints = typeof breakpoints;
//   export interface StacksBreakpoints extends AppBreakpoints {}
// }
