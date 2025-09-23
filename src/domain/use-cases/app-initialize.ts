import { SettingsManagementUseCase } from "domain/use-cases/settings";

import { LogErrors } from "../decorators";
import { BaseUseCase } from "./base-use-case";

export class AppInitializeUseCase extends BaseUseCase<void, void> {
  constructor(private readonly settingsManagement: SettingsManagementUseCase) {
    super();
  }

  execute(): Promise<void> {
    throw new Error("This use case doesn't implement the abstract execute method");
  }

  @LogErrors()
  async initialize(): Promise<void> {
    // Warm-up read for settings; other boot tasks can be added later
    await this.settingsManagement.getSettings();
  }
}
