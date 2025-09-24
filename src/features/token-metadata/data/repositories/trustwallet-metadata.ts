import { inject, injectable } from "tsyringe";
import type { Address } from "viem";
import { getAddress } from "viem";

import { ApiClient } from "../../../../infrastructure/api/api-client";
import type { Logger, LoggerFactory } from "../../../../infrastructure/logging";
import { METADATA_PROVIDER_CONFIGS, SUPPORTED_CHAIN_IDS } from "../../configs";
import type { MetadataProviderRepository } from "../../domain/repositories";
import type { TokenMetadata } from "../../domain/types";

interface TrustWalletTokenInfo {
  name: string;
  symbol: string;
  type: string;
  decimals: number;
  description?: string;
  website?: string;
  explorer?: string;
  status: string;
  id: string;
}

@injectable()
export class TrustWalletMetadataRepository implements MetadataProviderRepository {
  private readonly config = METADATA_PROVIDER_CONFIGS.trustwallet;
  private readonly apiClient: ApiClient;
  private readonly logger: Logger;

  constructor(@inject("LoggerFactory") loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger("TrustWalletMetadataRepository");
    this.apiClient = new ApiClient({
      baseURL: this.config.baseUrl,
      headers: {
        Accept: "application/json",
      },
      timeout: 10000,
    });
  }

  async getTokenMetadata(tokenAddress: Address, chainId: number): Promise<TokenMetadata> {
    const startTime = Date.now();
    this.logger.debug(`Fetching metadata for ${tokenAddress} on chain ${chainId}`);

    if (!this.isChainSupported(chainId)) {
      this.logger.error(`Chain ${chainId} not supported`);
      throw new Error(`Chain ID ${chainId} not supported by Trust Wallet`);
    }

    // Handle native tokens (zero address) - we have full metadata for these
    if (tokenAddress.toLowerCase() === "0x0000000000000000000000000000000000000000") {
      return this.getNativeTokenMetadata(chainId, startTime);
    }

    const chainName = this.getChainName(chainId);
    const checksumAddress = getAddress(tokenAddress); // Trust Wallet uses EIP-55 checksummed addresses

    // For regular tokens, Trust Wallet approach:
    // 1. Try to get info.json with full metadata
    // 2. If not found, provide logo URL anyway for popular tokens
    const logoUrl = `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/${chainName}/assets/${checksumAddress}/logo.png`;

    try {
      // Try to get full metadata from info.json
      const endpoint = `/blockchains/${chainName}/assets/${checksumAddress}/info.json`;
      this.logger.debug(`Fetching token info: ${endpoint}`);

      let data = await this.apiClient.get<TrustWalletTokenInfo>(endpoint);

      // Fix: Trust Wallet API sometimes returns JSON as string
      if (typeof data === "string") {
        this.logger.debug(`Parsing JSON string response`);
        data = JSON.parse(data) as TrustWalletTokenInfo;
      }

      // Check if we have essential data
      if (!data.name || !data.symbol) {
        this.logger.warn(`Incomplete token data for ${tokenAddress} - name: ${data.name}, symbol: ${data.symbol}`);
        throw new Error(`Incomplete token metadata for ${tokenAddress} on chain ${chainId}`);
      }

      // Skip tokens marked as spam/inactive
      if (data.status === "spam" || data.status === "abandoned") {
        this.logger.warn(`Token ${tokenAddress} marked as ${data.status}`);
        throw new Error(`Token marked as ${data.status}: ${tokenAddress}`);
      }

      const requestTime = Date.now() - startTime;
      const metadata = {
        address: tokenAddress,
        chainId,
        name: data.name,
        symbol: data.symbol.toUpperCase(),
        decimals: data.decimals || 18, // Default to 18 if not specified
        logoUrl,
        description: data.description,
        website: data.website,
        timestamp: new Date(),
        source: this.config.name,
      };

      this.logger.info(`SUCCESS (full metadata): ${metadata.symbol} (${metadata.name}) (${requestTime}ms)`);
      return metadata;
    } catch (error: any) {
      const requestTime = Date.now() - startTime;

      if (error.status === 404) {
        this.logger.warn(`Token info not found: ${tokenAddress} (${requestTime}ms)`);
        throw new Error(`Token not found: ${tokenAddress} on chain ${chainId}`);
      }

      this.logger.error(`API error (status ${error.status}) for ${tokenAddress} (${requestTime}ms): ${error.message}`);
      throw error;
    }
  }

