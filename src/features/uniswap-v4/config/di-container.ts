import { container } from "tsyringe";

import { GetPositionIdsUseCase } from "../application/use-cases/get-position-ids";
import { GetMultiChainPositionIdsUseCase } from "../application/use-cases/get-multi-chain-position-ids";
import { SubgraphPositionRepository } from "../data/repositories/subgraph-position";
import { ViemPoolRepository } from "../data/repositories/viem-pool";
import { ViemPositionRepository } from "../data/repositories/viem-position";
import { ViemTokenRepository } from "../data/repositories/viem-token";
import type { PositionRepository, PoolRepository, TokenRepository } from "../domain/repositories";

export function configureDI(): void {
  container.register<PositionRepository>("PositionRepository", {
    useClass: SubgraphPositionRepository,
  });

  container.register<PositionRepository>("ViemPositionRepository", {
    useClass: ViemPositionRepository,
  });

  container.register<PoolRepository>("PoolRepository", {
    useClass: ViemPoolRepository,
  });

  container.register<TokenRepository>("TokenRepository", {
    useClass: ViemTokenRepository,
  });

  // Use Cases
  container.register("GetPositionIdsUseCase", {
    useClass: GetPositionIdsUseCase,
  });

  container.register("GetMultiChainPositionIdsUseCase", {
    useClass: GetMultiChainPositionIdsUseCase,
  });
}

export { container };
