import { inject, injectable } from "tsyringe";

import type { SupportedChainId } from "../../configs";
import type { PositionRepository, PoolRepository, TokenRepository } from "../../domain/repositories";
import type { HistoricalDataRepository } from "../../domain/repositories/historical-data";
import { AprCalculatorService } from "../../domain/services/apr-calculator";
import { SnapshotSchedulerService } from "../../domain/services/snapshot-scheduler";
import type { AprCalculationInput, AprCalculationResult, AprResult, PositionSnapshot } from "../../domain/types";

export interface CalculatePositionAprInput {
  tokenId: bigint;
  chainId: SupportedChainId;
  periods: ("24h" | "7d" | "30d")[];
  forceRefresh?: boolean; // Force creation of new snapshot
}

export interface CalculatePositionAprOutput {
  tokenId: bigint;
  chainId: SupportedChainId;
  result: AprCalculationResult;
  dataTimestamps: {
    currentSnapshot: number;
    historicalSnapshots: Record<string, number | null>;
  };
  warnings: string[];
}

@injectable()
export class CalculatePositionAprUseCase {
  constructor(
    @inject("PositionRepository")
    private readonly positionRepository: PositionRepository,
    @inject("PoolRepository")
    private readonly poolRepository: PoolRepository,
    @inject("TokenRepository")
    private readonly tokenRepository: TokenRepository,
    @inject("HistoricalDataRepository")
    private readonly historicalDataRepository: HistoricalDataRepository,
    @inject("SnapshotSchedulerService")
    private readonly snapshotScheduler: SnapshotSchedulerService,
    private readonly aprCalculator: AprCalculatorService = new AprCalculatorService(),
  ) {}

