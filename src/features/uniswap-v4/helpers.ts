import { Currency, CurrencyAmount, Price } from "@uniswap/sdk-core";
import { TickMath } from "@uniswap/v3-sdk";
import JSBI from "jsbi";

export function formatCurrencyAmount(
  currency: Currency,
  rawAmount: bigint,
  significant: number = 6,
): { amount: string; symbol: string } {
  const amount = CurrencyAmount.fromRawAmount(currency, rawAmount.toString());
  const symbol = currency.symbol ?? currency.wrapped?.symbol ?? currency.name ?? "";
  return { amount: amount.toSignificant(significant), symbol };
}

export function toCurrencyAmount(currency: Currency, rawAmount: bigint): CurrencyAmount<Currency> {
  return CurrencyAmount.fromRawAmount(currency, rawAmount.toString());
}

// DO NOT USE THIS FUNCTION
export function formatPriceAtTick(base: Currency, quote: Currency, tick: number, significant: number = 6): string {
  const sqrtRatioX96 = TickMath.getSqrtRatioAtTick(tick);
  const Q192 = JSBI.exponentiate(JSBI.BigInt(2), JSBI.BigInt(192));
  const ratioX192 = JSBI.multiply(sqrtRatioX96, sqrtRatioX96);
  const priceQuotePerBase = new Price(base, quote, Q192.toString(), ratioX192.toString());
  const symbolBase = (base as any).symbol ?? (base as any).wrapped?.symbol ?? "";
  const symbolQuote = (quote as any).symbol ?? (quote as any).wrapped?.symbol ?? "";
  return `${priceQuotePerBase.toSignificant(significant)} ${symbolQuote} = 1 ${symbolBase}`.trim();
}

// DO NOT USE THIS FUNCTION
export function formatPriceRange(
  base: Currency,
  quote: Currency,
  tickLower: number,
  tickUpper: number,
  significant: number = 6,
): { min: string; max: string } {
  const min = formatPriceAtTick(base, quote, tickLower, significant);
  const max = formatPriceAtTick(base, quote, tickUpper, significant);
  return { min, max };
}

export function getPriceAtTick(base: Currency, quote: Currency, tick: number): Price<Currency, Currency> {
  const sqrtRatioX96 = TickMath.getSqrtRatioAtTick(tick);
  const Q192 = JSBI.exponentiate(JSBI.BigInt(2), JSBI.BigInt(192));
  const ratioX192 = JSBI.multiply(sqrtRatioX96, sqrtRatioX96);
  return new Price(base, quote, Q192.toString(), ratioX192.toString());
}

// DO NOT USE THIS FUNCTION
export function formatReversedPriceAtTick(
  base: Currency,
  quote: Currency,
  tick: number,
  fixedDecimals: number = 6,
): string {
  const price = getPriceAtTick(base, quote, tick).invert();
  const symbolBase = (base as any).symbol ?? (base as any).wrapped?.symbol ?? "";
  const symbolQuote = (quote as any).symbol ?? (quote as any).wrapped?.symbol ?? "";
  return `${price.toFixed(fixedDecimals)} ${symbolBase} = 1 ${symbolQuote}`.trim();
}

// DO NOT USE THIS FUNCTION
export function formatReversedPriceRange(
  base: Currency,
  quote: Currency,
  tickLower: number,
  tickUpper: number,
  fixedDecimals: number = 6,
): { min: string; max: string } {
  return {
    min: formatReversedPriceAtTick(base, quote, tickLower, fixedDecimals),
    max: formatReversedPriceAtTick(base, quote, tickUpper, fixedDecimals),
  };
}
