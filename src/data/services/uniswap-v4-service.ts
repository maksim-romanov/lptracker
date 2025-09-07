import { request } from "graphql-request";
import { Address, Chain, createPublicClient, http } from "viem";
import { arbitrum, mainnet } from "viem/chains";

import {
  PositionDetails,
  SubgraphPosition,
  SupportedChain,
  UNISWAP_V4_CONFIGS,
  UniswapV4Config,
  UniswapV4Position,
} from "../../types/uniswap-v4";
import { decodePositionInfo } from "../../utils/uniswap-v4";

const POSITION_MANAGER_ABI = [
  {
    name: "getPoolAndPositionInfo",
    type: "function",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [
      {
        name: "poolKey",
        type: "tuple",
        components: [
          { name: "currency0", type: "address" },
          { name: "currency1", type: "address" },
          { name: "fee", type: "uint24" },
          { name: "tickSpacing", type: "int24" },
          { name: "hooks", type: "address" },
        ],
      },
      { name: "info", type: "uint256" },
    ],
  },
  {
    name: "getPositionLiquidity",
    type: "function",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ name: "liquidity", type: "uint128" }],
  },
] as const;

const GET_POSITIONS_QUERY = `
  query GetPositions($owner: String!) {
    positions(where: { owner: $owner }) {
      tokenId
      owner
      id
    }
  }
`;

export class UniswapV4Service {
  private config: UniswapV4Config;
  private publicClient: any;

  constructor(chain: SupportedChain) {
    this.config = UNISWAP_V4_CONFIGS[chain];
    this.publicClient = this.createPublicClient(chain);
  }

  private createPublicClient(chain: SupportedChain) {
    const chainConfig: Chain = chain === "ethereum" ? mainnet : arbitrum;

    return createPublicClient({
      chain: chainConfig,
      transport: http(),
    });
  }

  /**
   * Gets position IDs for user from subgraph
   */
  async getPositionIds(owner: Address): Promise<bigint[]> {
    try {
      const headers = {
        Authorization: `Bearer ${this.config.subgraphKey}`,
      };

      const response = await request<{ positions: SubgraphPosition[] }>(
        this.config.subgraphUrl,
        GET_POSITIONS_QUERY,
        { owner: owner.toLowerCase() },
        headers,
      );

      return response.positions.map((p) => BigInt(p.tokenId));
    } catch (error) {
      console.error("Error fetching position IDs:", error);
      throw new Error(`Failed to fetch position IDs: ${error}`);
    }
  }

  /**
   * Gets detailed position information
   */
  async getPositionDetails(tokenId: bigint): Promise<PositionDetails> {
    try {
      // Get pool key and packed position info
      const [poolKey, infoValue] = (await this.publicClient.readContract({
        address: this.config.positionManagerAddress,
        abi: POSITION_MANAGER_ABI,
        functionName: "getPoolAndPositionInfo",
        args: [tokenId],
      })) as readonly [
        {
          currency0: Address;
          currency1: Address;
          fee: number;
          tickSpacing: number;
          hooks: Address;
        },
        bigint,
      ];

      // Get current liquidity
      const liquidity = (await this.publicClient.readContract({
        address: this.config.positionManagerAddress,
        abi: POSITION_MANAGER_ABI,
        functionName: "getPositionLiquidity",
        args: [tokenId],
      })) as bigint;

      // Decode packed position info
      const positionInfo = decodePositionInfo(infoValue);

      return {
        tokenId,
        tickLower: positionInfo.getTickLower(),
        tickUpper: positionInfo.getTickUpper(),
        liquidity,
        poolKey,
      };
    } catch (error) {
      console.error("Error fetching position details:", error);
      throw new Error(`Failed to fetch position details for token ${tokenId}: ${error}`);
    }
  }

  /**
   * Gets all user positions
   */
  async fetchUserPositions(userAddress: Address): Promise<UniswapV4Position[]> {
    try {
      // Get position IDs from subgraph
      const tokenIds = await this.getPositionIds(userAddress);
      console.log(`Found ${tokenIds.length} positions on ${this.config.chain}`);

      const positions: UniswapV4Position[] = [];

      // Get details for each position
      for (const tokenId of tokenIds) {
        try {
          const details = await this.getPositionDetails(tokenId);

          positions.push({
            tokenId: details.tokenId.toString(),
            owner: userAddress,
            tickLower: details.tickLower,
            tickUpper: details.tickUpper,
            liquidity: details.liquidity.toString(),
            poolKey: {
              currency0: details.poolKey.currency0,
              currency1: details.poolKey.currency1,
              fee: details.poolKey.fee,
              tickSpacing: details.poolKey.tickSpacing,
              hooks: details.poolKey.hooks,
            },
            chain: this.config.chain,
          });
        } catch (error) {
          console.error(`Error fetching details for position ${tokenId}:`, error);
          // Continue processing other positions
        }
      }

      return positions;
    } catch (error) {
      console.error("Error fetching user positions:", error);
      throw new Error(`Failed to fetch user positions: ${error}`);
    }
  }

  /**
   * Gets user positions on all supported networks
   */
  static async fetchUserPositionsAllChains(userAddress: Address): Promise<UniswapV4Position[]> {
    const allPositions: UniswapV4Position[] = [];

    for (const chain of Object.keys(UNISWAP_V4_CONFIGS) as SupportedChain[]) {
      try {
        const service = new UniswapV4Service(chain);
        const positions = await service.fetchUserPositions(userAddress);
        allPositions.push(...positions);
      } catch (error) {
        console.error(`Error fetching positions on ${chain}:`, error);
        // Continue processing other networks
      }
    }

    return allPositions;
  }
}
