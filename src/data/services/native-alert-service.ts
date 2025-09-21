import { Alert } from "react-native";

import type { AlertService, AlertOptions, AlertButton } from "domain/services/alert-service";

export class NativeAlertService implements AlertService {
  async show(options: AlertOptions): Promise<void> {
    return new Promise((resolve) => {
      const buttons = options.buttons?.map((button) => ({
        text: button.text,
        style: button.style,
        onPress: async () => {
          if (button.onPress) {
            await button.onPress();
          }
          resolve();
        },
      })) || [{ text: "OK", onPress: () => resolve() }];

      Alert.alert(options.title, options.message, buttons);
    });
  }

  async showConfirmation(
    title: string,
    message?: string,
    onConfirm?: () => void | Promise<void>,
    onCancel?: () => void | Promise<void>
  ): Promise<void> {
    return this.show({
      title,
      message,
      buttons: [
        {
          text: "Cancel",
          style: "cancel",
          onPress: onCancel,
        },
        {
          text: "Confirm",
          style: "default",
          onPress: onConfirm,
        },
      ],
    });
  }
}