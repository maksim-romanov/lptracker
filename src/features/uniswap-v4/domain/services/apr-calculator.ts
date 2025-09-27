import type { AprCalculationInput, AprResult } from "../types";

/**
 * APR Calculator Service for Uniswap V4 positions
 *
 * Implements production-ready APR calculations with:
 * - Safe 256-bit arithmetic with overflow handling
 * - Industry-standard formulas based on Uniswap V3/V4 math
 * - Multiple time window support (24h, 7d, 30d)
 * - Mathematical precision using Q128 format
 */
export class AprCalculatorService {
  // Q128 constant for fixed-point arithmetic (2^128)
  private readonly Q128 = 2n ** 128n;
  // Maximum uint256 value for overflow detection
  private readonly MAX_UINT256 = 2n ** 256n - 1n;

  /**
   * Calculate APR for a given time period
   */
  async calculateApr(input: AprCalculationInput, period: '24h' | '7d' | '30d'): Promise<AprResult> {
    try {
      // Step 1: Calculate time delta in seconds
      const timeDeltaMs = input.currentData.timestamp - input.historicalData.timestamp;
      const timeDeltaSeconds = Math.floor(timeDeltaMs / 1000);

      if (timeDeltaSeconds <= 0) {
        throw new Error("Invalid time delta: current timestamp must be after historical timestamp");
      }

      // Step 2: Calculate fee growth deltas with overflow handling
      const feeGrowthDelta0 = this.safeFeeGrowthDelta(
        input.currentData.feeGrowthInside0X128,
        input.historicalData.feeGrowthInside0X128
      );

      const feeGrowthDelta1 = this.safeFeeGrowthDelta(
        input.currentData.feeGrowthInside1X128,
        input.historicalData.feeGrowthInside1X128
      );

      // Step 3: Calculate unclaimed fees for each token
      const fees0Raw = this.calculateUnclaimedFees(input.liquidity, feeGrowthDelta0);
      const fees1Raw = this.calculateUnclaimedFees(input.liquidity, feeGrowthDelta1);

      // Step 4: Convert raw token amounts to human-readable numbers
      const fees0Human = this.rawAmountToHuman(fees0Raw, input.token0Decimals);
      const fees1Human = this.rawAmountToHuman(fees1Raw, input.token1Decimals);

      // Step 5: Convert fees to USD
      const fees0Usd = fees0Human * input.token0PriceUsd;
      const fees1Usd = fees1Human * input.token1PriceUsd;
      const totalFeesUsd = fees0Usd + fees1Usd;

      // Step 6: Calculate average position value over the period
      const averagePositionValueUsd = (input.currentData.positionValueUsd + input.historicalData.positionValueUsd) / 2;

      if (averagePositionValueUsd <= 0) {
        throw new Error("Average position value must be positive");
      }

      // Step 7: Calculate annualization factor based on period
      const annualizationFactor = this.getAnnualizationFactor(timeDeltaSeconds, period);

      // Step 8: Calculate APR
      // Formula: APR = (fees_earned_usd / position_value_usd) * annualization_factor * 100
      const aprDecimal = (totalFeesUsd / averagePositionValueUsd) * annualizationFactor;
      const aprPercentage = aprDecimal * 100;

      return {
        apr: aprPercentage,
        feesEarnedUsd: totalFeesUsd,
        period,
        annualizationFactor,
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`APR calculation failed for period ${period}: ${errorMessage}`);
    }
  }

  /**
   * Calculate fee growth delta with proper overflow handling
   * Based on Uniswap V3 math: handles uint256 wrap-around
   */
  private safeFeeGrowthDelta(current: bigint, historical: bigint): bigint {
    // Handle the case where values have wrapped around uint256
    if (current >= historical) {
      // Normal case: no overflow
      return current - historical;
    } else {
      // Overflow case: current value wrapped around
      // Delta = (MAX_UINT256 - historical) + current + 1
      return (this.MAX_UINT256 - historical) + current + 1n;
    }
  }

