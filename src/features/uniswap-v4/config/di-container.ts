import { container } from "tsyringe";

import type { PositionRepository, PoolRepository, TokenRepository } from "../domain/repositories";
import { SubgraphPositionRepository } from "../data/repositories/subgraph-position";
import { ViemPoolRepository } from "../data/repositories/viem-pool";
import { ViemPositionRepository } from "../data/repositories/viem-position";
import { ViemTokenRepository } from "../data/repositories/viem-token";

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
}

export { container };