  async execute(input: CalculatePositionAprInput): Promise<CalculatePositionAprOutput> {
    try {
      const warnings: string[] = [];
      const dataTimestamps: CalculatePositionAprOutput["dataTimestamps"] = {
        currentSnapshot: 0,
        historicalSnapshots: {},
      };

      // Step 1: Get or create current snapshot
      const currentSnapshot = await this.getCurrentSnapshot(input.tokenId, input.chainId, input.forceRefresh);
      dataTimestamps.currentSnapshot = currentSnapshot.timestamp;

      // Step 2: Get historical snapshots for each period
      const historicalSnapshots: Record<string, PositionSnapshot | null> = {};

      for (const period of input.periods) {
        const historical = await this.historicalDataRepository.getHistoricalSnapshot(
          input.tokenId,
          input.chainId,
          period,
        );

        historicalSnapshots[period] = historical;
        dataTimestamps.historicalSnapshots[period] = historical?.timestamp || null;

        if (!historical) {
          warnings.push(`No historical data available for ${period} period`);
        }
      }

      // Step 3: Calculate APR for each period
      const result: AprCalculationResult = {};

      for (const period of input.periods) {
        const historical = historicalSnapshots[period];

        if (!historical) {
          warnings.push(`Skipping ${period} APR calculation due to missing historical data`);
          continue;
        }

        try {
          // Get token metadata for price calculation
          const tokenPrices = await this.getTokenPrices(input.tokenId, input.chainId);

          const aprInput: AprCalculationInput = {
            currentData: {
              feeGrowthInside0X128: currentSnapshot.feeGrowthInside0X128,
              feeGrowthInside1X128: currentSnapshot.feeGrowthInside1X128,
              timestamp: currentSnapshot.timestamp,
              positionValueUsd: currentSnapshot.positionValueUsd,
            },
            historicalData: {
              feeGrowthInside0X128: historical.feeGrowthInside0X128,
              feeGrowthInside1X128: historical.feeGrowthInside1X128,
              timestamp: historical.timestamp,
              positionValueUsd: historical.positionValueUsd,
            },
            liquidity: await this.getPositionLiquidity(input.tokenId, input.chainId),
            token0Decimals: tokenPrices.token0Decimals,
            token1Decimals: tokenPrices.token1Decimals,
            token0PriceUsd: tokenPrices.token0PriceUsd,
            token1PriceUsd: tokenPrices.token1PriceUsd,
          };

          const aprResult = await this.aprCalculator.calculateApr(aprInput, period);
          result[`apr${period}` as keyof AprCalculationResult] = aprResult;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          warnings.push(`Failed to calculate ${period} APR: ${errorMessage}`);
          result.error = errorMessage;
        }
      }

      // Step 4: Validate results and add data quality warnings
      this.validateResults(result, warnings, dataTimestamps);

      return {
        tokenId: input.tokenId,
        chainId: input.chainId,
        result,
        dataTimestamps,
        warnings,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to calculate APR for position ${input.tokenId}: ${errorMessage}`);
    }
  }

  /**
   * Calculate APR for multiple positions in parallel
   */
  async executeMultiple(inputs: CalculatePositionAprInput[]): Promise<CalculatePositionAprOutput[]> {
    const BATCH_SIZE = 3; // Process in small batches to avoid overwhelming the system
    const results: CalculatePositionAprOutput[] = [];

    for (let i = 0; i < inputs.length; i += BATCH_SIZE) {
      const batch = inputs.slice(i, i + BATCH_SIZE);
      const batchPromises = batch.map((input) => this.execute(input));

      try {
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
      } catch (error) {
        console.error(`Failed to process batch starting at index ${i}:`, error);
        // Add error results for failed batch
        batch.forEach((input) => {
          results.push({
            tokenId: input.tokenId,
            chainId: input.chainId,
            result: { error: error instanceof Error ? error.message : String(error) },
            dataTimestamps: { currentSnapshot: 0, historicalSnapshots: {} },
            warnings: ["Batch processing failed"],
          });
        });
      }

      // Add delay between batches to avoid rate limiting
      if (i + BATCH_SIZE < inputs.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    return results;
  }

  // Private helper methods

  private async getCurrentSnapshot(
    tokenId: bigint,
    chainId: SupportedChainId,
    forceRefresh: boolean = false,
  ): Promise<PositionSnapshot> {
    // Check if we have a recent snapshot
    if (!forceRefresh) {
      const latest = await this.historicalDataRepository.getLatestSnapshot(tokenId, chainId);
      const maxAge = 10 * 60 * 1000; // 10 minutes

      if (latest && Date.now() - latest.timestamp < maxAge) {
        return latest;
      }
    }

    // Create new snapshot
    try {
      const positionValueUsd = await this.calculateCurrentPositionValue(tokenId, chainId);
      const snapshot = await this.snapshotScheduler.createSnapshot(tokenId, chainId, positionValueUsd);
      return snapshot;
    } catch (error) {
      // If snapshot creation fails, try to get the latest available snapshot
      const latest = await this.historicalDataRepository.getLatestSnapshot(tokenId, chainId);
      if (latest) {
        console.warn(`Using stale snapshot due to creation failure: ${error}`);
        return latest;
      }

      throw new Error(`Failed to get current snapshot and no historical data available: ${error}`);
    }
  }

  private async getTokenPrices(
    tokenId: bigint,
    chainId: SupportedChainId,
  ): Promise<{
    token0Decimals: number;
    token1Decimals: number;
    token0PriceUsd: number;
    token1PriceUsd: number;
  }> {
    try {
      // Get position details to know which tokens we're dealing with
      const fullPosition = await this.positionRepository.getFullPositionData(tokenId, chainId);

      // Get token metadata
      const [token0Metadata, token1Metadata] = await Promise.all([
        this.tokenRepository.getTokenMetadata(fullPosition.details.poolKey.currency0, chainId),
        this.tokenRepository.getTokenMetadata(fullPosition.details.poolKey.currency1, chainId),
      ]);

      // TODO: Get actual token prices from price oracle
      // For now, return placeholder values
      const token0PriceUsd = this.getPlaceholderPrice(fullPosition.details.poolKey.currency0);
      const token1PriceUsd = this.getPlaceholderPrice(fullPosition.details.poolKey.currency1);

      return {
        token0Decimals: token0Metadata.decimals,
        token1Decimals: token1Metadata.decimals,
        token0PriceUsd,
        token1PriceUsd,
      };
    } catch (error) {
      console.error("Failed to get token prices, using defaults:", error);

      // Return sensible defaults
      return {
        token0Decimals: 18,
        token1Decimals: 18,
        token0PriceUsd: 1.0, // Assume token0 is stablecoin
        token1PriceUsd: 2000.0, // Assume token1 is ETH-like
      };
    }
  }

  private async getPositionLiquidity(tokenId: bigint, chainId: SupportedChainId): Promise<bigint> {
    try {
      const fullPosition = await this.positionRepository.getFullPositionData(tokenId, chainId);
      return fullPosition.details.liquidity;
    } catch (error) {
      throw new Error(`Failed to get position liquidity: ${error}`);
    }
  }

  private async calculateCurrentPositionValue(tokenId: bigint, chainId: SupportedChainId): Promise<number> {
    try {
      // TODO: Integrate with actual position value calculator
      // For now, return a placeholder value
      return 10000; // $10,000 placeholder
    } catch (error) {
      console.error("Failed to calculate position value:", error);
      return 0;
    }
  }

  private getPlaceholderPrice(tokenAddress: string): number {
    // Simple heuristic based on common token addresses
    const lowerAddress = tokenAddress.toLowerCase();

    // Common stablecoins
    if (
      lowerAddress.includes("usdc") ||
      lowerAddress.includes("usdt") ||
      lowerAddress.includes("dai") ||
      lowerAddress === "0xa0b86a33e6441b73ecb69c3b6b9a8e72e0bf4d5a" // USDC on Arbitrum
    ) {
      return 1.0;
    }

    // ETH-like tokens
    if (
      lowerAddress.includes("weth") ||
      lowerAddress.includes("eth") ||
      lowerAddress === "0x82af49447d8a07e3bd95bd0d56f35241523fbab1" // WETH on Arbitrum
    ) {
      return 3000.0;
    }

    // Default to moderate value
    return 100.0;
  }

  private validateResults(
    result: AprCalculationResult,
    warnings: string[],
    dataTimestamps: CalculatePositionAprOutput["dataTimestamps"],
  ): void {
    // Check data freshness
    const now = Date.now();
    const currentAge = now - dataTimestamps.currentSnapshot;

    if (currentAge > 30 * 60 * 1000) {
      // 30 minutes
      warnings.push(`Current snapshot is ${Math.round(currentAge / 60000)} minutes old`);
    }

    // Check historical data availability
    const periods = ["24h", "7d", "30d"] as const;
    const availablePeriods = periods.filter((period) => dataTimestamps.historicalSnapshots[period] !== null);

    if (availablePeriods.length === 0) {
      warnings.push("No historical data available for APR calculation");
    } else if (availablePeriods.length < periods.length) {
      const missingPeriods = periods.filter((period) => dataTimestamps.historicalSnapshots[period] === null);
      warnings.push(`Limited historical data: missing ${missingPeriods.join(", ")} periods`);
    }

    // Check for unrealistic APR values
    const aprValues = [result.apr24h?.apr, result.apr7d?.apr, result.apr30d?.apr].filter(
      (apr): apr is number => apr !== undefined,
    );

    for (const apr of aprValues) {
      if (apr > 10000) {
        // > 10,000% APR
        warnings.push(`Extremely high APR detected (${apr.toFixed(1)}%) - verify data quality`);
      } else if (apr < 0) {
        warnings.push(`Negative APR detected (${apr.toFixed(1)}%) - check for data errors`);
      }
    }

    // Check for inconsistent APR trends
    if (result.apr24h && result.apr7d && result.apr30d) {
      const diff24h7d = Math.abs(result.apr24h.apr - result.apr7d.apr);
      const diff7d30d = Math.abs(result.apr7d.apr - result.apr30d.apr);

      if (diff24h7d > 1000 || diff7d30d > 1000) {
        // > 1000% difference
        warnings.push("Large APR variations between periods - consider data quality");
      }
    }
  }
}
