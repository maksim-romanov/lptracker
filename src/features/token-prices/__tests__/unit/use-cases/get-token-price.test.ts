import "reflect-metadata";
import { beforeEach, describe, expect, it, mock } from "bun:test";
import { container } from "tsyringe";
import type { Address } from "viem";

import { GetTokenPriceUseCase } from "../../../application/use-cases/get-token-price";
import type { PriceProviderRepository } from "../../../domain/repositories";
import type { TokenPrice } from "../../../domain/types";

describe("GetTokenPriceUseCase", () => {
  const mockTokenAddress = "0xA0b86a33E6417aAb7b6DbCBbe9FD4E89c0778a4B" as Address;
  const mockChainId = 1;

  beforeEach(() => {
    // Clear DI container before each test
    container.clearInstances();
  });

  const createMockTokenPrice = (source: string, price = 100): TokenPrice => ({
    tokenAddress: mockTokenAddress,
    chainId: mockChainId,
    price,
    timestamp: new Date(),
    source,
  });

  const createMockProvider = (
    name: string,
    behavior: "success" | "error" = "success",
    price = 100
  ): PriceProviderRepository => ({
    name,
    getTokenPrice: mock(async () => {
      if (behavior === "error") {
        throw new Error(`${name} failed`);
      }
      return createMockTokenPrice(name, price);
    }),
  });

  describe("Provider Selection", () => {
    it("should return price from first provider when it succeeds", async () => {
      const provider1 = createMockProvider("Provider1", "success", 100);
      const provider2 = createMockProvider("Provider2", "success", 200);

      // Register providers in DI container
      container.register<PriceProviderRepository>("PriceProvider", { useValue: provider1 });
      container.register<PriceProviderRepository>("PriceProvider", { useValue: provider2 });
      container.register<GetTokenPriceUseCase>("GetTokenPriceUseCase", { useClass: GetTokenPriceUseCase });

      const useCase = container.resolve<GetTokenPriceUseCase>("GetTokenPriceUseCase");

      const result = await useCase.execute({
        tokenAddress: mockTokenAddress,
        chainId: mockChainId,
      });

      expect(result.source).toBe("Provider1");
      expect(result.price).toBe(100);
      expect(provider1.getTokenPrice).toHaveBeenCalledTimes(1);
      expect(provider2.getTokenPrice).not.toHaveBeenCalled();
    });

    it("should fallback to second provider when first fails", async () => {
      const provider1 = createMockProvider("Provider1", "error");
      const provider2 = createMockProvider("Provider2", "success", 200);

      container.register<PriceProviderRepository>("PriceProvider", { useValue: provider1 });
      container.register<PriceProviderRepository>("PriceProvider", { useValue: provider2 });
      container.register<GetTokenPriceUseCase>("GetTokenPriceUseCase", { useClass: GetTokenPriceUseCase });

      const useCase = container.resolve<GetTokenPriceUseCase>("GetTokenPriceUseCase");

      const result = await useCase.execute({
        tokenAddress: mockTokenAddress,
        chainId: mockChainId,
      });

      expect(result.source).toBe("Provider2");
      expect(result.price).toBe(200);
      expect(provider1.getTokenPrice).toHaveBeenCalledTimes(1);
      expect(provider2.getTokenPrice).toHaveBeenCalledTimes(1);
    });

    it("should try all providers in order until one succeeds", async () => {
      const provider1 = createMockProvider("Provider1", "error");
      const provider2 = createMockProvider("Provider2", "error");
      const provider3 = createMockProvider("Provider3", "success", 300);
      const provider4 = createMockProvider("Provider4", "success", 400);

      container.register<PriceProviderRepository>("PriceProvider", { useValue: provider1 });
      container.register<PriceProviderRepository>("PriceProvider", { useValue: provider2 });
      container.register<PriceProviderRepository>("PriceProvider", { useValue: provider3 });
      container.register<PriceProviderRepository>("PriceProvider", { useValue: provider4 });
      container.register<GetTokenPriceUseCase>("GetTokenPriceUseCase", { useClass: GetTokenPriceUseCase });

      const useCase = container.resolve<GetTokenPriceUseCase>("GetTokenPriceUseCase");

      const result = await useCase.execute({
        tokenAddress: mockTokenAddress,
        chainId: mockChainId,
      });

      expect(result.source).toBe("Provider3");
      expect(result.price).toBe(300);
      expect(provider1.getTokenPrice).toHaveBeenCalledTimes(1);
      expect(provider2.getTokenPrice).toHaveBeenCalledTimes(1);
      expect(provider3.getTokenPrice).toHaveBeenCalledTimes(1);
      expect(provider4.getTokenPrice).not.toHaveBeenCalled();
    });
  });

  describe("Error Handling", () => {
    it("should throw error when no providers are configured", async () => {
      // Don't register any providers, create use case directly with empty array
      const useCase = new GetTokenPriceUseCase([]);

      await expect(
        useCase.execute({
          tokenAddress: mockTokenAddress,
          chainId: mockChainId,
        })
      ).rejects.toThrow("No price providers configured");
    });

    it("should throw error when all providers fail", async () => {
      const provider1 = createMockProvider("Provider1", "error");
      const provider2 = createMockProvider("Provider2", "error");
      const provider3 = createMockProvider("Provider3", "error");

      container.register<PriceProviderRepository>("PriceProvider", { useValue: provider1 });
      container.register<PriceProviderRepository>("PriceProvider", { useValue: provider2 });
      container.register<PriceProviderRepository>("PriceProvider", { useValue: provider3 });
      container.register<GetTokenPriceUseCase>("GetTokenPriceUseCase", { useClass: GetTokenPriceUseCase });

      const useCase = container.resolve<GetTokenPriceUseCase>("GetTokenPriceUseCase");

      await expect(
        useCase.execute({
          tokenAddress: mockTokenAddress,
          chainId: mockChainId,
        })
      ).rejects.toThrow("All price providers failed");
    });

    it("should include all provider errors in final error message", async () => {
      const provider1 = createMockProvider("DeFiLlama", "error");
      const provider2 = createMockProvider("Chainlink", "error");

      container.register<PriceProviderRepository>("PriceProvider", { useValue: provider1 });
      container.register<PriceProviderRepository>("PriceProvider", { useValue: provider2 });
      container.register<GetTokenPriceUseCase>("GetTokenPriceUseCase", { useClass: GetTokenPriceUseCase });

      const useCase = container.resolve<GetTokenPriceUseCase>("GetTokenPriceUseCase");

      try {
        await useCase.execute({
          tokenAddress: mockTokenAddress,
          chainId: mockChainId,
        });
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        const errorMessage = (error as Error).message;
        expect(errorMessage).toContain("All price providers failed");
        expect(errorMessage).toContain("DeFiLlama: DeFiLlama failed");
        expect(errorMessage).toContain("Chainlink: Chainlink failed");
      }
    });

    it("should handle provider throwing non-Error objects", async () => {
      const provider: PriceProviderRepository = {
        name: "BadProvider",
        getTokenPrice: mock(async () => {
          throw "String error"; // eslint-disable-line @typescript-eslint/only-throw-error
        }),
      };

      const useCase = new GetTokenPriceUseCase([provider]);

      try {
        await useCase.execute({
          tokenAddress: mockTokenAddress,
          chainId: mockChainId,
        });
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        const errorMessage = (error as Error).message;
        expect(errorMessage).toContain("BadProvider: Unknown error");
      }
    });
  });

  describe("Provider Parameters", () => {
    it("should pass correct tokenAddress to provider", async () => {
      const provider = createMockProvider("Provider1");

      container.register<PriceProviderRepository>("PriceProvider", { useValue: provider });
      container.register<GetTokenPriceUseCase>("GetTokenPriceUseCase", { useClass: GetTokenPriceUseCase });

      const useCase = container.resolve<GetTokenPriceUseCase>("GetTokenPriceUseCase");

      await useCase.execute({
        tokenAddress: mockTokenAddress,
        chainId: mockChainId,
      });

      expect(provider.getTokenPrice).toHaveBeenCalledWith(mockTokenAddress, mockChainId);
    });

    it("should pass correct chainId to provider", async () => {
      const provider = createMockProvider("Provider1");
      const arbitrumChainId = 42161;

      container.register<PriceProviderRepository>("PriceProvider", { useValue: provider });
      container.register<GetTokenPriceUseCase>("GetTokenPriceUseCase", { useClass: GetTokenPriceUseCase });

      const useCase = container.resolve<GetTokenPriceUseCase>("GetTokenPriceUseCase");

      await useCase.execute({
        tokenAddress: mockTokenAddress,
        chainId: arbitrumChainId,
      });

      expect(provider.getTokenPrice).toHaveBeenCalledWith(mockTokenAddress, arbitrumChainId);
    });
  });

  describe("Response Validation", () => {
    it("should return complete TokenPrice object", async () => {
      const provider = createMockProvider("Provider1", "success", 1500.5);

      container.register<PriceProviderRepository>("PriceProvider", { useValue: provider });
      container.register<GetTokenPriceUseCase>("GetTokenPriceUseCase", { useClass: GetTokenPriceUseCase });

      const useCase = container.resolve<GetTokenPriceUseCase>("GetTokenPriceUseCase");

      const result = await useCase.execute({
        tokenAddress: mockTokenAddress,
        chainId: mockChainId,
      });

      expect(result).toMatchObject({
        tokenAddress: mockTokenAddress,
        chainId: mockChainId,
        price: 1500.5,
        source: "Provider1",
      });
      expect(result.timestamp).toBeInstanceOf(Date);
    });

    it("should preserve optional fields from provider", async () => {
      const providerWithChange: PriceProviderRepository = {
        name: "ProviderWithChange",
        getTokenPrice: mock(async () => ({
          tokenAddress: mockTokenAddress,
          chainId: mockChainId,
          price: 100,
          priceChange24h: 5.5,
          timestamp: new Date(),
          source: "ProviderWithChange",
        })),
      };

      container.register<PriceProviderRepository>("PriceProvider", { useValue: providerWithChange });
      container.register<GetTokenPriceUseCase>("GetTokenPriceUseCase", { useClass: GetTokenPriceUseCase });

      const useCase = container.resolve<GetTokenPriceUseCase>("GetTokenPriceUseCase");

      const result = await useCase.execute({
        tokenAddress: mockTokenAddress,
        chainId: mockChainId,
      });

      expect(result.priceChange24h).toBe(5.5);
    });
  });

  describe("Edge Cases", () => {
    it("should handle single provider successfully", async () => {
      const provider = createMockProvider("OnlyProvider");

      container.register<PriceProviderRepository>("PriceProvider", { useValue: provider });
      container.register<GetTokenPriceUseCase>("GetTokenPriceUseCase", { useClass: GetTokenPriceUseCase });

      const useCase = container.resolve<GetTokenPriceUseCase>("GetTokenPriceUseCase");

      const result = await useCase.execute({
        tokenAddress: mockTokenAddress,
        chainId: mockChainId,
      });

      expect(result.source).toBe("OnlyProvider");
    });

    it("should handle many providers efficiently", async () => {
      const providers = Array.from({ length: 10 }, (_, i) =>
        createMockProvider(`Provider${i}`, i < 9 ? "error" : "success")
      );

      providers.forEach((provider) => {
        container.register<PriceProviderRepository>("PriceProvider", { useValue: provider });
      });
      container.register<GetTokenPriceUseCase>("GetTokenPriceUseCase", { useClass: GetTokenPriceUseCase });

      const useCase = container.resolve<GetTokenPriceUseCase>("GetTokenPriceUseCase");

      const result = await useCase.execute({
        tokenAddress: mockTokenAddress,
        chainId: mockChainId,
      });

      expect(result.source).toBe("Provider9");
      // Only providers 0-9 should be called (stops after success)
      expect(providers[9].getTokenPrice).toHaveBeenCalledTimes(1);
    });
  });
});
