import { injectable } from "tsyringe";
import { Address } from "viem";

import { getChainConfig, type SupportedChainId } from "../../configs";
import type { PoolRepository } from "../../domain/repositories";
import type { Slot0State, FeeGrowthSnapshot } from "../../domain/types";
import { STATE_VIEW_ABI } from "../abis";
import { makePublicClient } from "../viem";

@injectable()
export class ViemPoolRepository implements PoolRepository {
  async getSlot0State(poolId: Address, chainId: SupportedChainId): Promise<Slot0State> {
    const config = getChainConfig(chainId);
    const client = makePublicClient(chainId);

    const [sqrtPriceX96, tick] = (await client.readContract({
      address: config.stateViewAddress,
      abi: STATE_VIEW_ABI,
      functionName: "getSlot0",
      args: [poolId],
    })) as unknown as readonly [bigint, number];

    return { sqrtPriceX96, tickCurrent: tick };
  }

  async getFeeGrowthInside(
    poolId: Address,
    tickLower: number,
    tickUpper: number,
    chainId: SupportedChainId,
  ): Promise<FeeGrowthSnapshot> {
    const config = getChainConfig(chainId);
    const client = makePublicClient(chainId);

    const [feeGrowthInside0X128, feeGrowthInside1X128] = (await client.readContract({
      address: config.stateViewAddress,
      abi: STATE_VIEW_ABI,
      functionName: "getFeeGrowthInside",
      args: [poolId, tickLower, tickUpper],
    })) as readonly [bigint, bigint];

    return { feeGrowthInside0X128, feeGrowthInside1X128 };
  }
}
