import type { ToastConfig, ToastType } from "domain/entities/toast";

export interface ToastService {
  show(config: ToastConfig): Promise<void>;
  showSuccess(title: string, message?: string): Promise<void>;
  showError(title: string, message?: string): Promise<void>;
  showWarning(title: string, message?: string): Promise<void>;
  showInfo(title: string, message?: string): Promise<void>;
}