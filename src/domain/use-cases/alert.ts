import { AlertType } from "domain/entities/alert";
import type { AlertConfig, ConfirmationConfig, ErrorConfig, InfoConfig } from "domain/entities/alert";
import type { AlertRepository } from "domain/repositories/alert-repository";

export class AlertService {
  constructor(private readonly repository: AlertRepository) {}

  async show(config: AlertConfig): Promise<boolean | void> {
    return this.repository.show(config);
  }

  async showConfirmation(title: string, message?: string): Promise<boolean> {
    const config: ConfirmationConfig = {
      title,
      message,
      type: AlertType.CONFIRMATION,
    };
    return this.repository.showConfirmation(config);
  }

  async showError(title: string, message?: string): Promise<void> {
    const config: ErrorConfig = {
      title,
      message,
      type: AlertType.ERROR,
      duration: 5,
    };
    return this.repository.showError(config);
  }

  async showInfo(title: string, message?: string): Promise<void> {
    const config: InfoConfig = {
      title,
      message,
      type: AlertType.INFO,
    };
    return this.repository.showInfo(config);
  }
}
