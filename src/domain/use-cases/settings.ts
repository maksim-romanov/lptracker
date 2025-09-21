import type { AppSettings, ThemePreference } from "domain/entities/settings";
import type { SettingsRepository } from "domain/repositories/settings-repository";
import { ThemeDto } from "domain/dto/settings.dto";
import { BaseUseCase } from "./base-use-case";

export class SettingsManagementUseCase extends BaseUseCase {
  constructor(private readonly repository: SettingsRepository) {
    super();
  }

  async getSettings(): Promise<AppSettings> {
    return this.execute(async () => {
      return this.repository.getSettings();
    });
  }

  async setTheme(theme: ThemePreference | undefined): Promise<AppSettings> {
    if (theme) {
      await this.validateDto(ThemeDto, { theme });
    }

    return this.execute(async () => {
      await this.repository.setTheme(theme);
      return this.repository.getSettings();
    });
  }
}
