import { appStorage, STORAGE_KEYS } from "data/mmkv/storage";
import type { AppSettings, ThemePreference } from "domain/entities/settings";
import type { SettingsRepository } from "domain/repositories/settings-repository";

const DEFAULT_SETTINGS: AppSettings = { theme: undefined };

export class SettingsRepositoryImpl implements SettingsRepository {
  async getSettings(): Promise<AppSettings> {
    try {
      const raw = appStorage.getString(STORAGE_KEYS.settings);
      if (!raw) return DEFAULT_SETTINGS;
      const parsed = JSON.parse(raw) as AppSettings;
      return parsed;
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  async setTheme(theme: ThemePreference | undefined): Promise<void> {
    const current = await this.getSettings();
    const next: AppSettings = { ...current, theme };
    appStorage.set(STORAGE_KEYS.settings, JSON.stringify(next));
  }
}
