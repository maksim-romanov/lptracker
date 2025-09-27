import { BigintIsh, Currency, CurrencyAmount, Fraction } from "@uniswap/sdk-core";
import { parseUnits } from "viem";

export type TokenData = [Currency, BigintIsh, { price?: number } | undefined];

export class PositionPriceCalculator {
  /**
   * Calculates total USD value of position tokens
   */
  calculatePositionValue(tokensData: TokenData[]): number {
    const totalValue = tokensData.reduce((sum, [currency, amount, priceData]) => {
      const priceFraction = this.createPriceFraction(priceData?.price);
      const tokenValue = this.calculateTokenPrice(currency, amount, priceFraction);
      return sum.add(tokenValue);
    }, new Fraction(0));

    return Number(totalValue.toSignificant(6));
  }

  /**
   * Creates a price fraction from decimal price for precise calculations
   */
  private createPriceFraction(decimalPrice?: number, decimalPlaces: number = 6): Fraction {
    if (decimalPrice === undefined || decimalPrice === null || !isFinite(decimalPrice)) {
      return new Fraction(0);
    }

    const numeratorUnits = parseUnits(decimalPrice.toString(), decimalPlaces);
    const denominatorUnits = BigInt(Math.pow(10, decimalPlaces));
    return new Fraction(numeratorUnits.toString(), denominatorUnits.toString());
  }

  /**
   * Calculates USD value of a token amount using price fraction
   */
  private calculateTokenPrice(currency: Currency, rawAmount: BigintIsh, priceFraction: Fraction): Fraction {
    const currencyAmount = CurrencyAmount.fromRawAmount(currency, rawAmount);

    return currencyAmount
      .multiply(priceFraction)
      .asFraction.divide(new Fraction(BigInt(Math.pow(10, currency.decimals)).toString()));
  }
}
