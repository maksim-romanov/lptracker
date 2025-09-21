import type { ToastConfig, ToastType } from "domain/entities/toast";
import type { ToastRepository } from "domain/repositories/toast-repository";

export class ToastService {
  constructor(private readonly repository: ToastRepository) {}

  async show(config: ToastConfig): Promise<void> {
    return this.repository.show(config);
  }

  async showSuccess(title: string, message?: string): Promise<void> {
    return this.show({
      title,
      message,
      type: "success" as ToastType,
    });
  }

  async showError(title: string, message?: string): Promise<void> {
    return this.show({
      title,
      message,
      type: "error" as ToastType,
      duration: 4,
    });
  }

  async showWarning(title: string, message?: string): Promise<void> {
    return this.show({
      title,
      message,
      type: "warning" as ToastType,
    });
  }

  async showInfo(title: string, message?: string): Promise<void> {
    return this.show({
      title,
      message,
      type: "info" as ToastType,
    });
  }
}