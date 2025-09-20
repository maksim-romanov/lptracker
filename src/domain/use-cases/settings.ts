import type { AppSettings, ThemePreference } from "domain/entities/settings";
import type { SettingsRepository } from "domain/repositories/settings-repository";

export class SettingsManagementUseCase {
  constructor(private readonly repository: SettingsRepository) {}

  async getSettings(): Promise<AppSettings> {
    return this.repository.getSettings();
  }

  async setTheme(theme: ThemePreference | undefined): Promise<AppSettings> {
    await this.repository.setTheme(theme);
    return this.repository.getSettings();
  }
}
