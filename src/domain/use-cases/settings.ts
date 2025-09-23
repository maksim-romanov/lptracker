import { ThemeDto } from "domain/dto/settings.dto";
import type { AppSettings, ThemePreference } from "domain/entities/settings";
import type { SettingsRepository } from "domain/repositories/settings-repository";

import { BaseUseCase } from "./base-use-case";

export class SettingsManagementUseCase extends BaseUseCase<void, void> {
  constructor(private readonly repository: SettingsRepository) {
    super();
  }

  execute(): Promise<void> {
    throw new Error("This use case doesn't implement the abstract execute method");
  }

  async getSettings(): Promise<AppSettings> {
    return this.executeWithErrorHandling(async () => {
      return this.repository.getSettings();
    });
  }

  async setTheme(theme: ThemePreference | undefined): Promise<AppSettings> {
    if (theme) {
      await this.validateDto(ThemeDto, { theme });
    }

    return this.executeWithErrorHandling(async () => {
      await this.repository.setTheme(theme);
      return this.repository.getSettings();
    });
  }
}
