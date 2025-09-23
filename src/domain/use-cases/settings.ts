import type { AppSettings, ThemePreference } from "domain/entities/settings";
import type { SettingsRepository } from "domain/repositories/settings-repository";

import { LogErrors } from "../decorators";
import { BaseUseCase } from "./base-use-case";

export class SettingsManagementUseCase extends BaseUseCase<void, void> {
  constructor(private readonly repository: SettingsRepository) {
    super();
  }

  execute(): Promise<void> {
    throw new Error("This use case doesn't implement the abstract execute method");
  }

  @LogErrors()
  async getSettings(): Promise<AppSettings> {
    return this.repository.getSettings();
  }

  @LogErrors()
  async setTheme(theme: ThemePreference | undefined): Promise<AppSettings> {
    await this.repository.setTheme(theme);
    return this.repository.getSettings();
  }
}
