import { injectable } from "tsyringe";
import type { Address } from "viem";

import { getChainConfig, type SupportedChainId } from "../../configs";
import type { BlockchainHistoryService } from "../../domain/repositories/historical-data";
import { STATE_VIEW_ABI } from "../abis";
import { makePublicClient } from "../viem";

@injectable()
export class ViemBlockchainHistoryService implements BlockchainHistoryService {
  private readonly BLOCKS_PER_HOUR = 300; // Approximate blocks per hour (varies by chain)
  private readonly BLOCKS_PER_DAY = 7200; // Approximate blocks per day

  async getPositionAtBlock(
    tokenId: bigint,
    chainId: SupportedChainId,
    blockNumber: number
  ): Promise<{
    feeGrowthInside0X128: bigint;
    feeGrowthInside1X128: bigint;
    blockNumber: number;
    timestamp: number;
  }> {
    try {
      const config = getChainConfig(chainId);
      const client = makePublicClient(chainId);

      // Get block timestamp
      const block = await client.getBlock({ blockNumber: BigInt(blockNumber) });
      const timestamp = Number(block.timestamp) * 1000; // Convert to milliseconds

      // We need position details to get the stored position info
      // This is a limitation - we need to know the position details to query historical state
      // In a production system, you might cache position details or use subgraph data
      throw new Error(
        "Historical position querying requires position details. " +
          "Consider using subgraph data or caching position details for historical queries."
      );

      // Note: The following code would work if we had the position details cached:
      /*
      const salt = `0x${tokenId.toString(16).padStart(64, "0")}` as `0x${string}`;
      const [liquidity, feeGrowthInside0X128, feeGrowthInside1X128] = (await client.readContract({
        address: config.stateViewAddress,
        abi: STATE_VIEW_ABI,
        functionName: "getPositionInfo",
        args: [poolId, config.positionManagerAddress, tickLower, tickUpper, salt],
        blockNumber: BigInt(blockNumber),
      })) as readonly [bigint, bigint, bigint];

      return {
        feeGrowthInside0X128,
        feeGrowthInside1X128,
        blockNumber,
        timestamp,
      };
      */
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to get position at block ${blockNumber}: ${errorMessage}`);
    }
  }

  async getBlockNearTimestamp(
    chainId: SupportedChainId,
    timestamp: number
  ): Promise<{ blockNumber: number; timestamp: number }> {
    try {
      const client = makePublicClient(chainId);
      const targetTimestamp = Math.floor(timestamp / 1000); // Convert to seconds

      // Get current block for reference
      const latestBlock = await client.getBlock({ blockTag: "latest" });
      const latestBlockNumber = Number(latestBlock.number);
      const latestTimestamp = Number(latestBlock.timestamp);

      // If target is in the future or very recent, return latest block
      if (targetTimestamp >= latestTimestamp - 60) {
        return {
          blockNumber: latestBlockNumber,
          timestamp: latestTimestamp * 1000,
        };
      }

      // Calculate estimated block number using average block time
      const timeDiff = latestTimestamp - targetTimestamp;
      const estimatedBlocksBack = Math.floor(timeDiff / this.getAverageBlockTime(chainId));
      let estimatedBlockNumber = Math.max(1, latestBlockNumber - estimatedBlocksBack);

      // Binary search to find the closest block
      let left = Math.max(1, estimatedBlockNumber - 1000); // Search window
      let right = Math.min(latestBlockNumber, estimatedBlockNumber + 1000);
      let closestBlock = { blockNumber: estimatedBlockNumber, timestamp: latestTimestamp };
      let minDiff = Math.abs(latestTimestamp - targetTimestamp);

      // Perform binary search with limited iterations to avoid excessive RPC calls
      for (let iteration = 0; iteration < 10; iteration++) {
        if (left >= right) break;

        const mid = Math.floor((left + right) / 2);

        try {
          const block = await client.getBlock({ blockNumber: BigInt(mid) });
          const blockTimestamp = Number(block.timestamp);
          const diff = Math.abs(blockTimestamp - targetTimestamp);

          if (diff < minDiff) {
            minDiff = diff;
            closestBlock = {
              blockNumber: mid,
              timestamp: blockTimestamp * 1000,
            };
          }

          if (blockTimestamp < targetTimestamp) {
            left = mid + 1;
          } else {
            right = mid - 1;
          }

          // If we're within 1 minute, that's close enough
          if (diff < 60) {
            break;
          }
        } catch (error) {
          console.warn(`Failed to get block ${mid}, skipping:`, error);
          break;
        }
      }

      return closestBlock;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to find block near timestamp ${timestamp}: ${errorMessage}`);
    }
  }

  async getBlocksForTimestamps(
    chainId: SupportedChainId,
    timestamps: number[]
  ): Promise<Array<{ blockNumber: number; timestamp: number }>> {
    try {
      // Process timestamps in parallel but with rate limiting
      const BATCH_SIZE = 3; // Limit concurrent requests to avoid rate limiting
      const results: Array<{ blockNumber: number; timestamp: number }> = [];

      for (let i = 0; i < timestamps.length; i += BATCH_SIZE) {
        const batch = timestamps.slice(i, i + BATCH_SIZE);
        const batchPromises = batch.map((timestamp) => this.getBlockNearTimestamp(chainId, timestamp));

        try {
          const batchResults = await Promise.all(batchPromises);
          results.push(...batchResults);

          // Add a small delay between batches to be respectful to RPC providers
          if (i + BATCH_SIZE < timestamps.length) {
            await new Promise((resolve) => setTimeout(resolve, 500)); // 500ms delay
          }
        } catch (error) {
          console.warn(`Failed to process batch starting at index ${i}:`, error);
          // Continue with next batch
        }
      }

      return results.sort((a, b) => a.timestamp - b.timestamp);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to get blocks for timestamps: ${errorMessage}`);
    }
  }

  /**
   * Get average block time for a chain (in seconds)
   */
  private getAverageBlockTime(chainId: SupportedChainId): number {
    // Approximate block times for different chains
    switch (chainId) {
      case 1: // Ethereum mainnet
        return 12;
      case 42161: // Arbitrum
        return 1;
      case 10: // Optimism
        return 2;
      case 137: // Polygon
        return 2;
      case 8453: // Base
        return 2;
      default:
        return 12; // Default to Ethereum-like timing
    }
  }

  /**
   * Enhanced method that uses subgraph data if available
   * This would be the preferred approach for production
   */
  async getPositionAtBlockWithSubgraph(
    tokenId: bigint,
    chainId: SupportedChainId,
    blockNumber: number,
    subgraphUrl?: string
  ): Promise<{
    feeGrowthInside0X128: bigint;
    feeGrowthInside1X128: bigint;
    blockNumber: number;
    timestamp: number;
  }> {
    if (!subgraphUrl) {
      throw new Error("Subgraph URL required for historical position queries");
    }

    try {
      // This would query the subgraph for historical position state
      // Example GraphQL query:
      const query = `
        query GetPositionAtBlock($tokenId: String!, $blockNumber: Int!) {
          position(id: $tokenId, block: { number: $blockNumber }) {
            id
            tickLower
            tickUpper
            liquidity
            feeGrowthInside0LastX128
            feeGrowthInside1LastX128
            pool {
              id
              feeGrowthGlobal0X128
              feeGrowthGlobal1X128
            }
          }
          _meta {
            block {
              number
              timestamp
            }
          }
        }
      `;

      // In a real implementation, you would use graphql-request or similar:
      /*
      const response = await request(subgraphUrl, query, {
        tokenId: tokenId.toString(),
        blockNumber,
      });

      return {
        feeGrowthInside0X128: BigInt(response.position.feeGrowthInside0LastX128),
        feeGrowthInside1X128: BigInt(response.position.feeGrowthInside1LastX128),
        blockNumber: response._meta.block.number,
        timestamp: response._meta.block.timestamp * 1000,
      };
      */

      throw new Error("Subgraph integration not implemented yet");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to get position from subgraph: ${errorMessage}`);
    }
  }
}