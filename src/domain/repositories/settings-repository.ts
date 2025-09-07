import type { AppSettings, ThemePreference } from "domain/entities/settings";

export interface SettingsRepository {
  getSettings(): Promise<AppSettings>;
  setTheme(theme: ThemePreference | undefined): Promise<void>;
}
