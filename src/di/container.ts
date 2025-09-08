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
import { UniswapV4RepositoryImpl } from "features/uniswap-v4/api/uniswap-v4-repository";
import type { UniswapV4Repository } from "features/uniswap-v4/model/repositories/uniswap-v4-repository";
import { GetUserPositionsUseCaseImpl } from "features/uniswap-v4/model/use-cases/get-user-positions";

// Repository bindings
container.register<SettingsRepository>("SettingsRepository", {
  useClass: SettingsRepositoryImpl,
});
container.register<AddressesRepository>("AddressesRepository", {
  useClass: AddressesRepositoryImpl,
});
container.register<UniswapV4Repository>("UniswapV4Repository", {
  useClass: UniswapV4RepositoryImpl,
});

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

// Uniswap V4 UseCase bindings
container.register(GetUserPositionsUseCaseImpl, {
  useFactory: (c) => new GetUserPositionsUseCaseImpl(c.resolve("UniswapV4Repository")),
});

export { container };
