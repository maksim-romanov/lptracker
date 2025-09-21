import type { AlertRepository } from "domain/repositories/alert-repository";
import { AlertService } from "domain/use-cases/alert";

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
