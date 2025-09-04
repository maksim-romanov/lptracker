import { StyleSheet } from "react-native-unistyles";

import { breakpoints, darkTheme, lightTheme } from "./themes";

// Configure Unistyles with themes and breakpoints
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

// TypeScript module augmentation
declare module "react-native-unistyles" {
  export interface UnistylesThemes {
    light: typeof lightTheme;
    dark: typeof darkTheme;
  }

  export interface UnistylesBreakpoints {
    xs: 0;
    sm: 576;
    md: 768;
    lg: 992;
    xl: 1200;
    superLarge: 2000;
    tvLike: 4000;
  }
}
