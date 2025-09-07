export type ThemePreference = "light" | "dark";

export interface AppSettings {
  // If undefined, app should use system theme
  theme?: ThemePreference;
}


