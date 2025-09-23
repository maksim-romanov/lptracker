import "reflect-metadata";

import { Address } from "viem";
import * as chains from "viem/chains";

import { GetPositionCardUseCase } from "./application/use-cases/get-position-card";
import { GetPositionIdsUseCase } from "./application/use-cases/get-position-ids";
import { GetPositionSummaryUseCase } from "./application/use-cases/get-position-summary";
import { configureDI, container } from "./config/di-container";
import { getChainConfig } from "./configs";

const owner = "0xeCa0b7CDd7F2fE6389Ee3720aE415D07ABe0Ed58" as Address;

// Parse chain ID from environment or use default
const chainId = chains.arbitrum.id;
const config = getChainConfig(chainId);

console.log(`🔍 Uniswap v4 Position Viewer on ${config.viemChain.name} (Chain ID: ${chainId})`);
console.log("");

configureDI();

const getPositionIdsUseCase = container.resolve(GetPositionIdsUseCase);
const getPositionCardUseCase = container.resolve(GetPositionCardUseCase);
const getPositionSummaryUseCase = container.resolve(GetPositionSummaryUseCase);

const positionIds = await getPositionIdsUseCase.execute({ owner, chainId });
console.log(`Found ${positionIds.length} positions for ${owner} on chain ${chainId}`);
console.log("IDs:", positionIds.map(String));

// demo below: card + detailed

console.log("------------");
if (positionIds.length > 0) {
  const card = await getPositionCardUseCase.execute({ tokenId: positionIds[0], chainId });
  console.log("Position Card:", card);

  const summary = await getPositionSummaryUseCase.execute({ tokenId: positionIds[0], chainId });
  console.log("Position Summary:", summary);
}
