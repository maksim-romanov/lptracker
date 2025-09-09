import { Address, createPublicClient, http } from "viem";
import { arbitrum } from "viem/chains";

const publicClient = createPublicClient({
  chain: arbitrum,
  transport: http(),
});

// Token information interface
export interface TokenInfo {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
}

// ERC20 ABI for token info
const ERC20_ABI = [
  {
    name: "symbol",
    type: "function",
    inputs: [],
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
  },
  {
    name: "name",
    type: "function",
    inputs: [],
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
  },
  {
    name: "decimals",
    type: "function",
    inputs: [],
    outputs: [{ name: "", type: "uint8" }],
    stateMutability: "view",
  },
] as const;

/**
 * Get token information from contract
 * @param tokenAddress - Token contract address
 * @returns Token information (symbol, name, decimals)
 */
export async function getTokenInfo(tokenAddress: string): Promise<TokenInfo> {
  // Handle native ETH first
  if (tokenAddress === "0x0000000000000000000000000000000000000000") {
    return {
      address: tokenAddress,
      symbol: "ETH",
      name: "Ethereum",
      decimals: 18,
    };
  }

  try {
    const [symbol, name, decimals] = await Promise.all([
      publicClient.readContract({
        address: tokenAddress as Address,
        abi: ERC20_ABI,
        functionName: "symbol",
      }),
      publicClient.readContract({
        address: tokenAddress as Address,
        abi: ERC20_ABI,
        functionName: "name",
      }),
      publicClient.readContract({
        address: tokenAddress as Address,
        abi: ERC20_ABI,
        functionName: "decimals",
      }),
    ]);

    return {
      address: tokenAddress,
      symbol: symbol as string,
      name: name as string,
      decimals: decimals as number,
    };
  } catch (error) {
    console.error(`Error fetching token info for ${tokenAddress}:`, error);
    // Return unknown token info
    return {
      address: tokenAddress,
      symbol: "UNKNOWN",
      name: "Unknown Token",
      decimals: 18,
    };
  }
}

/**
 * Get multiple token information in parallel
 * @param tokenAddresses - Array of token addresses
 * @returns Array of token information
 */
export async function getMultipleTokenInfo(tokenAddresses: string[]): Promise<TokenInfo[]> {
  return Promise.all(tokenAddresses.map(getTokenInfo));
}
