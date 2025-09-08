import { Address } from "viem";

import { SupportedChain, UniswapV4Position } from "../types";

export interface UniswapV4Repository {
  getUserPositions(userAddress: Address, chain?: SupportedChain): Promise<UniswapV4Position[]>;
}