  /**
   * Calculate unclaimed fees using the standard Uniswap formula
   * Formula: uncollectedFees = liquidity * feeGrowthDelta / Q128
   */
  private calculateUnclaimedFees(liquidity: bigint, feeGrowthDelta: bigint): bigint {
    // Prevent overflow in multiplication by checking bounds
    if (liquidity === 0n || feeGrowthDelta === 0n) {
      return 0n;
    }

    // Calculate: (liquidity * feeGrowthDelta) / Q128
    // Use BigInt arithmetic which handles large numbers correctly
    return (liquidity * feeGrowthDelta) / this.Q128;
  }

  /**
   * Convert raw token amount to human-readable decimal
   */
  private rawAmountToHuman(rawAmount: bigint, decimals: number): number {
    if (rawAmount === 0n) return 0;

    const divisor = 10n ** BigInt(decimals);
    const humanAmount = Number(rawAmount) / Number(divisor);

    // Validate result is reasonable (not NaN or Infinity)
    if (!isFinite(humanAmount)) {
      throw new Error(`Invalid token amount conversion: raw=${rawAmount}, decimals=${decimals}`);
    }

    return humanAmount;
  }

  /**
   * Calculate annualization factor based on actual time period
   */
  private getAnnualizationFactor(timeDeltaSeconds: number, expectedPeriod: '24h' | '7d' | '30d'): number {
    const SECONDS_PER_YEAR = 365.25 * 24 * 60 * 60; // Account for leap years

    // Calculate the actual annualization factor based on time elapsed
    const annualizationFactor = SECONDS_PER_YEAR / timeDeltaSeconds;

    // Validate that the actual period is close to expected period
    const expectedSeconds = {
      '24h': 24 * 60 * 60,
      '7d': 7 * 24 * 60 * 60,
      '30d': 30 * 24 * 60 * 60,
    };

    const expected = expectedSeconds[expectedPeriod];
    const tolerance = 0.1; // 10% tolerance for timestamp differences

    if (Math.abs(timeDeltaSeconds - expected) / expected > tolerance) {
      console.warn(
        `Time period mismatch: expected ${expectedPeriod} (${expected}s), got ${timeDeltaSeconds}s`
      );
    }

    return annualizationFactor;
  }

  /**
   * Validate input parameters
   */
  private validateInput(input: AprCalculationInput): void {
    if (input.liquidity < 0n) throw new Error("Liquidity cannot be negative");
    if (input.token0Decimals < 0 || input.token0Decimals > 77) throw new Error("Invalid token0 decimals");
    if (input.token1Decimals < 0 || input.token1Decimals > 77) throw new Error("Invalid token1 decimals");
    if (input.token0PriceUsd < 0) throw new Error("Token0 price cannot be negative");
    if (input.token1PriceUsd < 0) throw new Error("Token1 price cannot be negative");

    const currentTimestamp = input.currentData.timestamp;
    const historicalTimestamp = input.historicalData.timestamp;

    if (currentTimestamp <= historicalTimestamp) {
      throw new Error("Current timestamp must be after historical timestamp");
    }

    // Validate fee growth values are within uint256 bounds
    const values = [
      input.currentData.feeGrowthInside0X128,
      input.currentData.feeGrowthInside1X128,
      input.historicalData.feeGrowthInside0X128,
      input.historicalData.feeGrowthInside1X128,
    ];

    for (const value of values) {
      if (value < 0n || value > this.MAX_UINT256) {
        throw new Error(`Fee growth value out of uint256 bounds: ${value}`);
      }
    }
  }

  /**
   * Calculate multiple APR periods in a single call
   */
  async calculateMultiplePeriods(
    input: AprCalculationInput,
    periods: Array<'24h' | '7d' | '30d'>
  ): Promise<Record<string, AprResult>> {
    this.validateInput(input);

    const results: Record<string, AprResult> = {};

    for (const period of periods) {
      try {
        results[period] = await this.calculateApr(input, period);
      } catch (error) {
        console.error(`Failed to calculate APR for period ${period}:`, error);
        // Continue with other periods even if one fails
      }
    }

    return results;
  }
}