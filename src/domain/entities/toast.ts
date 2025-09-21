export enum ToastType {
  SUCCESS = "success",
  ERROR = "error",
  WARNING = "warning",
  INFO = "info",
}

export interface ToastConfig {
  title: string;
  message?: string;
  type: ToastType;
  duration?: number;
}