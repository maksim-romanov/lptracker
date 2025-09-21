import type { NotificationConfig } from "domain/entities/notifications";

export interface NotificationsRepository {
  show(config: NotificationConfig): Promise<void>;
}