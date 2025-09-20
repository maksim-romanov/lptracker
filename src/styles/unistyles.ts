import { StyleSheet } from "react-native-unistyles";

import { breakpoints } from "./theme/breakpoints";
import { ColorsPaletteDark } from "./theme/colors";
import { spacing } from "./theme/spacing";
import { typography } from "./theme/typography";

const stacks = { spacing: 4, debug: false };

// Configure Unistyles with themes, breakpoints, and spacing
StyleSheet.configure({
  themes: {
    dark: { colors: ColorsPaletteDark, spacing, typography, stacks },
  },
  breakpoints,
  settings: {
    // adaptiveThemes: true,
  },
});

declare module "react-native-unistyles" {
  type AppBreakpoints = typeof breakpoints;

  type AppTheme = {
    colors: typeof ColorsPaletteDark;
    spacing: typeof spacing;
    typography: typeof typography;
    stacks: typeof stacks;
  };

  type AppThemes = { dark: AppTheme };

  export interface UnistylesBreakpoints extends AppBreakpoints {}
  export interface UnistylesThemes extends AppThemes {}
}

declare module "@grapp/stacks" {
  // export interface StacksBreakpoints extends Breakpoints {}
  type AppBreakpoints = typeof breakpoints;
  export interface StacksBreakpoints extends AppBreakpoints {}
}
