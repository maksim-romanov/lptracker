import { Alert } from "react-native";

import type { AlertConfig, AlertType, ConfirmationConfig, ErrorConfig, InfoConfig } from "domain/entities/alert";
import type { AlertRepository } from "domain/repositories/alert-repository";

export class NativeAlertRepository implements AlertRepository {
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
    const { title, message } = config;

    return new Promise((resolve) => {
      Alert.alert(
        title,
        message,
        [
          {
            text: "Cancel",
            style: "cancel",
            onPress: () => resolve(false),
          },
          {
            text: "OK",
            style: "default",
            onPress: () => resolve(true),
          },
        ],
        { cancelable: true, onDismiss: () => resolve(false) },
      );
    });
  }

  async showError(config: ErrorConfig): Promise<void> {
    const { title, message } = config;

    return new Promise((resolve) => {
      Alert.alert(
        title,
        message,
        [
          {
            text: "OK",
            style: "default",
            onPress: () => resolve(),
          },
        ],
        { cancelable: false },
      );
    });
  }

  async showInfo(config: InfoConfig): Promise<void> {
    const { title, message } = config;

    return new Promise((resolve) => {
      Alert.alert(
        title,
        message,
        [
          {
            text: "OK",
            style: "default",
            onPress: () => resolve(),
          },
        ],
        { cancelable: true, onDismiss: () => resolve() },
      );
    });
  }
}
