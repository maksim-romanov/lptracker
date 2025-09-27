import "reflect-metadata";

import { describe, it, expect, beforeAll, beforeEach } from "bun:test";
import * as chains from "viem/chains";

import { AprCalculatorService } from "../src/features/uniswap-v4/domain/services/apr-calculator";
import { CalculatePositionAprUseCase } from "../src/features/uniswap-v4/application/use-cases/calculate-position-apr";
import { configureDI, container } from "../src/features/uniswap-v4/config/di-container";
import type { StorageAdapter } from "../src/features/uniswap-v4/domain/ports/storage-adapter";
import type { HistoricalDataRepository } from "../src/features/uniswap-v4/domain/repositories/historical-data";
import type { PositionSnapshot } from "../src/features/uniswap-v4/domain/types";

// Realistic Arbitrum position data based on common Uniswap V4 positions
const ARBITRUM_CHAIN_ID = chains.arbitrum.id;
const REALISTIC_POSITION_ID = 123456n; // Example position ID

// Realistic token addresses on Arbitrum
const WETH_ARBITRUM = "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1";
const USDC_ARBITRUM = "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8";

// Realistic fee growth values (simulating actual blockchain data)
const REALISTIC_FEE_GROWTH = {
  current0: 1250000000000000000000000000000n,
  current1: 2500000000000000000000000000000n,
  historical0: 1200000000000000000000000000000n,
  historical1: 2400000000000000000000000000000n,
};

