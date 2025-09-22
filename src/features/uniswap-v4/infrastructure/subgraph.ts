import { GraphQLClient } from "graphql-request";
import type { Address } from "viem";

import { getChainConfig, type SupportedChainId } from "../configs";
import { getSdk } from "./__generated__/subgraph";

function createSubgraphClient(chainId: SupportedChainId) {
  const config = getChainConfig(chainId);
  return new GraphQLClient(config.subgraphUrl, {
    headers: { Authorization: "Bearer " + process.env.GRAPH_KEY },
  });
}

export async function getPositionIds(owner: Address, chainId: SupportedChainId): Promise<bigint[]> {
  const client = createSubgraphClient(chainId);
  const sdk = getSdk(client);
  const response = await sdk.GetPositions({ owner: owner.toLowerCase() });
  return response.positions.map((p) => BigInt(p.tokenId));
}
