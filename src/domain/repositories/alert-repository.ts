import type { AlertConfig, ConfirmationConfig, ErrorConfig, InfoConfig } from "domain/entities/alert";

export interface AlertRepository {
  showConfirmation(config: ConfirmationConfig): Promise<boolean>;
  showError(config: ErrorConfig): Promise<void>;
  showInfo(config: InfoConfig): Promise<void>;
  show(config: AlertConfig): Promise<boolean | void>;
}