  async isAvailable(): Promise<boolean> {
    return true; // Trust Wallet GitHub assets are always available
  }

  getProviderName(): string {
    return this.config.name;
  }

  private isChainSupported(chainId: number): boolean {
    return SUPPORTED_CHAIN_IDS.includes(chainId as any);
  }

  private getChainName(chainId: number): string {
    const mapping: Record<number, string> = {
      1: "ethereum",
      42161: "arbitrum",
      137: "polygon",
      10: "optimism",
      8453: "base",
      56: "smartchain", // BSC
      43114: "avalanchec", // Avalanche C-Chain
      250: "fantom",
      25: "cronos",
      100: "xdai", // Gnosis
    };

    const chainName = mapping[chainId];
    if (!chainName) {
      throw new Error(`Unsupported chain ID: ${chainId}`);
    }
    return chainName;
  }

  private getNativeTokenMetadata(chainId: number, startTime: number): TokenMetadata {
    const requestTime = Date.now() - startTime;
    const chainName = this.getChainName(chainId);

    const nativeTokens: Record<number, Omit<TokenMetadata, "address" | "chainId" | "timestamp" | "source">> = {
      1: {
        name: "Ethereum",
        symbol: "ETH",
        decimals: 18,
        logoUrl: `${this.config.baseUrl}/blockchains/ethereum/info/logo.png`,
        description: "Ethereum native token",
        website: "https://ethereum.org",
      },
      42161: {
        name: "Ethereum",
        symbol: "ETH",
        decimals: 18,
        logoUrl: `${this.config.baseUrl}/blockchains/ethereum/info/logo.png`,
        description: "Ethereum native token on Arbitrum",
        website: "https://ethereum.org",
      },
      137: {
        name: "Polygon",
        symbol: "MATIC",
        decimals: 18,
        logoUrl: `${this.config.baseUrl}/blockchains/polygon/info/logo.png`,
        description: "Polygon native token",
        website: "https://polygon.technology",
      },
      10: {
        name: "Ethereum",
        symbol: "ETH",
        decimals: 18,
        logoUrl: `${this.config.baseUrl}/blockchains/ethereum/info/logo.png`,
        description: "Ethereum native token on Optimism",
        website: "https://ethereum.org",
      },
      8453: {
        name: "Ethereum",
        symbol: "ETH",
        decimals: 18,
        logoUrl: `${this.config.baseUrl}/blockchains/ethereum/info/logo.png`,
        description: "Ethereum native token on Base",
        website: "https://ethereum.org",
      },
      56: {
        name: "BNB",
        symbol: "BNB",
        decimals: 18,
        logoUrl: `${this.config.baseUrl}/blockchains/smartchain/info/logo.png`,
        description: "BNB Smart Chain native token",
        website: "https://www.bnbchain.org",
      },
    };

    const nativeToken = nativeTokens[chainId];
    if (!nativeToken) {
      throw new Error(`Native token not supported for chain ${chainId}`);
    }

    const metadata = {
      address: "0x0000000000000000000000000000000000000000" as Address,
      chainId,
      ...nativeToken,
      timestamp: new Date(),
      source: this.config.name,
    };

    this.logger.info(`SUCCESS (native): ${metadata.symbol} (${metadata.name}) logoUrl=available (${requestTime}ms)`);
    return metadata;
  }
}
