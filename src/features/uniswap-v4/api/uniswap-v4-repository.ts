import { injectable } from "tsyringe";
import { Address } from "viem";

import { UniswapV4Service } from "./uniswap-v4-service";
import { SUPPORTED_CHAINS } from "../../../lib/config";
import { UniswapV4Repository } from "../model/repositories/uniswap-v4-repository";
import { SupportedChain, UniswapV4Position } from "../model/types";

@injectable()
export class UniswapV4RepositoryImpl implements UniswapV4Repository {
  async getUserPositions(userAddress: Address, chain?: SupportedChain): Promise<UniswapV4Position[]> {
    if (chain) {
      const service = new UniswapV4Service(chain);
      return await service.fetchUserPositions(userAddress);
    }

    const chains = SUPPORTED_CHAINS as SupportedChain[];
    const results = await Promise.allSettled(
      chains.map((c) => new UniswapV4Service(c).fetchUserPositions(userAddress)),
    );

    return results.flatMap((r) => (r.status === "fulfilled" ? r.value : []));
  }
}
