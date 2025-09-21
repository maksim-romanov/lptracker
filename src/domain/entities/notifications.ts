export enum NotificationType {
  SUCCESS = "success",
  ERROR = "error",
  WARNING = "warning",
  INFO = "info",
}

export interface NotificationConfig {
  title: string;
  message?: string;
  type: NotificationType;
  duration?: number;
}