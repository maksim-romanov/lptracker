import { DefaultTheme as DefaultThemeNavigation, Theme } from "@react-navigation/native";

import { ColorsPaletteDark } from "./colors";

export const DarkTheme: Theme = {
  dark: true,
  colors: {
    background: ColorsPaletteDark.surface,
    primary: ColorsPaletteDark.primary,
    card: ColorsPaletteDark.surfaceContainer,
    text: ColorsPaletteDark.onSurface,
    border: ColorsPaletteDark.surfaceContainerHigh,
    notification: ColorsPaletteDark.tertiary,
  },
  fonts: DefaultThemeNavigation.fonts,
};
