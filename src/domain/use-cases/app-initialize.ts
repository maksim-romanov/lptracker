import { GetSettingsUseCase } from "domain/use-cases/settings";

export class AppInitializeUseCase {
  constructor(private readonly getSettings: GetSettingsUseCase) {}

  async execute(): Promise<void> {
    // Warm-up read for settings; other boot tasks can be added later
    await this.getSettings.execute();
  }
}
