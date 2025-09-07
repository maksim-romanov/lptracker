import { injectable } from "tsyringe";
import { Address } from "viem";

import { UniswapV4Repository } from "../../domain/repositories/uniswap-v4-repository";
import { SupportedChain, UniswapV4Position } from "../../types/uniswap-v4";
import { UniswapV4Service } from "../services/uniswap-v4-service";

@injectable()
export class UniswapV4RepositoryImpl implements UniswapV4Repository {
  private positionsCache = new Map<string, { positions: UniswapV4Position[]; timestamp: number }>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  async getUserPositions(userAddress: Address, chain: SupportedChain): Promise<UniswapV4Position[]> {
    try {
      const service = new UniswapV4Service(chain);
      return await service.fetchUserPositions(userAddress);
    } catch (error) {
      console.error(`Error fetching positions for ${userAddress} on ${chain}:`, error);
      throw error;
    }
  }

  async getUserPositionsAllChains(userAddress: Address): Promise<UniswapV4Position[]> {
    try {
      return await UniswapV4Service.fetchUserPositionsAllChains(userAddress);
    } catch (error) {
      console.error(`Error fetching positions for ${userAddress} on all chains:`, error);
      throw error;
    }
  }

  async getCachedUserPositions(userAddress: Address, chain?: SupportedChain): Promise<UniswapV4Position[]> {
    const cacheKey = chain ? `${userAddress}-${chain}` : `${userAddress}-all`;
    const cached = this.positionsCache.get(cacheKey);

    // Check if there's a valid cache
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.positions;
    }

    // Get fresh data
    let positions: UniswapV4Position[];
    if (chain) {
      positions = await this.getUserPositions(userAddress, chain);
    } else {
      positions = await this.getUserPositionsAllChains(userAddress);
    }

    // Update cache
    this.positionsCache.set(cacheKey, {
      positions,
      timestamp: Date.now(),
    });

    return positions;
  }

  async clearPositionsCache(userAddress: Address): Promise<void> {
    // Remove all caches for this user
    const keysToDelete = Array.from(this.positionsCache.keys()).filter((key) => key.startsWith(userAddress));

    keysToDelete.forEach((key) => this.positionsCache.delete(key));
  }
}
