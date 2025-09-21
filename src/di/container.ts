import "reflect-metadata";
import { container } from "tsyringe";

import { BurntNotificationsRepository } from "data/repositories/burnt-notifications-repository";
import { ClipboardRepositoryImpl } from "data/repositories/clipboard-repository-impl";
import { SettingsRepositoryImpl } from "data/repositories/settings-repository-impl";
import { WalletsRepositoryImpl } from "data/repositories/wallets-repository-impl";
import type { ClipboardRepository } from "domain/repositories/clipboard-repository";
import type { NotificationsRepository } from "domain/repositories/notifications-repository";
import type { SettingsRepository } from "domain/repositories/settings-repository";
import type { WalletsRepository } from "domain/repositories/wallets-repository";
import { AppInitializeUseCase } from "domain/use-cases/app-initialize";
import { ClipboardUseCase } from "domain/use-cases/clipboard";
import { NotificationsUseCase } from "domain/use-cases/notifications";
import { SettingsManagementUseCase } from "domain/use-cases/settings";
import { WalletsUseCase } from "domain/use-cases/wallets";

// Repository bindings
container.register<ClipboardRepository>("ClipboardRepository", {
  useClass: ClipboardRepositoryImpl,
});
container.register<NotificationsRepository>("NotificationsRepository", {
  useClass: BurntNotificationsRepository,
});
container.register<SettingsRepository>("SettingsRepository", {
  useClass: SettingsRepositoryImpl,
});
container.register<WalletsRepository>("WalletsRepository", {
  useClass: WalletsRepositoryImpl,
});

// UseCase bindings
container.register(ClipboardUseCase, {
  useFactory: (c) => new ClipboardUseCase(c.resolve("ClipboardRepository")),
});

container.register(NotificationsUseCase, {
  useFactory: (c) => new NotificationsUseCase(c.resolve("NotificationsRepository")),
});

container.register(SettingsManagementUseCase, {
  useFactory: (c) => new SettingsManagementUseCase(c.resolve("SettingsRepository")),
});

container.register(WalletsUseCase, {
  useFactory: (c) => new WalletsUseCase(c.resolve("WalletsRepository"), c.resolve(NotificationsUseCase)),
});

container.register(AppInitializeUseCase, {
  useFactory: (c) => new AppInitializeUseCase(c.resolve(SettingsManagementUseCase)),
});

export { container };
