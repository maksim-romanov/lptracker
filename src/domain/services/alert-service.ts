export interface AlertButton {
  text: string;
  style?: "default" | "cancel" | "destructive";
  onPress?: () => void | Promise<void>;
}

export interface AlertOptions {
  title: string;
  message?: string;
  buttons?: AlertButton[];
}

export interface AlertService {
  show(options: AlertOptions): Promise<void>;
  showConfirmation(
    title: string,
    message?: string,
    onConfirm?: () => void | Promise<void>,
    onCancel?: () => void | Promise<void>,
  ): Promise<void>;
}
