import * as Burnt from "burnt";
import { AlertOptions, ToastOptions } from "burnt/build/types";

import type { NotificationConfig, NotificationType } from "domain/entities/notifications";
import type { NotificationsRepository } from "domain/repositories/notifications-repository";

export class BurntNotificationsRepository implements NotificationsRepository {
  async show(config: NotificationConfig): Promise<void> {
    const { title, message, type, duration } = config;

    switch (type) {
      case "error": {
        const alertOptions: AlertOptions = {
          title,
          message,
          duration: duration || this.getDefaultDuration(type),
          preset: this.getAlertPreset(type),
        };
        return Burnt.alert(alertOptions);
      }
      case "success":
      case "warning":
      case "info":
      default: {
        const toastOptions: ToastOptions = {
          title,
          message,
          duration: duration || this.getDefaultDuration(type),
          preset: this.getToastPreset(type),
          haptic: this.getHaptic(type),
        };
        return Burnt.toast(toastOptions);
      }
    }
  }

  private getDefaultDuration(type: NotificationType): number {
    switch (type) {
      case "error":
        return 4;
      case "warning":
        return 3;
      case "success":
      case "info":
      default:
        return 2;
    }
  }

  private getAlertPreset(type: NotificationType): "error" | "done" | "none" {
    switch (type) {
      case "error":
        return "error";
      case "success":
        return "done";
      case "warning":
      case "info":
      default:
        return "none";
    }
  }

  private getToastPreset(type: NotificationType): "done" | "error" | "none" {
    switch (type) {
      case "success":
        return "done";
      case "error":
        return "error";
      case "warning":
      case "info":
      default:
        return "none";
    }
  }

  private getHaptic(type: NotificationType): "success" | "warning" | "error" | "none" {
    switch (type) {
      case "success":
        return "success";
      case "error":
        return "error";
      case "warning":
        return "warning";
      case "info":
      default:
        return "none";
    }
  }
}
