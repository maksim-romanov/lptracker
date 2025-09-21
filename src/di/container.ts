import "reflect-metadata";
import { container } from "tsyringe";

import { SettingsRepositoryImpl } from "data/repositories/settings-repository-impl";
import { WalletsRepositoryImpl } from "data/repositories/wallets-repository-impl";
import type { SettingsRepository } from "domain/repositories/settings-repository";
import type { WalletsRepository } from "domain/repositories/wallets-repository";
import { AppInitializeUseCase } from "domain/use-cases/app-initialize";
import { SettingsManagementUseCase } from "domain/use-cases/settings";
import { WalletsUseCase } from "domain/use-cases/wallets";

// Repository bindings
container.register<SettingsRepository>("SettingsRepository", {
  useClass: SettingsRepositoryImpl,
});
container.register<WalletsRepository>("WalletsRepository", {
  useClass: WalletsRepositoryImpl,
});

// UseCase bindings
container.register(SettingsManagementUseCase, {
  useFactory: (c) => new SettingsManagementUseCase(c.resolve("SettingsRepository")),
});

container.register(WalletsUseCase, {
  useFactory: (c) => new WalletsUseCase(c.resolve("WalletsRepository")),
});

container.register(AppInitializeUseCase, {
  useFactory: (c) => new AppInitializeUseCase(c.resolve(SettingsManagementUseCase)),
});

export { container };
