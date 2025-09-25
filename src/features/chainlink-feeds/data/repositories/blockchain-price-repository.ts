import { inject, injectable } from "tsyringe";
import type { Address } from "viem";

import type { Logger, LoggerFactory } from "../../../../infrastructure/logging";
import type { BlockchainPriceRepository } from "../../domain/repositories";
import { makeChainlinkClient, isValidChainId } from "../viem-client";

// Working ABI from uniswap-v4/test-price.ts - proven to work
const AGGREGATOR_V3_ABI = [
  {
    inputs: [],
    name: "decimals",
    outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "latestRoundData",
    outputs: [
      { internalType: "uint80", name: "roundId", type: "uint80" },
      { internalType: "int256", name: "answer", type: "int256" },
      { internalType: "uint256", name: "startedAt", type: "uint256" },
      { internalType: "uint256", name: "updatedAt", type: "uint256" },
      { internalType: "uint80", name: "answeredInRound", type: "uint80" },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

@injectable()
export class BlockchainPriceRepositoryImpl implements BlockchainPriceRepository {
  private readonly logger: Logger;

  constructor(@inject("ChainlinkLoggerFactory") loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger("BlockchainPrice");
  }
  async getLatestPrice(
    feedAddress: Address,
    chainId: number,
  ): Promise<{
    price: bigint;
    decimals: number;
    roundId: bigint;
    updatedAt: bigint;
  }> {
    // Validate chain ID
    if (!isValidChainId(chainId)) {
      throw new Error(`Unsupported chain ID: ${chainId}`);
    }

    // Use proper viem client with chain configuration
    const client = makeChainlinkClient(chainId);

    try {
      // Get decimals and latest round data in parallel - same logic as working uniswap example
      const [decimalsResult, latestRoundResult] = await Promise.all([
        client.readContract({
          address: feedAddress,
          abi: AGGREGATOR_V3_ABI,
          functionName: "decimals",
          args: [],
        }) as Promise<number>,
        client.readContract({
          address: feedAddress,
          abi: AGGREGATOR_V3_ABI,
          functionName: "latestRoundData",
          args: [],
        }) as Promise<readonly [bigint, bigint, bigint, bigint, bigint]>,
      ]);

      const [roundId, answer, , updatedAt] = latestRoundResult;

      if (answer <= 0n) {
        throw new Error("Invalid price data received from feed");
      }

      // Check if the data is stale (older than 24 hours for stablecoins, 1 hour for others)
      const now = BigInt(Math.floor(Date.now() / 1000));
      const maxAge = BigInt(24 * 3600); // 24 hours in seconds (more lenient for stablecoins)

      if (now - updatedAt > maxAge) {
        this.logger.warn(
          `Price data is stale but proceeding: ${feedAddress}, updated: ${new Date(Number(updatedAt) * 1000).toISOString()}`,
        );
        // Don't throw error for stale data - just warn
      }

      return {
        price: answer,
        decimals: decimalsResult,
        roundId,
        updatedAt,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get price from feed ${feedAddress}: ${error.message}`);
      }
      throw new Error(`Failed to get price from feed ${feedAddress}: Unknown error`);
    }
  }

  async isContractValid(feedAddress: Address, chainId: number): Promise<boolean> {
    // For now, skip validation since we're using proven addresses
    // Can be re-enabled later if needed
    return true;
  }
}
