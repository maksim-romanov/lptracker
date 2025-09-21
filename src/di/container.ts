import "reflect-metadata";
import { container } from "tsyringe";

import { BurntAlertRepository } from "data/repositories/burnt-alert-repository";
import { BurntToastRepository } from "data/repositories/burnt-toast-repository";
import { ClipboardRepositoryImpl } from "data/repositories/clipboard-repository-impl";
import { NativeAlertRepository } from "data/repositories/native-alert-repository";
import { SettingsRepositoryImpl } from "data/repositories/settings-repository-impl";
import { WalletsRepositoryImpl } from "data/repositories/wallets-repository-impl";
import { AlertServiceFactory } from "domain/factories/alert-service-factory";
import type { ClipboardRepository } from "domain/repositories/clipboard-repository";
import type { SettingsRepository } from "domain/repositories/settings-repository";
import type { WalletsRepository } from "domain/repositories/wallets-repository";
import { AppInitializeUseCase } from "domain/use-cases/app-initialize";
import { ClipboardUseCase } from "domain/use-cases/clipboard";
import { SettingsManagementUseCase } from "domain/use-cases/settings";
import { ToastService } from "domain/use-cases/toast";
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

// UseCase bindings
container.register(ClipboardUseCase, {
  useFactory: (c) => new ClipboardUseCase(c.resolve("ClipboardRepository")),
});

container.register(SettingsManagementUseCase, {
  useFactory: (c) => new SettingsManagementUseCase(c.resolve("SettingsRepository")),
});

// Toast service - simple direct binding
container.register(ToastService, {
  useFactory: (c) => new ToastService(c.resolve(BurntToastRepository)),
});

// Alert service factory
container.register(AlertServiceFactory, { useClass: AlertServiceFactory });

container.register(WalletsUseCase, {
  useFactory: (c) => new WalletsUseCase(c.resolve("WalletsRepository"), c.resolve(ToastService)),
});

container.register(AppInitializeUseCase, {
  useFactory: (c) => new AppInitializeUseCase(c.resolve(SettingsManagementUseCase)),
});

export { container };
