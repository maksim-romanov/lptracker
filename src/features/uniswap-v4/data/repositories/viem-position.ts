import { Pool } from "@uniswap/v4-sdk";
import { injectable } from "tsyringe";
import type { Address } from "viem";

import { getChainConfig, type SupportedChainId } from "../../configs";
import type { PositionRepository } from "../../domain/repositories";
import type { PositionDetails, StoredPositionInfo } from "../../domain/types";
import { createCurrency } from "../../utils/currency";
import { POSITION_MANAGER_ABI, STATE_VIEW_ABI } from "../abis";
import { makePublicClient } from "../viem";

@injectable()
export class ViemPositionRepository implements PositionRepository {
  async getPositionIds(_owner: Address, _chainId: SupportedChainId): Promise<bigint[]> {
    throw new Error("Position IDs must be fetched from subgraph");
  }

  async getPositionDetails(tokenId: bigint, chainId: SupportedChainId): Promise<PositionDetails> {
    const config = getChainConfig(chainId);
    const client = makePublicClient(chainId);

    const [poolKey, infoValue] = (await client.readContract({
      address: config.positionManagerAddress,
      abi: POSITION_MANAGER_ABI,
      functionName: "getPoolAndPositionInfo",
      args: [tokenId],
    })) as readonly [
      { currency0: Address; currency1: Address; fee: number; tickSpacing: number; hooks: Address },
      bigint,
    ];

    const liquidity = (await client.readContract({
      address: config.positionManagerAddress,
      abi: POSITION_MANAGER_ABI,
      functionName: "getPositionLiquidity",
      args: [tokenId],
    })) as bigint;

    const { tickLower, tickUpper } = this.decodePositionInfo(infoValue);

    return {
      tokenId,
      tickLower,
      tickUpper,
      liquidity,
      poolKey,
    };
  }

  async getStoredPositionInfo(tokenId: bigint, chainId: SupportedChainId): Promise<StoredPositionInfo> {
    const config = getChainConfig(chainId);
    const client = makePublicClient(chainId);
    const details = await this.getPositionDetails(tokenId, chainId);

    const salt = `0x${tokenId.toString(16).padStart(64, "0")}` as `0x${string}`;
    const [liquidity, feeGrowthInside0X128, feeGrowthInside1X128] = (await client.readContract({
      address: config.stateViewAddress,
      abi: STATE_VIEW_ABI,
      functionName: "getPositionInfo",
      args: [
        this.getPoolId(details, chainId),
        config.positionManagerAddress,
        details.tickLower,
        details.tickUpper,
        salt,
      ],
    })) as readonly [bigint, bigint, bigint];

    return { liquidity, feeGrowthInside0X128, feeGrowthInside1X128 };
  }

  private decodePositionInfo(value: bigint): { tickLower: number; tickUpper: number } {
    const getTickUpper = () => {
      const raw = Number((value >> 32n) & 0xffffffn);
      return raw >= 0x800000 ? raw - 0x1000000 : raw;
    };
    const getTickLower = () => {
      const raw = Number((value >> 8n) & 0xffffffn);
      return raw >= 0x800000 ? raw - 0x1000000 : raw;
    };
    return {
      tickLower: getTickLower(),
      tickUpper: getTickUpper(),
    };
  }

  private getPoolId(details: PositionDetails, chainId: SupportedChainId): Address {
    const config = getChainConfig(chainId);
    const currency0 = createCurrency(details.poolKey.currency0, config.chainId, { decimals: 18, symbol: "UNKNOWN" });
    const currency1 = createCurrency(details.poolKey.currency1, config.chainId, { decimals: 18, symbol: "UNKNOWN" });

    return Pool.getPoolId(
      currency0,
      currency1,
      details.poolKey.fee,
      details.poolKey.tickSpacing,
      details.poolKey.hooks,
    ) as `0x${string}`;
  }
}
