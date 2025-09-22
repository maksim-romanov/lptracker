import { container } from "tsyringe";

import type { PositionRepository, PoolRepository, TokenRepository } from "../domain/repositories";
import { SubgraphPositionRepository } from "./repositories/subgraph-position";
import { ViemPoolRepository } from "./repositories/viem-pool";
import { ViemPositionRepository } from "./repositories/viem-position";
import { ViemTokenRepository } from "./repositories/viem-token";

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
