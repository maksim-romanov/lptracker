import { createPublicClient, http, type PublicClient } from "viem";

import { getChainConfig, type SupportedChainId } from "../configs";

export function makePublicClient(chainId: SupportedChainId): PublicClient {
  const config = getChainConfig(chainId);
  return createPublicClient({ chain: config.viemChain, transport: http() });
}
