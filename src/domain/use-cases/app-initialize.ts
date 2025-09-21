import { SettingsManagementUseCase } from "domain/use-cases/settings";
import { BaseUseCase } from "./base-use-case";

export class AppInitializeUseCase extends BaseUseCase {
  constructor(private readonly settingsManagement: SettingsManagementUseCase) {
    super();
  }

  async initialize(): Promise<void> {
    return super.execute(async () => {
      // Warm-up read for settings; other boot tasks can be added later
      await this.settingsManagement.getSettings();
    });
  }
}
