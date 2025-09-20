import { SettingsManagementUseCase } from "domain/use-cases/settings";

export class AppInitializeUseCase {
  constructor(private readonly settingsManagement: SettingsManagementUseCase) {}

  async execute(): Promise<void> {
    // Warm-up read for settings; other boot tasks can be added later
    await this.settingsManagement.getSettings();
  }
}
