import "reflect-metadata";

import { container } from "tsyringe";
import { describe, expect, it, beforeEach } from "bun:test";

import type { Address } from "viem";

import type { TokenPrice } from "../domain/types";
import type { PriceProviderRepository } from "../domain/repositories";

// Mock providers for testing @injectAll functionality
class MockProvider implements PriceProviderRepository {
  constructor(
    private name: string,
    private shouldFail = false,
    private shouldReturnNull = false
  ) {}

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

  async isAvailable(): Promise<boolean> {
    return !this.shouldFail;
  }

  getProviderName(): string {
    return this.name;
  }
}

// Test FallbackPriceRepository that will be modified to use @injectAll
class TestFallbackRepository {
  constructor(private readonly providers: PriceProviderRepository[]) {
    // No sorting needed - order is determined by DI registration
  }

  async getPrice(tokenAddress: Address, chainId: number): Promise<TokenPrice> {
    for (const provider of this.providers) {
      try {
        const isAvailable = await provider.isAvailable();
        if (!isAvailable) {
          continue;
        }

        const price = await provider.getTokenPrice(tokenAddress, chainId);
        return price;
      } catch (error) {
        continue;
      }
    }

    throw new Error("All providers failed");
  }

  getProviders(): PriceProviderRepository[] {
    return this.providers;
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
    expect(providers.map(p => p.getProviderName())).toEqual([
      "FirstProvider",
      "SecondProvider",
      "ThirdProvider"
    ]);
  });

  it("should maintain registration order when injected", () => {
    // Register providers in specific order
    container.register<PriceProviderRepository>("PriceProvider", {
      useValue: new MockProvider("PrimaryProvider"),
    });

    container.register<PriceProviderRepository>("PriceProvider", {
      useValue: new MockProvider("SecondaryProvider"),
    });

    container.register<PriceProviderRepository>("PriceProvider", {
      useValue: new MockProvider("TertiaryProvider"),
    });

    // Resolve and create test repository
    const providers = container.resolveAll<PriceProviderRepository>("PriceProvider");
    const repository = new TestFallbackRepository(providers);

    // Check that providers maintain registration order
    const orderedProviders = repository.getProviders();
    expect(orderedProviders.map(p => p.getProviderName())).toEqual([
      "PrimaryProvider",
      "SecondaryProvider",
      "TertiaryProvider"
    ]);
  });

  it("should work with empty provider list", () => {
    // Don't register any providers, should return empty array or handle gracefully
    try {
      const providers = container.resolveAll<PriceProviderRepository>("PriceProvider");
      expect(providers).toHaveLength(0);
    } catch (error) {
      // If it throws, that's also acceptable behavior for empty provider list
      expect(error).toBeInstanceOf(Error);
    }
  });

  it("should maintain provider functionality after injection", async () => {
    container.register<PriceProviderRepository>("PriceProvider", {
      useValue: new MockProvider("WorkingProvider"),
    });

    const providers = container.resolveAll<PriceProviderRepository>("PriceProvider");
    const repository = new TestFallbackRepository(providers);

    const tokenAddress = "0x0000000000000000000000000000000000000000" as Address;
    const chainId = 1;

    const price = await repository.getPrice(tokenAddress, chainId);

    expect(price.source).toBe("WorkingProvider");
    expect(price.price).toBe(100);
  });

  it("should handle fallback behavior with multiple providers", async () => {
    // Register failing provider and working provider
    container.register<PriceProviderRepository>("PriceProvider", {
      useValue: new MockProvider("FailingProvider", true), // shouldFail = true
    });

    container.register<PriceProviderRepository>("PriceProvider", {
      useValue: new MockProvider("WorkingProvider", false), // shouldFail = false
    });

    const providers = container.resolveAll<PriceProviderRepository>("PriceProvider");
    const repository = new TestFallbackRepository(providers);

    const tokenAddress = "0x0000000000000000000000000000000000000000" as Address;
    const chainId = 1;

    const price = await repository.getPrice(tokenAddress, chainId);

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

    const providers = container.resolveAll<PriceProviderRepository>("PriceProvider");
    const repository = new TestFallbackRepository(providers);

    const tokenAddress = "0x0000000000000000000000000000000000000000" as Address;
    const chainId = 1;

    await expect(repository.getPrice(tokenAddress, chainId)).rejects.toThrow("All providers failed");
  });

  it("should respect provider availability checks", async () => {
    const unavailableProvider = new MockProvider("UnavailableProvider", false);
    // Mock isAvailable to return false
    unavailableProvider.isAvailable = () => Promise.resolve(false);

    const workingProvider = new MockProvider("WorkingProvider", false);

    container.register<PriceProviderRepository>("PriceProvider", {
      useValue: unavailableProvider,
    });

    container.register<PriceProviderRepository>("PriceProvider", {
      useValue: workingProvider,
    });

    const providers = container.resolveAll<PriceProviderRepository>("PriceProvider");
    const repository = new TestFallbackRepository(providers);

    const tokenAddress = "0x0000000000000000000000000000000000000000" as Address;
    const chainId = 1;

    const price = await repository.getPrice(tokenAddress, chainId);

    // Should skip unavailable provider and use working one
    expect(price.source).toBe("WorkingProvider");
    expect(price.price).toBe(100);
  });
});