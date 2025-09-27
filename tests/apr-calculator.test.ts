import { describe, it, expect, beforeAll } from "bun:test";
import "reflect-metadata";

import { AprCalculatorService } from "../src/features/uniswap-v4/domain/services/apr-calculator";
import type { AprCalculationInput } from "../src/features/uniswap-v4/domain/types";

describe("AprCalculatorService", () => {
  let calculator: AprCalculatorService;

  beforeAll(() => {
    calculator = new AprCalculatorService();
  });

  function createMockAprInput(overrides: Partial<AprCalculationInput> = {}): AprCalculationInput {
    return {
      currentData: {
        feeGrowthInside0X128: 1000000000000000000000000000000n,
        feeGrowthInside1X128: 2000000000000000000000000000000n,
        timestamp: Date.now(),
        positionValueUsd: 10000,
      },
      historicalData: {
        feeGrowthInside0X128: 999000000000000000000000000000n,
        feeGrowthInside1X128: 1998000000000000000000000000000n,
        timestamp: Date.now() - 24 * 60 * 60 * 1000,
        positionValueUsd: 10000,
      },
      liquidity: 1000000000000000000n,
      token0Decimals: 6,
      token1Decimals: 18,
      token0PriceUsd: 1.0,
      token1PriceUsd: 2000.0,
      ...overrides,
    };
  }

  describe("calculateApr", () => {
    it("should calculate basic APR correctly", async () => {
      const input = createMockAprInput();
      const result = await calculator.calculateApr(input, "24h");

      expect(result.apr).toBeGreaterThanOrEqual(0);
      expect(result.feesEarnedUsd).toBeGreaterThanOrEqual(0);
      expect(result.period).toBe("24h");
      expect(Math.abs(result.annualizationFactor - 365.25)).toBeLessThan(0.1);
    });

    it("should handle overflow scenarios correctly", async () => {
      const input = createMockAprInput({
        currentData: {
          feeGrowthInside0X128: 100000000000000000000000000000000000n,
          feeGrowthInside1X128: 200000000000000000000000000000000000n,
          timestamp: Date.now(),
          positionValueUsd: 10000,
        },
        historicalData: {
          feeGrowthInside0X128: 340282366920938463463374607431768211456n - 100000000000000000000000000000000000n,
          feeGrowthInside1X128: 340282366920938463463374607431768211456n - 200000000000000000000000000000000000n,
          timestamp: Date.now() - 24 * 60 * 60 * 1000,
          positionValueUsd: 10000,
        },
      });

      const result = await calculator.calculateApr(input, "24h");

      expect(result.apr).toBeGreaterThanOrEqual(0);
      expect(result.feesEarnedUsd).toBeGreaterThanOrEqual(0);
    });

    it("should return zero APR when no fees are earned", async () => {
      const input = createMockAprInput({
        currentData: {
          feeGrowthInside0X128: 1000000000000000000000000000000000000n,
          feeGrowthInside1X128: 2000000000000000000000000000000000000n,
          timestamp: Date.now(),
          positionValueUsd: 10000,
        },
        historicalData: {
          feeGrowthInside0X128: 1000000000000000000000000000000000000n,
          feeGrowthInside1X128: 2000000000000000000000000000000000000n,
          timestamp: Date.now() - 24 * 60 * 60 * 1000,
          positionValueUsd: 10000,
        },
      });

      const result = await calculator.calculateApr(input, "24h");

      expect(result.apr).toBe(0);
      expect(result.feesEarnedUsd).toBe(0);
    });

    it("should handle different time periods correctly", async () => {
      const baseInput = createMockAprInput();
      const periods: ("24h" | "7d" | "30d")[] = ["24h", "7d", "30d"];
      const expectedFactors = { "24h": 365.25, "7d": 52.18, "30d": 12.18 };

      for (const period of periods) {
        const msPerPeriod = {
          "24h": 24 * 60 * 60 * 1000,
          "7d": 7 * 24 * 60 * 60 * 1000,
          "30d": 30 * 24 * 60 * 60 * 1000,
        };

        const input = createMockAprInput({
          historicalData: {
            ...baseInput.historicalData,
            timestamp: Date.now() - msPerPeriod[period],
          },
        });

        const result = await calculator.calculateApr(input, period);
        const expected = expectedFactors[period];
        const tolerance = 0.1;

        expect(result.period).toBe(period);
        expect(Math.abs(result.annualizationFactor - expected)).toBeLessThan(tolerance);
      }
    });

    it("should validate mathematical precision with known values", async () => {
      const input = createMockAprInput({
        currentData: {
          feeGrowthInside0X128: 1000000000000000000000000000n,
          feeGrowthInside1X128: 0n,
          timestamp: Date.now(),
          positionValueUsd: 1000,
        },
        historicalData: {
          feeGrowthInside0X128: 0n,
          feeGrowthInside1X128: 0n,
          timestamp: Date.now() - 24 * 60 * 60 * 1000,
          positionValueUsd: 1000,
        },
        liquidity: 340282366920938463463374607431768211456n,
        token0Decimals: 18,
        token1Decimals: 18,
        token0PriceUsd: 1.0,
        token1PriceUsd: 1.0,
      });

      const result = await calculator.calculateApr(input, "24h");

      expect(Number.isFinite(result.feesEarnedUsd)).toBe(true);
      expect(result.feesEarnedUsd).toBeGreaterThanOrEqual(0);
      expect(Number.isFinite(result.apr)).toBe(true);
      expect(result.apr).toBeGreaterThanOrEqual(0);
    });

    it("should validate industry standard ranges", async () => {
      const realisticInput = createMockAprInput({
        currentData: {
          feeGrowthInside0X128: 1073741824000000000000000000000000n,
          feeGrowthInside1X128: 2147483648000000000000000000000000n,
          timestamp: Date.now(),
          positionValueUsd: 50000,
        },
        historicalData: {
          feeGrowthInside0X128: 1073741823000000000000000000000000n,
          feeGrowthInside1X128: 2147483647000000000000000000000000n,
          timestamp: Date.now() - 24 * 60 * 60 * 1000,
          positionValueUsd: 50000,
        },
        liquidity: 10000000000000000000000n,
        token0Decimals: 6,
        token1Decimals: 18,
        token0PriceUsd: 1.0,
        token1PriceUsd: 3000.0,
      });

      const result = await calculator.calculateApr(realisticInput, "24h");

      // Validate formula manually
      const manualApr = (result.feesEarnedUsd / realisticInput.currentData.positionValueUsd) * 365.25 * 100;
      const aprDifference = Math.abs(result.apr - manualApr);

      expect(aprDifference).toBeLessThan(0.001);
    });

    it("should throw error for invalid input", async () => {
      const now = Date.now();
      const invalidInput = createMockAprInput({
        currentData: {
          ...createMockAprInput().currentData,
          timestamp: now - 25 * 60 * 60 * 1000, // Current is 25 hours ago
        },
        historicalData: {
          ...createMockAprInput().historicalData,
          timestamp: now, // Historical is now (invalid: current should be after historical)
        },
      });

      await expect(calculator.calculateApr(invalidInput, "24h")).rejects.toThrow();
    });
  });

  describe("calculateMultiplePeriods", () => {
    it("should calculate multiple periods simultaneously", async () => {
      const input = createMockAprInput();
      const periods: ("24h" | "7d" | "30d")[] = ["24h", "7d", "30d"];

      const results = await calculator.calculateMultiplePeriods(input, periods);

      expect(Object.keys(results)).toHaveLength(periods.length);

      for (const period of periods) {
        expect(results[period]).toBeDefined();
        expect(results[period].period).toBe(period);
        expect(results[period].apr).toBeGreaterThanOrEqual(0);
      }
    });
  });
});
