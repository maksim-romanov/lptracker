import type { QueryClient } from "@tanstack/react-query";
import { container } from "tsyringe";

import { BlockchainRepositoryImpl } from "data/repositories/blockchain-repository-impl";
import { BurntAlertRepository } from "data/repositories/burnt-alert-repository";
import { BurntToastRepository } from "data/repositories/burnt-toast-repository";
import { ClipboardRepositoryImpl } from "data/repositories/clipboard-repository-impl";
import { NativeAlertRepository } from "data/repositories/native-alert-repository";
import { SettingsRepositoryImpl } from "data/repositories/settings-repository-impl";
import { WalletsRepositoryImpl } from "data/repositories/wallets-repository-impl";
import { NativeAlertService } from "data/services/native-alert-service";
import { ToastServiceImpl } from "data/services/toast-service-impl";
import { AlertServiceFactory } from "domain/factories/alert-service-factory";
import type { ILogger } from "domain/logger/logger.interface";
import type { BlockchainRepository } from "domain/repositories/blockchain-repository";
import type { ClipboardRepository } from "domain/repositories/clipboard-repository";
import type { SettingsRepository } from "domain/repositories/settings-repository";
import type { WalletsRepository } from "domain/repositories/wallets-repository";
import type { AlertService } from "domain/services/alert-service";
import type { ToastService } from "domain/services/toast-service";
import { AppInitializeUseCase } from "domain/use-cases/app-initialize";
import { BlockchainManagementUseCase } from "domain/use-cases/blockchain";
import { ClipboardUseCase } from "domain/use-cases/clipboard";
import { SettingsManagementUseCase } from "domain/use-cases/settings";
import { WalletsUseCase } from "domain/use-cases/wallets";
import { configureChainlinkDI } from "features/chainlink-feeds/config/di-container";
import { ReactNativeLogger } from "infrastructure/logger/react-native-logger";
import { queryClient } from "infrastructure/query";

// Feature modules

// Initialize feature modules
configureChainlinkDI();

// Infrastructure bindings
container.register<QueryClient>("QueryClient", {
  useValue: queryClient,
});

// Logger binding (singleton)
container.register<ILogger>("Logger", {
  useClass: ReactNativeLogger,
});

// Repository bindings
container.register<BlockchainRepository>("BlockchainRepository", {
  useClass: BlockchainRepositoryImpl,
});
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

container.register(BlockchainManagementUseCase, {
  useFactory: (c) => new BlockchainManagementUseCase(c.resolve("BlockchainRepository")),
});

container.register(AppInitializeUseCase, {
  useFactory: (c) => new AppInitializeUseCase(c.resolve(SettingsManagementUseCase)),
});

export { container };
