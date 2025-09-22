export function calculateUnclaimedFees(
  liquidity: bigint,
  feeGrowthInsideCurrent: bigint,
  feeGrowthInsideLast: bigint,
): bigint {
  const Q128 = 2n ** 128n;
  const delta = feeGrowthInsideCurrent >= feeGrowthInsideLast ? feeGrowthInsideCurrent - feeGrowthInsideLast : 0n;
  return (delta * liquidity) / Q128;
}
