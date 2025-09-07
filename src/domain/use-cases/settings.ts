import type { AppSettings, ThemePreference } from "domain/entities/settings";
import type { SettingsRepository } from "domain/repositories/settings-repository";

export class GetSettingsUseCase {
  constructor(private readonly repository: SettingsRepository) {}

  async execute(): Promise<AppSettings> {
    return this.repository.getSettings();
  }
}
export class SetThemeUseCase {
  constructor(private readonly repository: SettingsRepository) {}

  async execute(theme: ThemePreference | undefined): Promise<void> {
    return this.repository.setTheme(theme);
  }
}
