import type { ToastConfig } from "domain/entities/toast";

export interface ToastRepository {
  show(config: ToastConfig): Promise<void>;
}