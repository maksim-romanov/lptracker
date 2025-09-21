import "reflect-metadata";
import { container } from "tsyringe";

import { BurntAlertRepository } from "data/repositories/burnt-alert-repository";
import { BurntToastRepository } from "data/repositories/burnt-toast-repository";
import { ClipboardRepositoryImpl } from "data/repositories/clipboard-repository-impl";
import { NativeAlertRepository } from "data/repositories/native-alert-repository";
import { SettingsRepositoryImpl } from "data/repositories/settings-repository-impl";
import { WalletsRepositoryImpl } from "data/repositories/wallets-repository-impl";
import { NativeAlertService } from "data/services/native-alert-service";
import { ToastServiceImpl } from "data/services/toast-service-impl";
import { AlertServiceFactory } from "domain/factories/alert-service-factory";
import type { ClipboardRepository } from "domain/repositories/clipboard-repository";
import type { SettingsRepository } from "domain/repositories/settings-repository";
import type { WalletsRepository } from "domain/repositories/wallets-repository";
import type { AlertService } from "domain/services/alert-service";
import type { ToastService } from "domain/services/toast-service";
import { AppInitializeUseCase } from "domain/use-cases/app-initialize";
import { ClipboardUseCase } from "domain/use-cases/clipboard";
import { SettingsManagementUseCase } from "domain/use-cases/settings";
import { WalletsUseCase } from "domain/use-cases/wallets";

// Repository bindings
container.register<ClipboardRepository>("ClipboardRepository", {
  useClass: ClipboardRepositoryImpl,
});
container.register<SettingsRepository>("SettingsRepository", {
  useClass: SettingsRepositoryImpl,
});
container.register<WalletsRepository>("WalletsRepository", {
  useClass: WalletsRepositoryImpl,
});

// Toast and Alert repositories
container.register(BurntToastRepository, { useClass: BurntToastRepository });
container.register(BurntAlertRepository, { useClass: BurntAlertRepository });
container.register(NativeAlertRepository, { useClass: NativeAlertRepository });

// Services
container.register<ToastService>("ToastService", {
  useFactory: (c) => new ToastServiceImpl(c.resolve(BurntToastRepository)),
});

container.register<AlertService>("AlertService", {
  useClass: NativeAlertService,
});

// Alert service factory
container.register(AlertServiceFactory, { useClass: AlertServiceFactory });

// UseCase bindings
container.register(ClipboardUseCase, {
  useFactory: (c) => new ClipboardUseCase(c.resolve("ClipboardRepository")),
});

container.register(SettingsManagementUseCase, {
  useFactory: (c) => new SettingsManagementUseCase(c.resolve("SettingsRepository")),
});

container.register(WalletsUseCase, {
  useFactory: (c) =>
    new WalletsUseCase(c.resolve("WalletsRepository"), c.resolve("ToastService"), c.resolve("AlertService")),
});

container.register(AppInitializeUseCase, {
  useFactory: (c) => new AppInitializeUseCase(c.resolve(SettingsManagementUseCase)),
});

export { container };
