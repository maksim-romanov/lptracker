import * as Burnt from "burnt";
import type { AlertOptions } from "burnt/build/types";

import type { AlertConfig, AlertType, ConfirmationConfig, ErrorConfig, InfoConfig } from "domain/entities/alert";
import type { AlertRepository } from "domain/repositories/alert-repository";

export class BurntAlertRepository implements AlertRepository {
  async show(config: AlertConfig): Promise<boolean | void> {
    switch (config.type) {
      case "confirmation":
        return this.showConfirmation(config as ConfirmationConfig);
      case "error":
        return this.showError(config as ErrorConfig);
      case "info":
        return this.showInfo(config as InfoConfig);
      default:
        throw new Error(`Unsupported alert type: ${config.type}`);
    }
  }

  async showConfirmation(config: ConfirmationConfig): Promise<boolean> {
    const { title, message, duration } = config;

    const options: AlertOptions = {
      title,
      message,
      duration: duration || 0, // 0 = infinite until dismissed
      preset: "none",
    };

    await Burnt.alert(options);
    // Note: Burnt doesn't support confirmation dialogs with Yes/No buttons
    // This is a limitation - returns true for now
    // For real confirmation, should use NativeAlertRepository
    return true;
  }

  async showError(config: ErrorConfig): Promise<void> {
    const { title, message, duration } = config;

    const options: AlertOptions = {
      title,
      message,
      duration: duration || this.getDefaultDuration(config.type),
      preset: "error",
    };

    return Burnt.alert(options);
  }

  async showInfo(config: InfoConfig): Promise<void> {
    const { title, message, duration } = config;

    const options: AlertOptions = {
      title,
      message,
      duration: duration || this.getDefaultDuration(config.type),
      preset: "done",
    };

    return Burnt.alert(options);
  }

  private getDefaultDuration(type: AlertType): number {
    switch (type) {
      case "error":
        return 5;
      case "info":
        return 3;
      case "confirmation":
      default:
        return 0; // Infinite until dismissed
    }
  }
}
