import { type NotificationConfig, NotificationType } from "domain/entities/notifications";
import type { NotificationsRepository } from "domain/repositories/notifications-repository";

export class NotificationsUseCase {
  constructor(private readonly repository: NotificationsRepository) {}

  async show(config: NotificationConfig): Promise<void> {
    return this.repository.show(config);
  }

  async showSuccess(title: string, message?: string): Promise<void> {
    return this.show({
      title,
      message,
      type: NotificationType.SUCCESS,
    });
  }

  async showError(title: string, message?: string): Promise<void> {
    return this.show({
      title,
      message,
      type: NotificationType.ERROR,
      duration: 1,
    });
  }

  async showWarning(title: string, message?: string): Promise<void> {
    return this.show({
      title,
      message,
      type: NotificationType.WARNING,
    });
  }

  async showInfo(title: string, message?: string): Promise<void> {
    return this.show({
      title,
      message,
      type: NotificationType.INFO,
    });
  }
}
