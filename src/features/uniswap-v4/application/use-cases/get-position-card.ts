import type { Currency } from "@uniswap/sdk-core";
import { Pool } from "@uniswap/v4-sdk";
import { injectable, inject } from "tsyringe";
import type { Address } from "viem";

import type { SupportedChainId } from "../../configs";
import { calculateUnclaimedFees } from "../../domain/fees";
import { getTokenAmountsFromLiquidity } from "../../domain/liquidity";
import type { PositionRepository, PoolRepository, TokenRepository } from "../../domain/repositories";
import type { PositionCard } from "../../domain/types";
import { createCurrency } from "../../utils/currency";

@injectable()
export class GetPositionCardUseCase {
  constructor(
    @inject("PositionRepository") private positionRepository: PositionRepository,
    @inject("PoolRepository") private poolRepository: PoolRepository,
    @inject("TokenRepository") private tokenRepository: TokenRepository,
  ) {}

  async execute(tokenId: bigint, chainId: SupportedChainId): Promise<PositionCard> {
    if (tokenId <= 0n) {
      throw new Error("Invalid token ID");
    }

    const [details, stored] = await Promise.all([
      this.positionRepository.getPositionDetails(tokenId, chainId),
      this.positionRepository.getStoredPositionInfo(tokenId, chainId),
    ]);

    const [currency0Meta, currency1Meta] = await Promise.all([
      this.tokenRepository.getTokenMetadata(details.poolKey.currency0, chainId),
      this.tokenRepository.getTokenMetadata(details.poolKey.currency1, chainId),
    ]);

    const { poolId, currency0, currency1 } = this.createPoolTokens(
      details.poolKey,
      currency0Meta,
      currency1Meta,
      chainId,
    );
    const [slot0, currentFeeGrowth] = await Promise.all([
      this.poolRepository.getSlot0State(poolId, chainId),
      this.poolRepository.getFeeGrowthInside(poolId, details.tickLower, details.tickUpper, chainId),
    ]);

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
      tokenId,
      poolKey: details.poolKey,
      tickRange: { lower: details.tickLower, upper: details.tickUpper },
      tokens: { currency0, currency1 },
      currentTick: slot0.tickCurrent,
      feeBps: details.poolKey.fee,
      unclaimed,
      tokenAmounts,
    };
  }

  private createPoolTokens(
    poolKey: { currency0: Address; currency1: Address; fee: number; tickSpacing: number; hooks: Address },
    currency0Meta: { name: string; symbol: string; decimals: number },
    currency1Meta: { name: string; symbol: string; decimals: number },
    chainId: number,
  ) {
    const currency0: Currency = createCurrency(poolKey.currency0, chainId, currency0Meta);
    const currency1: Currency = createCurrency(poolKey.currency1, chainId, currency1Meta);

    const poolId = Pool.getPoolId(currency0, currency1, poolKey.fee, poolKey.tickSpacing, poolKey.hooks) as Address;

    return { poolId, currency0, currency1 };
  }
}
