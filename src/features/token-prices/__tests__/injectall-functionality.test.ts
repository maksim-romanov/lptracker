import "reflect-metadata";

import { container } from "tsyringe";
import { describe, expect, it, beforeEach } from "bun:test";

import type { Address } from "viem";

import type { TokenPrice } from "../domain/types";
import type { PriceProviderRepository } from "../domain/repositories";
import { GetTokenPriceUseCase } from "../application/use-cases/get-token-price";

// Mock providers for testing @injectAll functionality
class MockProvider implements PriceProviderRepository {
  readonly name: string;

  constructor(
    name: string,
    private shouldFail = false,
    private shouldReturnNull = false
  ) {
    this.name = name;
  }

  async getTokenPrice(tokenAddress: Address, chainId: number): Promise<TokenPrice> {
    if (this.shouldFail) {
      throw new Error(`${this.name} failed`);
    }

    if (this.shouldReturnNull) {
      throw new Error(`${this.name} returned null`);
    }

    return {
      tokenAddress,
      chainId,
      price: 100,
      timestamp: new Date(),
      source: this.name,
    };
  }
}

describe("@injectAll Provider Injection", () => {
  beforeEach(() => {
    // Clear container before each test
    container.clearInstances();
  });

  it("should inject all registered providers using @injectAll", () => {
    // Register providers with same token
    container.register<PriceProviderRepository>("PriceProvider", {
      useValue: new MockProvider("FirstProvider"),
    });

    container.register<PriceProviderRepository>("PriceProvider", {
      useValue: new MockProvider("SecondProvider"),
    });

    container.register<PriceProviderRepository>("PriceProvider", {
      useValue: new MockProvider("ThirdProvider"),
    });

    // Resolve all providers
    const providers = container.resolveAll<PriceProviderRepository>("PriceProvider");

    expect(providers).toHaveLength(3);
    expect(providers.map(p => p.name)).toEqual([
      "FirstProvider",
      "SecondProvider",
      "ThirdProvider"
    ]);
  });

  it("should work with GetTokenPriceUseCase using @injectAll", async () => {
    // Register providers in specific order
    container.register<PriceProviderRepository>("PriceProvider", {
      useValue: new MockProvider("PrimaryProvider"),
    });

    container.register<PriceProviderRepository>("PriceProvider", {
      useValue: new MockProvider("SecondaryProvider"),
    });

    // Register the use case
    container.register<GetTokenPriceUseCase>("GetTokenPriceUseCase", {
      useClass: GetTokenPriceUseCase,
    });

    // Resolve the use case - it should receive all providers via @injectAll
    const useCase = container.resolve<GetTokenPriceUseCase>("GetTokenPriceUseCase");

    const tokenAddress = "0x0000000000000000000000000000000000000000" as Address;
    const chainId = 1;

    const price = await useCase.execute({ tokenAddress, chainId });

    // Should use the first (primary) provider
    expect(price.source).toBe("PrimaryProvider");
    expect(price.price).toBe(100);
  });

  it("should handle fallback behavior with GetTokenPriceUseCase", async () => {
    // Register failing provider and working provider
    container.register<PriceProviderRepository>("PriceProvider", {
      useValue: new MockProvider("FailingProvider", true), // shouldFail = true
    });

    container.register<PriceProviderRepository>("PriceProvider", {
      useValue: new MockProvider("WorkingProvider", false), // shouldFail = false
    });

    // Register the use case
    container.register<GetTokenPriceUseCase>("GetTokenPriceUseCase", {
      useClass: GetTokenPriceUseCase,
    });

    const useCase = container.resolve<GetTokenPriceUseCase>("GetTokenPriceUseCase");

    const tokenAddress = "0x0000000000000000000000000000000000000000" as Address;
    const chainId = 1;

    const price = await useCase.execute({ tokenAddress, chainId });

    // Should fallback to the working provider
    expect(price.source).toBe("WorkingProvider");
    expect(price.price).toBe(100);
  });

  it("should throw error when all providers fail", async () => {
    container.register<PriceProviderRepository>("PriceProvider", {
      useValue: new MockProvider("FailingProvider1", true),
    });

    container.register<PriceProviderRepository>("PriceProvider", {
      useValue: new MockProvider("FailingProvider2", true),
    });

    // Register the use case
    container.register<GetTokenPriceUseCase>("GetTokenPriceUseCase", {
      useClass: GetTokenPriceUseCase,
    });

    const useCase = container.resolve<GetTokenPriceUseCase>("GetTokenPriceUseCase");

    const tokenAddress = "0x0000000000000000000000000000000000000000" as Address;
    const chainId = 1;

    await expect(useCase.execute({ tokenAddress, chainId })).rejects.toThrow("All price providers failed");
  });

  it("should work with empty provider list", async () => {
    // Don't register any providers, should handle gracefully
    // Since @injectAll requires at least one registration for the token,
    // we need to test this differently by creating use case directly

    const useCase = new GetTokenPriceUseCase([]);

    const tokenAddress = "0x0000000000000000000000000000000000000000" as Address;
    const chainId = 1;

    await expect(useCase.execute({ tokenAddress, chainId })).rejects.toThrow("No price providers configured");
  });

  });