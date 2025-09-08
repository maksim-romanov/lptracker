import { Address } from "viem";

import { UNISWAP_V4_TOKENS } from "features/uniswap-v4/api/tokens";

import { SupportedChain, UniswapV4Position } from "../../model/types";
import type { UniswapV4Repository } from "../repositories/uniswap-v4-repository";

export interface GetUserPositionsUseCase {
  execute(userAddress: Address, chain?: SupportedChain): Promise<UniswapV4Position[]>;
}

export class GetUserPositionsUseCaseImpl implements GetUserPositionsUseCase {
  constructor(private uniswapV4Repository: UniswapV4Repository) {}

  async execute(userAddress: Address, chain?: SupportedChain): Promise<UniswapV4Position[]> {
    try {
      return await this.uniswapV4Repository.getUserPositions(userAddress, chain);
    } catch (error) {
      console.error("Error in GetUserPositionsUseCase:", error);
      throw new Error(`Failed to get user positions: ${error}`);
    }
  }
}
