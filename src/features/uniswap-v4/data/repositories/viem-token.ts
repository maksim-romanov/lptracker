import { injectable } from "tsyringe";
import type { Address } from "viem";
import { erc20Abi } from "viem";

import type { SupportedChainId } from "../../configs";
import { isNativeAddress } from "../../constants/addresses";
import type { TokenRepository } from "../../domain/repositories";
import { makePublicClient } from "../viem";

@injectable()
export class ViemTokenRepository implements TokenRepository {
  async getTokenMetadata(
    tokenAddress: Address,
    chainId: SupportedChainId,
  ): Promise<{ name: string; symbol: string; decimals: number }> {
    if (isNativeAddress(tokenAddress)) {
      return {
        name: "Ether",
        symbol: "ETH",
        decimals: 18,
      };
    }

    const client = makePublicClient(chainId);

    const [name, symbol, decimals] = await Promise.all([
      client.readContract({ address: tokenAddress, abi: erc20Abi, functionName: "name" }) as Promise<string>,
      client.readContract({ address: tokenAddress, abi: erc20Abi, functionName: "symbol" }) as Promise<string>,
      client.readContract({ address: tokenAddress, abi: erc20Abi, functionName: "decimals" }) as Promise<number>,
    ]);

    return { name, symbol, decimals };
  }
}
