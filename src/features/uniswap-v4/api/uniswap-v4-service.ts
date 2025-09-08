import { request } from "graphql-request";
import Keys from "react-native-keys";
import type { PublicClient } from "viem";
import { Address, Chain, createPublicClient, http } from "viem";
import { arbitrum, mainnet } from "viem/chains";

import { GetPositionsDocument } from "./__generated__/graphql";
import { UNISWAP_V4_CONFIGS, UniswapV4Config, SupportedChain } from "./configs";
import { POSITION_MANAGER_ABI } from "./constants";

// constants imported from ./constants

export class UniswapV4Service {
  private config: UniswapV4Config;
  private publicClient: PublicClient;

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
        Authorization: `Bearer ${Keys.secureFor("SUBGRAPH_TOKEN")}`,
      };

      const response = await request(
        this.config.subgraphUrl,
        GetPositionsDocument,
        {
          owner: owner.toLowerCase(),
        },
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
  async getPositionDetails(tokenId: bigint) {
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

      return {
        tokenId,
        info: infoValue,
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
  async fetchUserPositions(userAddress: Address) {
    try {
      // Get position IDs from subgraph
      const tokenIds = await this.getPositionIds(userAddress);
      console.log(`Found ${tokenIds.length} positions on ${this.config.chain}`);

      const results = await Promise.allSettled(
        tokenIds.map(async (tokenId) => {
          const details = await this.getPositionDetails(tokenId);
          const position = {
            ...details,
            owner: userAddress,
            chain: this.config.chain,
          };
          return position;
        }),
      );

      return results.flatMap((r) => (r.status === "fulfilled" ? [r.value] : []));
    } catch (error) {
      console.error("Error fetching user positions:", error);
      throw new Error(`Failed to fetch user positions: ${error}`);
    }
  }
}
