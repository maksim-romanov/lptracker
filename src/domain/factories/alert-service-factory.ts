import { AlertService } from "domain/use-cases/alert";
import type { AlertRepository } from "domain/repositories/alert-repository";

export class AlertServiceFactory {
  private services = new Map<AlertRepository, AlertService>();

  getService(repository: AlertRepository): AlertService {
    if (!this.services.has(repository)) {
      this.services.set(repository, new AlertService(repository));
    }
    return this.services.get(repository)!;
  }

  clearCache(): void {
    this.services.clear();
  }
}