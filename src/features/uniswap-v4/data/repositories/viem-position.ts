import { Pool } from "@uniswap/v4-sdk";
import { injectable } from "tsyringe";
import type { Address } from "viem";

import { getChainConfig, type SupportedChainId } from "../../configs";
import type { PositionRepository } from "../../domain/repositories";
import type { PositionDetails, StoredPositionInfo, FullPositionData } from "../../domain/types";
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

  async getFullPositionData(tokenId: bigint, chainId: SupportedChainId): Promise<FullPositionData> {
    const config = getChainConfig(chainId);
    const client = makePublicClient(chainId);

    try {
      // Step 1: Get position details (2 RPC calls: getPoolAndPositionInfo + getPositionLiquidity)
      const [poolKey, infoValue] = (await this.retryRpcCall(
        () =>
          client.readContract({
            address: config.positionManagerAddress,
            abi: POSITION_MANAGER_ABI,
            functionName: "getPoolAndPositionInfo",
            args: [tokenId],
          }),
        `getPoolAndPositionInfo for token ${tokenId}`,
      )) as readonly [
        { currency0: Address; currency1: Address; fee: number; tickSpacing: number; hooks: Address },
        bigint,
      ];

      const liquidity = (await this.retryRpcCall(
        () =>
          client.readContract({
            address: config.positionManagerAddress,
            abi: POSITION_MANAGER_ABI,
            functionName: "getPositionLiquidity",
            args: [tokenId],
          }),
        `getPositionLiquidity for token ${tokenId}`,
      )) as bigint;

      const { tickLower, tickUpper } = this.decodePositionInfo(infoValue);

      const details: PositionDetails = {
        tokenId,
        tickLower,
        tickUpper,
        liquidity,
        poolKey,
      };

      // Step 2: Get stored position info (1 RPC call: getPositionInfo)
      // Calculate poolId using the details we just fetched
      const poolId = this.getPoolId(details, chainId);
      const salt = `0x${tokenId.toString(16).padStart(64, "0")}` as `0x${string}`;

      const [storedLiquidity, feeGrowthInside0X128, feeGrowthInside1X128] = (await this.retryRpcCall(
        () =>
          client.readContract({
            address: config.stateViewAddress,
            abi: STATE_VIEW_ABI,
            functionName: "getPositionInfo",
            args: [poolId, config.positionManagerAddress, tickLower, tickUpper, salt],
          }),
        `getPositionInfo for token ${tokenId}`,
      )) as readonly [bigint, bigint, bigint];

      const stored: StoredPositionInfo = {
        liquidity: storedLiquidity,
        feeGrowthInside0X128,
        feeGrowthInside1X128,
      };

      return {
        details,
        stored,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to fetch full position data for token ${tokenId} on chain ${chainId}: ${errorMessage}`);
    }
  }

  private async retryRpcCall<T>(
    rpcCall: () => Promise<T>,
    operationName: string,
    maxRetries: number = 3,
    baseDelay: number = 1000,
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await rpcCall();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // Don't retry if it's a contract-level error (position not found, etc.)
        if (this.isNonRetryableError(lastError)) {
          throw lastError;
        }

        if (attempt === maxRetries) {
          throw new Error(`${operationName} failed after ${maxRetries} attempts: ${lastError.message}`);
        }

        // Exponential backoff with jitter
        const delay = baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    throw lastError!;
  }

  private isNonRetryableError(error: Error): boolean {
    const message = error.message.toLowerCase();

    // These errors indicate the position doesn't exist or invalid parameters
    const nonRetryablePatterns = [
      "position not found",
      "invalid token id",
      "execution reverted",
      "call exception",
      "invalid address",
      "missing signature",
    ];

    return nonRetryablePatterns.some((pattern) => message.includes(pattern));
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
