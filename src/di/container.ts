import "reflect-metadata";
import { container } from "tsyringe";

import { AddressesRepositoryImpl } from "data/repositories/addresses-repository-impl";
import { SettingsRepositoryImpl } from "data/repositories/settings-repository-impl";
import type { AddressesRepository } from "domain/repositories/addresses-repository";
import type { SettingsRepository } from "domain/repositories/settings-repository";
import {
  AddAddressUseCase,
  GetAddressesStateUseCase,
  RemoveAddressUseCase,
  SetActiveAddressUseCase,
} from "domain/use-cases/addresses";
import { AppInitializeUseCase } from "domain/use-cases/app-initialize";
import { GetSettingsUseCase, SetThemeUseCase } from "domain/use-cases/settings";
// Uniswap V4 removed

// Repository bindings
container.register<SettingsRepository>("SettingsRepository", {
  useClass: SettingsRepositoryImpl,
});
container.register<AddressesRepository>("AddressesRepository", {
  useClass: AddressesRepositoryImpl,
});
// Uniswap V4 repository binding removed

// UseCase bindings
container.register(GetSettingsUseCase, {
  useFactory: (c) => new GetSettingsUseCase(c.resolve("SettingsRepository")),
});

container.register(SetThemeUseCase, {
  useFactory: (c) => new SetThemeUseCase(c.resolve("SettingsRepository")),
});

container.register(GetAddressesStateUseCase, {
  useFactory: (c) => new GetAddressesStateUseCase(c.resolve("AddressesRepository")),
});
container.register(AddAddressUseCase, {
  useFactory: (c) => new AddAddressUseCase(c.resolve("AddressesRepository")),
});
container.register(RemoveAddressUseCase, {
  useFactory: (c) => new RemoveAddressUseCase(c.resolve("AddressesRepository")),
});
container.register(SetActiveAddressUseCase, {
  useFactory: (c) => new SetActiveAddressUseCase(c.resolve("AddressesRepository")),
});

container.register(AppInitializeUseCase, {
  useFactory: (c) => new AppInitializeUseCase(c.resolve(GetSettingsUseCase)),
});

// Uniswap V4 use case binding removed

export { container };