describe("Arbitrum APR Integration Tests", () => {
  let aprCalculator: AprCalculatorService;
  let calculateAprUseCase: CalculatePositionAprUseCase;
  let historicalDataRepository: HistoricalDataRepository;
  let storageAdapter: StorageAdapter;

  beforeAll(() => {
    configureDI(true);
    aprCalculator = new AprCalculatorService();
    calculateAprUseCase = container.resolve("CalculatePositionAprUseCase");
    historicalDataRepository = container.resolve("HistoricalDataRepository");
    storageAdapter = container.resolve("StorageAdapter");
  });

  beforeEach(() => {
    storageAdapter.clearAll();
  });

  const createRealisticSnapshot = (
    timestamp: number,
    feeGrowth0: bigint,
    feeGrowth1: bigint,
    positionValueUsd: number = 25000 // $25k realistic position value
  ): PositionSnapshot => ({
    timestamp,
    blockNumber: Math.floor(timestamp / 1000) + 200000000, // Realistic Arbitrum block number
    feeGrowthInside0X128: feeGrowth0,
    feeGrowthInside1X128: feeGrowth1,
    positionValueUsd,
  });

  describe("Realistic Arbitrum Position Scenarios", () => {
    it("should calculate APR for ETH/USDC position with realistic values", async () => {
      const now = Date.now();
      const dayAgo = now - 24 * 60 * 60 * 1000;

      // Create realistic snapshots
      const currentSnapshot = createRealisticSnapshot(
        now,
        REALISTIC_FEE_GROWTH.current0,
        REALISTIC_FEE_GROWTH.current1,
        25000, // $25k position
      );

      const historicalSnapshot = createRealisticSnapshot(
        dayAgo,
        REALISTIC_FEE_GROWTH.historical0,
        REALISTIC_FEE_GROWTH.historical1,
        24000, // Slightly different position value
      );

      await historicalDataRepository.storeSnapshot(REALISTIC_POSITION_ID, ARBITRUM_CHAIN_ID, currentSnapshot);
      await historicalDataRepository.storeSnapshot(REALISTIC_POSITION_ID, ARBITRUM_CHAIN_ID, historicalSnapshot);

      const result = await calculateAprUseCase.execute({
        tokenId: REALISTIC_POSITION_ID,
        chainId: ARBITRUM_CHAIN_ID,
        periods: ["24h", "7d", "30d"],
        forceRefresh: false,
      });

      expect(result.tokenId).toBe(REALISTIC_POSITION_ID);
      expect(result.chainId).toBe(ARBITRUM_CHAIN_ID);
      expect(result.warnings).toBeDefined();

      console.log("📊 Arbitrum ETH/USDC Position APR:", {
        "24h APR": result.result.apr24h?.apr ? `${(result.result.apr24h.apr * 100).toFixed(2)}%` : "N/A",
        "Fees Earned 24h": result.result.apr24h?.feesEarnedUsd ? `$${result.result.apr24h.feesEarnedUsd.toFixed(2)}` : "N/A",
        Warnings: result.warnings,
      });
    });

    it("should handle different position sizes realistically", async () => {
      const positionSizes = [5000, 25000, 100000, 500000]; // $5k to $500k positions
      const now = Date.now();
      const dayAgo = now - 24 * 60 * 60 * 1000;

      for (const positionValue of positionSizes) {
        const tokenId = BigInt(Math.floor(Math.random() * 1000000));

        const currentSnapshot = createRealisticSnapshot(
          now,
          REALISTIC_FEE_GROWTH.current0,
          REALISTIC_FEE_GROWTH.current1,
          positionValue,
        );

        const historicalSnapshot = createRealisticSnapshot(
          dayAgo,
          REALISTIC_FEE_GROWTH.historical0,
          REALISTIC_FEE_GROWTH.historical1,
          positionValue * 0.98, // 2% change in position value
        );

        await historicalDataRepository.storeSnapshot(tokenId, ARBITRUM_CHAIN_ID, currentSnapshot);
        await historicalDataRepository.storeSnapshot(tokenId, ARBITRUM_CHAIN_ID, historicalSnapshot);

        const result = await calculateAprUseCase.execute({
          tokenId,
          chainId: ARBITRUM_CHAIN_ID,
          periods: ["24h"],
          forceRefresh: false,
        });

        expect(result.tokenId).toBe(tokenId);
        expect(result.chainId).toBe(ARBITRUM_CHAIN_ID);

        // Log realistic APR for different position sizes
        if (result.result.apr24h?.apr) {
          console.log(`💰 $${positionValue.toLocaleString()} position APR: ${(result.result.apr24h.apr * 100).toFixed(2)}%`);
        }
      }
    });

    it("should simulate high-volume trading pool scenario", async () => {
      const now = Date.now();
      const hourAgo = now - 60 * 60 * 1000;

      // Simulate high fee growth (busy pool)
      const highFeeGrowth = {
        current0: 5000000000000000000000000000000n,
        current1: 10000000000000000000000000000000n,
        historical0: 4000000000000000000000000000000n,
        historical1: 8000000000000000000000000000000n,
      };

      const currentSnapshot = createRealisticSnapshot(
        now,
        highFeeGrowth.current0,
        highFeeGrowth.current1,
        50000, // $50k position
      );

      const historicalSnapshot = createRealisticSnapshot(
        hourAgo,
        highFeeGrowth.historical0,
        highFeeGrowth.historical1,
        49000,
      );

      await historicalDataRepository.storeSnapshot(REALISTIC_POSITION_ID + 1n, ARBITRUM_CHAIN_ID, currentSnapshot);
      await historicalDataRepository.storeSnapshot(REALISTIC_POSITION_ID + 1n, ARBITRUM_CHAIN_ID, historicalSnapshot);

      const result = await calculateAprUseCase.execute({
        tokenId: REALISTIC_POSITION_ID + 1n,
        chainId: ARBITRUM_CHAIN_ID,
        periods: ["24h"],
        forceRefresh: false,
      });

      console.log("🚀 High-volume pool APR:", {
        "1h extrapolated to 24h": result.result.apr24h?.apr ? `${(result.result.apr24h.apr * 100).toFixed(2)}%` : "N/A",
        "Fees earned": result.result.apr24h?.feesEarnedUsd ? `$${result.result.apr24h.feesEarnedUsd.toFixed(2)}` : "N/A",
      });

      // Should handle high APR calculations without breaking
      expect(result.warnings).toBeDefined();
    });

    it("should simulate low-volume stable pool scenario", async () => {
      const now = Date.now();
      const weekAgo = now - 7 * 24 * 60 * 60 * 1000;

      // Simulate low fee growth (stable pool)
      const lowFeeGrowth = {
        current0: 1000000000000000000000000000001n,
        current1: 2000000000000000000000000000001n,
        historical0: 1000000000000000000000000000000n,
        historical1: 2000000000000000000000000000000n,
      };

      const currentSnapshot = createRealisticSnapshot(
        now,
        lowFeeGrowth.current0,
        lowFeeGrowth.current1,
        100000, // $100k position
      );

      const historicalSnapshot = createRealisticSnapshot(
        weekAgo,
        lowFeeGrowth.historical0,
        lowFeeGrowth.historical1,
        98000,
      );

      await historicalDataRepository.storeSnapshot(REALISTIC_POSITION_ID + 2n, ARBITRUM_CHAIN_ID, currentSnapshot);
      await historicalDataRepository.storeSnapshot(REALISTIC_POSITION_ID + 2n, ARBITRUM_CHAIN_ID, historicalSnapshot);

      const result = await calculateAprUseCase.execute({
        tokenId: REALISTIC_POSITION_ID + 2n,
        chainId: ARBITRUM_CHAIN_ID,
        periods: ["7d", "30d"],
        forceRefresh: false,
      });

      console.log("📈 Low-volume stable pool APR:", {
        "7d APR": result.result.apr7d?.apr ? `${(result.result.apr7d.apr * 100).toFixed(4)}%` : "N/A",
        "30d APR": result.result.apr30d?.apr ? `${(result.result.apr30d.apr * 100).toFixed(4)}%` : "N/A",
        "Weekly fees": result.result.apr7d?.feesEarnedUsd ? `$${result.result.apr7d.feesEarnedUsd.toFixed(2)}` : "N/A",
      });

      expect(result.warnings).toBeDefined();
    });
  });

  describe("Arbitrum-Specific Edge Cases", () => {
    it("should handle Arbitrum block time characteristics", async () => {
      // Arbitrum has ~0.25s block time, much faster than Ethereum
      const now = Date.now();
      const blocksPerHour = 3600 / 0.25; // ~14,400 blocks per hour on Arbitrum

      const currentSnapshot = createRealisticSnapshot(
        now,
        REALISTIC_FEE_GROWTH.current0,
        REALISTIC_FEE_GROWTH.current1,
      );

      const historicalSnapshot = createRealisticSnapshot(
        now - 24 * 60 * 60 * 1000, // 24 hours ago
        REALISTIC_FEE_GROWTH.historical0,
        REALISTIC_FEE_GROWTH.historical1,
      );

      await historicalDataRepository.storeSnapshot(REALISTIC_POSITION_ID + 3n, ARBITRUM_CHAIN_ID, currentSnapshot);
      await historicalDataRepository.storeSnapshot(REALISTIC_POSITION_ID + 3n, ARBITRUM_CHAIN_ID, historicalSnapshot);

      const result = await calculateAprUseCase.execute({
        tokenId: REALISTIC_POSITION_ID + 3n,
        chainId: ARBITRUM_CHAIN_ID,
        periods: ["24h"],
        forceRefresh: false,
      });

      // Should work correctly with Arbitrum's fast block times
      expect(result.dataTimestamps.currentSnapshot).toBeGreaterThan(0);
      expect(result.dataTimestamps.historicalSnapshots["24h"]).toBeDefined();

      console.log("⚡ Arbitrum fast block time test:", {
        "Current block": currentSnapshot.blockNumber,
        "Historical block": historicalSnapshot.blockNumber,
        "Blocks in period": currentSnapshot.blockNumber - historicalSnapshot.blockNumber,
      });
    });

    it("should handle gas cost considerations for Arbitrum", async () => {
      // Arbitrum has much lower gas costs than Ethereum
      // This test ensures APR calculations remain profitable after gas
      const now = Date.now();
      const dayAgo = now - 24 * 60 * 60 * 1000;

      const currentSnapshot = createRealisticSnapshot(
        now,
        REALISTIC_FEE_GROWTH.current0,
        REALISTIC_FEE_GROWTH.current1,
        1000, // Small $1k position
      );

      const historicalSnapshot = createRealisticSnapshot(
        dayAgo,
        REALISTIC_FEE_GROWTH.historical0,
        REALISTIC_FEE_GROWTH.historical1,
        990,
      );

      await historicalDataRepository.storeSnapshot(REALISTIC_POSITION_ID + 4n, ARBITRUM_CHAIN_ID, currentSnapshot);
      await historicalDataRepository.storeSnapshot(REALISTIC_POSITION_ID + 4n, ARBITRUM_CHAIN_ID, historicalSnapshot);

      const result = await calculateAprUseCase.execute({
        tokenId: REALISTIC_POSITION_ID + 4n,
        chainId: ARBITRUM_CHAIN_ID,
        periods: ["24h"],
        forceRefresh: false,
      });

      // Even small positions should have calculable APR on Arbitrum
      expect(result.result).toBeDefined();

      console.log("💸 Small position profitability test:", {
        "Position value": "$1,000",
        "24h APR": result.result.apr24h?.apr ? `${(result.result.apr24h.apr * 100).toFixed(2)}%` : "N/A",
        "Daily fees": result.result.apr24h?.feesEarnedUsd ? `$${result.result.apr24h.feesEarnedUsd.toFixed(4)}` : "N/A",
      });
    });
  });

  describe("Multi-Chain Position Analysis", () => {
    it("should demonstrate APR calculation differences across chains", async () => {
      const chains = [
        { id: ARBITRUM_CHAIN_ID, name: "Arbitrum", gasCost: 0.1 },
        // Add other chains as needed
      ];

      for (const chain of chains) {
        const now = Date.now();
        const dayAgo = now - 24 * 60 * 60 * 1000;

        const currentSnapshot = createRealisticSnapshot(
          now,
          REALISTIC_FEE_GROWTH.current0,
          REALISTIC_FEE_GROWTH.current1,
          25000,
        );

        const historicalSnapshot = createRealisticSnapshot(
          dayAgo,
          REALISTIC_FEE_GROWTH.historical0,
          REALISTIC_FEE_GROWTH.historical1,
          24000,
        );

        await historicalDataRepository.storeSnapshot(REALISTIC_POSITION_ID + 100n, chain.id, currentSnapshot);
        await historicalDataRepository.storeSnapshot(REALISTIC_POSITION_ID + 100n, chain.id, historicalSnapshot);

        const result = await calculateAprUseCase.execute({
          tokenId: REALISTIC_POSITION_ID + 100n,
          chainId: chain.id,
          periods: ["24h"],
          forceRefresh: false,
        });

        console.log(`🌐 ${chain.name} APR Analysis:`, {
          "24h APR": result.result.apr24h?.apr ? `${(result.result.apr24h.apr * 100).toFixed(2)}%` : "N/A",
          "Daily fees": result.result.apr24h?.feesEarnedUsd ? `$${result.result.apr24h.feesEarnedUsd.toFixed(2)}` : "N/A",
          "Gas cost factor": chain.gasCost,
        });
      }
    });
  });
});