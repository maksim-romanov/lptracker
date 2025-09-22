import { type Currency } from "@uniswap/sdk-core";
import { Pool } from "@uniswap/v4-sdk";
import { Address, erc20Abi } from "viem";

import { getChainConfig, type SupportedChainId } from "../configs";
import { calculateUnclaimedFees } from "../domain/fees";
import { getTokenAmountsFromLiquidity } from "../domain/liquidity";
import type { PositionDetails, PositionSummary, FeeGrowthSnapshot, Slot0State } from "../domain/types";
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

async function getPositionDetails(
  tokenId: bigint,
  config: ReturnType<typeof getChainConfig>,
  client: ReturnType<typeof makePublicClient>,
): Promise<PositionDetails> {
  const [poolKey, infoValue] = (await client.readContract({
    address: config.positionManagerAddress,
    abi: POSITION_MANAGER_ABI,
    functionName: "getPoolAndPositionInfo",
    args: [tokenId],
  })) as readonly [
    { currency0: Address; currency1: Address; fee: number; tickSpacing: number; hooks: Address },
    bigint,
  ];

  const liquidity = (await client.readContract({
    address: config.positionManagerAddress,
    abi: POSITION_MANAGER_ABI,
    functionName: "getPositionLiquidity",
    args: [tokenId],
  })) as bigint;

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

  return {
    tokenId,
    tickLower: info.getTickLower(),
    tickUpper: info.getTickUpper(),
    liquidity,
    poolKey,
  };
}

async function getPoolIdAndTokens(
  details: PositionDetails,
  config: ReturnType<typeof getChainConfig>,
  client: ReturnType<typeof makePublicClient>,
) {
  const currency0 = await getCurrency(config.chainId, details.poolKey.currency0, client);
  const currency1 = await getCurrency(config.chainId, details.poolKey.currency1, client);
  const poolId = Pool.getPoolId(
    currency0,
    currency1,
    details.poolKey.fee,
    details.poolKey.tickSpacing,
    details.poolKey.hooks,
  ) as `0x${string}`;
  return { poolId, currency0, currency1 };
}

async function getStored(
  poolId: `0x${string}`,
  details: PositionDetails,
  owner: Address,
  config: ReturnType<typeof getChainConfig>,
  client: ReturnType<typeof makePublicClient>,
): Promise<{ liquidity: bigint } & FeeGrowthSnapshot> {
  const salt = `0x${details.tokenId.toString(16).padStart(64, "0")}` as `0x${string}`;
  const [liquidity, feeGrowthInside0X128, feeGrowthInside1X128] = (await client.readContract({
    address: config.stateViewAddress,
    abi: STATE_VIEW_ABI,
    functionName: "getPositionInfo",
    args: [poolId, owner, details.tickLower, details.tickUpper, salt],
  })) as readonly [bigint, bigint, bigint];
  return { liquidity, feeGrowthInside0X128, feeGrowthInside1X128 };
}

async function getCurrentFeeGrowth(
  poolId: `0x${string}`,
  details: PositionDetails,
  config: ReturnType<typeof getChainConfig>,
  client: ReturnType<typeof makePublicClient>,
): Promise<FeeGrowthSnapshot> {
  const [feeGrowthInside0X128, feeGrowthInside1X128] = (await client.readContract({
    address: config.stateViewAddress,
    abi: STATE_VIEW_ABI,
    functionName: "getFeeGrowthInside",
    args: [poolId, details.tickLower, details.tickUpper],
  })) as readonly [bigint, bigint];
  return { feeGrowthInside0X128, feeGrowthInside1X128 };
}

async function getSlot0(
  poolId: `0x${string}`,
  config: ReturnType<typeof getChainConfig>,
  client: ReturnType<typeof makePublicClient>,
): Promise<Slot0State> {
  const [sqrtPriceX96, tick] = (await client.readContract({
    address: config.stateViewAddress,
    abi: STATE_VIEW_ABI,
    functionName: "getSlot0",
    args: [poolId],
  })) as unknown as readonly [bigint, number];
  return { sqrtPriceX96, tickCurrent: tick };
}

export async function getPositionSummary(tokenId: bigint, chainId: SupportedChainId): Promise<PositionSummary> {
  const config = getChainConfig(chainId);
  const client = makePublicClient(chainId);
  const details = await getPositionDetails(tokenId, config, client);
  const { poolId, currency0, currency1 } = await getPoolIdAndTokens(details, config, client);
  const stored = await getStored(poolId, details, config.positionManagerAddress, config, client);
  const currentFeeGrowth = await getCurrentFeeGrowth(poolId, details, config, client);
  const slot0 = await getSlot0(poolId, config, client);

  const unclaimed = {
    token0: calculateUnclaimedFees(
      stored.liquidity,
      currentFeeGrowth.feeGrowthInside0X128,
      stored.feeGrowthInside0X128,
    ),
    token1: calculateUnclaimedFees(
      stored.liquidity,
      currentFeeGrowth.feeGrowthInside1X128,
      stored.feeGrowthInside1X128,
    ),
  };

  const tokenAmounts = getTokenAmountsFromLiquidity(
    stored.liquidity,
    details.tickLower,
    details.tickUpper,
    slot0.sqrtPriceX96,
  );

  return {
    poolId,
    details,
    slot0,
    stored,
    currentFeeGrowth,
    unclaimed,
    tokenAmounts,
    tokens: { currency0, currency1 },
  };
}
