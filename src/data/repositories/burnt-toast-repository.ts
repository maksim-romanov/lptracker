import * as Burnt from "burnt";
import type { ToastOptions } from "burnt/build/types";

import type { ToastConfig, ToastType } from "domain/entities/toast";
import type { ToastRepository } from "domain/repositories/toast-repository";

export class BurntToastRepository implements ToastRepository {
  async show(config: ToastConfig): Promise<void> {
    const { title, message, type, duration } = config;

    const options: ToastOptions = {
      title,
      message,
      duration: duration || this.getDefaultDuration(type),
      preset: this.getPreset(type),
      haptic: this.getHaptic(type),
    };

    return Burnt.toast(options);
  }

  private getDefaultDuration(type: ToastType): number {
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

  private getPreset(type: ToastType): "done" | "error" | "none" {
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

  private getHaptic(type: ToastType): "success" | "warning" | "error" | "none" {
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
