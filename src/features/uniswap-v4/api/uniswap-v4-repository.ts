import { Address } from "viem";

import { UniswapV4ServiceFactory } from "./uniswap-v4-service-factory";
import { SUPPORTED_CHAINS } from "../../../lib/config";
import { UniswapV4Repository } from "../model/repositories/uniswap-v4-repository";
import { SupportedChain, UniswapV4Position } from "../model/types";

export class UniswapV4RepositoryImpl implements UniswapV4Repository {
  constructor(private serviceFactory: UniswapV4ServiceFactory) {}

  async getUserPositions(userAddress: Address, chain?: SupportedChain): Promise<UniswapV4Position[]> {
    if (chain) {
      const service = this.serviceFactory.getService(chain);
      return await service.fetchUserPositions(userAddress);
    }

    const chains = SUPPORTED_CHAINS as SupportedChain[];
    const results = await Promise.allSettled(
      chains.map((c) => this.serviceFactory.getService(c).fetchUserPositions(userAddress)),
    );

    return results.flatMap((r) => (r.status === "fulfilled" ? r.value : []));
  }
}
