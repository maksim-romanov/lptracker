import "reflect-metadata";
import { container } from "tsyringe";

import { AddressesRepositoryImpl } from "data/repositories/addresses-repository-impl";
import { SettingsRepositoryImpl } from "data/repositories/settings-repository-impl";
import type { AddressesRepository } from "domain/repositories/addresses-repository";
import type { SettingsRepository } from "domain/repositories/settings-repository";
import { AddressesManagementUseCase } from "domain/use-cases/addresses";
import { AppInitializeUseCase } from "domain/use-cases/app-initialize";
import { SettingsManagementUseCase } from "domain/use-cases/settings";

// Repository bindings
container.register<SettingsRepository>("SettingsRepository", {
  useClass: SettingsRepositoryImpl,
});
container.register<AddressesRepository>("AddressesRepository", {
  useClass: AddressesRepositoryImpl,
});

// UseCase bindings
container.register(SettingsManagementUseCase, {
  useFactory: (c) => new SettingsManagementUseCase(c.resolve("SettingsRepository")),
});

container.register(AddressesManagementUseCase, {
  useFactory: (c) => new AddressesManagementUseCase(c.resolve("AddressesRepository")),
});

container.register(AppInitializeUseCase, {
  useFactory: (c) => new AppInitializeUseCase(c.resolve(SettingsManagementUseCase)),
});

export { container };
