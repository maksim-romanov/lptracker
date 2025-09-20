import { makeAutoObservable, runInAction } from "mobx";

import { container } from "di/container";
import type { AppSettings, ThemePreference } from "domain/entities/settings";
import { SettingsManagementUseCase } from "domain/use-cases/settings";

export class SettingsStore {
  theme: ThemePreference | undefined = undefined;
  loading = false;

  private readonly settingsManagement = container.resolve(SettingsManagementUseCase);

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  async hydrate(): Promise<void> {
    this.loading = true;
    try {
      const settings = await this.settingsManagement.getSettings();
      this.updateSettings(settings);
    } catch (error) {
      console.error("Failed to hydrate settings:", error);
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  async setTheme(theme: ThemePreference | undefined): Promise<void> {
    if (theme === this.theme) return;

    this.loading = true;
    try {
      const settings = await this.settingsManagement.setTheme(theme);
      this.updateSettings(settings);
    } catch (error) {
      console.error("Failed to set theme:", error);
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  private updateSettings(settings: AppSettings): void {
    runInAction(() => {
      this.theme = settings.theme;
    });
  }
}

export const settingsStore = new SettingsStore();
