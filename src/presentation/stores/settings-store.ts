import { makeAutoObservable, runInAction } from "mobx";

import { container } from "di/container";
import type { AppSettings, ThemePreference } from "domain/entities/settings";
import { GetSettingsUseCase, SetThemeUseCase } from "domain/use-cases/settings";

export class SettingsStore {
  theme: ThemePreference | undefined = undefined;
  loading = false;

  private readonly getSettings = container.resolve(GetSettingsUseCase);
  private readonly setThemeUseCase = container.resolve(SetThemeUseCase);

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  async hydrate(): Promise<void> {
    this.loading = true;
    try {
      const settings: AppSettings = await this.getSettings.execute();
      runInAction(() => {
        this.theme = settings.theme;
      });
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  async setTheme(theme: ThemePreference | undefined): Promise<void> {
    if (theme === this.theme) return;
    await this.setThemeUseCase.execute(theme);
    runInAction(() => {
      this.theme = theme;
    });
  }
}

export const settingsStore = new SettingsStore();
