import { inject, injectable } from "tsyringe";
import { Address } from "viem";

import { SupportedChain, UniswapV4Position } from "../../types/uniswap-v4";
import { UniswapV4Repository } from "../repositories/uniswap-v4-repository";

export interface GetUserPositionsUseCase {
  execute(userAddress: Address, chain?: SupportedChain, useCache?: boolean): Promise<UniswapV4Position[]>;
}

export interface ClearPositionsCacheUseCase {
  execute(userAddress: Address): Promise<void>;
}

@injectable()
export class GetUserPositionsUseCaseImpl implements GetUserPositionsUseCase {
  constructor(@inject("UniswapV4Repository") private uniswapV4Repository: UniswapV4Repository) {}

  async execute(userAddress: Address, chain?: SupportedChain, useCache: boolean = true): Promise<UniswapV4Position[]> {
    try {
      if (useCache) {
        return await this.uniswapV4Repository.getCachedUserPositions(userAddress, chain);
      }

      if (chain) {
        return await this.uniswapV4Repository.getUserPositions(userAddress, chain);
      }

      return await this.uniswapV4Repository.getUserPositionsAllChains(userAddress);
    } catch (error) {
      console.error("Error in GetUserPositionsUseCase:", error);
      throw new Error(`Failed to get user positions: ${error}`);
    }
  }
}

@injectable()
export class ClearPositionsCacheUseCaseImpl implements ClearPositionsCacheUseCase {
  constructor(@inject("UniswapV4Repository") private uniswapV4Repository: UniswapV4Repository) {}

  async execute(userAddress: Address): Promise<void> {
    try {
      await this.uniswapV4Repository.clearPositionsCache(userAddress);
    } catch (error) {
      console.error("Error in ClearPositionsCacheUseCase:", error);
      throw new Error(`Failed to clear positions cache: ${error}`);
    }
  }
}
