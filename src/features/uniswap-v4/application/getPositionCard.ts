import { type Currency } from "@uniswap/sdk-core";
import { Pool } from "@uniswap/v4-sdk";
import { Address, erc20Abi } from "viem";

import { getChainConfig, type SupportedChainId } from "../configs";
import type { PositionCard } from "../domain/types";
import { POSITION_MANAGER_ABI, STATE_VIEW_ABI } from "../infrastructure/abis";
import { makePublicClient } from "../infrastructure/viem";
import { createCurrency, isNativeAddress } from "../utils/currency";

async function getCurrency(
  chainId: number,
  address: Address,
  client: ReturnType<typeof makePublicClient>,
): Promise<Currency> {
  if (isNativeAddress(address)) {
    return createCurrency(address, chainId, { decimals: 18, symbol: "ETH", name: "Ether" });
  }
  const [decimals, symbol] = await Promise.all([
    client.readContract({ address, abi: erc20Abi, functionName: "decimals" }) as Promise<number>,
    client.readContract({ address, abi: erc20Abi, functionName: "symbol" }) as Promise<string>,
  ]);
  return createCurrency(address, chainId, { decimals, symbol });
}

export async function getPositionCard(tokenId: bigint, chainId: SupportedChainId): Promise<PositionCard> {
  const config = getChainConfig(chainId);
  const client = makePublicClient(chainId);

  const [poolKey, infoValue] = (await client.readContract({
    address: config.positionManagerAddress,
    abi: POSITION_MANAGER_ABI,
    functionName: "getPoolAndPositionInfo",
    args: [tokenId],
  })) as readonly [
    { currency0: Address; currency1: Address; fee: number; tickSpacing: number; hooks: Address },
    bigint,
  ];

  const decode = (value: bigint) => {
    const getTickUpper = () => {
      const raw = Number((value >> 32n) & 0xffffffn);
      return raw >= 0x800000 ? raw - 0x1000000 : raw;
    };
    const getTickLower = () => {
      const raw = Number((value >> 8n) & 0xffffffn);
      return raw >= 0x800000 ? raw - 0x1000000 : raw;
    };
    return { getTickLower, getTickUpper };
  };
  const info = decode(infoValue);
  const tickLower = info.getTickLower();
  const tickUpper = info.getTickUpper();

  const currency0 = await getCurrency(config.chainId, poolKey.currency0, client);
  const currency1 = await getCurrency(config.chainId, poolKey.currency1, client);

  const poolId = Pool.getPoolId(currency0, currency1, poolKey.fee, poolKey.tickSpacing, poolKey.hooks) as `0x${string}`;

  const [sqrtPriceX96, tickCurrent] = (await client.readContract({
    address: config.stateViewAddress,
    abi: STATE_VIEW_ABI,
    functionName: "getSlot0",
    args: [poolId],
  })) as unknown as readonly [bigint, number];

  const isInRange = tickLower <= tickCurrent && tickCurrent < tickUpper;

  return {
    tokenId,
    poolKey,
    tickRange: { lower: tickLower, upper: tickUpper },
    tokens: { currency0, currency1 },
    isInRange,
    currentTick: tickCurrent,
    feeBps: poolKey.fee,
  };
}
