export enum AlertType {
  CONFIRMATION = "confirmation",
  ERROR = "error",
  INFO = "info",
}

export interface AlertConfig {
  title: string;
  message?: string;
  type: AlertType;
  duration?: number;
}

export interface ConfirmationConfig extends Omit<AlertConfig, "type"> {
  type: AlertType.CONFIRMATION;
}

export interface ErrorConfig extends Omit<AlertConfig, "type"> {
  type: AlertType.ERROR;
}

export interface InfoConfig extends Omit<AlertConfig, "type"> {
  type: AlertType.INFO;
}
