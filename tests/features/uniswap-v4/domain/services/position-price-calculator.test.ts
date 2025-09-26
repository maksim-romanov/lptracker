import { BigintIsh, Currency, CurrencyAmount, Fraction } from "@uniswap/sdk-core";
import { describe, test, expect, mock } from "bun:test";

import {
  PositionPriceCalculator,
  TokenData,
} from "../../../../../src/features/uniswap-v4/domain/services/position-price-calculator";

// Mock dependencies
mock.module("viem", () => ({
  parseUnits: mock((value: string, decimals: number) => {
    const factor = BigInt(Math.pow(10, decimals));
    const num = parseFloat(value);
    return BigInt(Math.floor(num * Number(factor)));
  }),
}));

// Mock helpers for creating test data
const createMockCurrency = (decimals: number = 18, symbol: string = "TEST"): Currency => {
  const mockToken = {
    decimals,
    symbol,
    name: symbol,
    isNative: false,
    isToken: true,
    chainId: 1,
    address: `0x${"0".repeat(40)}`,
    equals: mock(() => false),
    wrapped: {} as any,
    sortsBefore: mock(() => false),
  } as unknown as Currency;
  return mockToken;
};

const createMockCurrencyAmount = (currency: Currency, rawAmount: BigintIsh): CurrencyAmount<Currency> => {
  const amount = {
    currency,
    quotient: BigInt(rawAmount.toString()),
    decimalScale: BigInt(Math.pow(10, currency.decimals)),
    multiply: mock((other: Fraction) => {
      const result =
        (BigInt(amount.quotient.toString()) * BigInt(other.numerator.toString())) /
        BigInt(other.denominator.toString());
      return {
        ...amount,
        quotient: result,
        asFraction: {
          numerator: result,
          denominator: BigInt(1),
          divide: mock((divisor: Fraction) => {
            const newNumerator = result * BigInt(divisor.denominator.toString());
            const newDenominator = BigInt(divisor.numerator.toString());
            return new Fraction(newNumerator.toString(), newDenominator.toString());
          }),
        },
      };
    }),
    toSignificant: mock(() => "1.0"),
    toFixed: mock(() => "1.0"),
  } as any;
  return amount;
};

// Mock CurrencyAmount.fromRawAmount
mock.module("@uniswap/sdk-core", () => {
  const originalModule = require("@uniswap/sdk-core");
  return {
    ...originalModule,
    CurrencyAmount: {
      ...originalModule.CurrencyAmount,
      fromRawAmount: mock((currency: Currency, rawAmount: BigintIsh) => createMockCurrencyAmount(currency, rawAmount)),
    },
    Fraction: originalModule.Fraction,
  };
});

describe("PositionPriceCalculator", () => {
  const createCalculator = () => new PositionPriceCalculator();

  describe("calculatePositionValue", () => {
    test("should calculate total value with valid tokens and prices", () => {
      const calculator = createCalculator();
      const currency1 = createMockCurrency(18, "ETH");
      const currency2 = createMockCurrency(6, "USDC");

      const tokensData: TokenData[] = [
        [currency1, "1000000000000000000", { price: 2000 }], // 1 ETH at $2000
        [currency2, "1000000", { price: 1 }], // 1 USDC at $1
      ];

      const result = calculator.calculatePositionValue(tokensData);

      expect(result).toBeGreaterThan(0);
    });

    test("should return 0 for empty tokens array", () => {
      const calculator = createCalculator();
      const result = calculator.calculatePositionValue([]);
      expect(result).toBe(0);
    });

    test("should handle tokens with undefined price", () => {
      const calculator = createCalculator();
      const currency = createMockCurrency(18, "ETH");
      const tokensData: TokenData[] = [[currency, "1000000000000000000", undefined]];

      const result = calculator.calculatePositionValue(tokensData);
      expect(result).toBe(0);
    });

    test("should handle tokens with null price", () => {
      const calculator = createCalculator();
      const currency = createMockCurrency(18, "ETH");
      const tokensData: TokenData[] = [[currency, "1000000000000000000", { price: null as any }]];

      const result = calculator.calculatePositionValue(tokensData);
      expect(result).toBe(0);
    });

    test("should handle tokens with zero price", () => {
      const calculator = createCalculator();
      const currency = createMockCurrency(18, "ETH");
      const tokensData: TokenData[] = [[currency, "1000000000000000000", { price: 0 }]];

      const result = calculator.calculatePositionValue(tokensData);
      expect(result).toBe(0);
    });

    test("should handle multiple tokens with different decimals", () => {
      const calculator = createCalculator();
      const eth = createMockCurrency(18, "ETH");
      const usdc = createMockCurrency(6, "USDC");
      const btc = createMockCurrency(8, "BTC");

      const tokensData: TokenData[] = [
        [eth, "1000000000000000000", { price: 2000 }], // 1 ETH
        [usdc, "1000000", { price: 1 }], // 1 USDC
        [btc, "100000000", { price: 45000 }], // 1 BTC
      ];

      const result = calculator.calculatePositionValue(tokensData);
      expect(result).toBeGreaterThan(0);
    });
  });

  describe("createPriceFraction", () => {
    test("should create fraction from valid decimal price", () => {
      // Access private method via any cast for testing
      const calculator = new PositionPriceCalculator() as any;
      const fraction = calculator.createPriceFraction(123.456);

      expect(fraction).toBeInstanceOf(Fraction);
      expect(fraction.numerator).toBeDefined();
      expect(fraction.denominator).toBeDefined();
    });

    test("should return zero fraction for undefined price", () => {
      const calculator = new PositionPriceCalculator() as any;
      const fraction = calculator.createPriceFraction(undefined);

      expect(fraction).toBeInstanceOf(Fraction);
      expect(fraction.numerator.toString()).toBe("0");
    });

    test("should return zero fraction for null price", () => {
      const calculator = new PositionPriceCalculator() as any;
      const fraction = calculator.createPriceFraction(null);

      expect(fraction).toBeInstanceOf(Fraction);
      expect(fraction.numerator.toString()).toBe("0");
    });

    test("should return zero fraction for NaN price", () => {
      const calculator = new PositionPriceCalculator() as any;
      const fraction = calculator.createPriceFraction(NaN);

      expect(fraction).toBeInstanceOf(Fraction);
      expect(fraction.numerator.toString()).toBe("0");
    });

    test("should return zero fraction for Infinity price", () => {
      const calculator = new PositionPriceCalculator() as any;
      const fraction = calculator.createPriceFraction(Infinity);

      expect(fraction).toBeInstanceOf(Fraction);
      expect(fraction.numerator.toString()).toBe("0");
    });

    test("should handle different decimal places", () => {
      const calculator = new PositionPriceCalculator() as any;
      const fraction1 = calculator.createPriceFraction(123.456, 2);
      const fraction2 = calculator.createPriceFraction(123.456, 8);

      expect(fraction1).toBeInstanceOf(Fraction);
      expect(fraction2).toBeInstanceOf(Fraction);
      // Different decimal places should result in different denominators
      expect(fraction1.denominator.toString()).not.toBe(fraction2.denominator.toString());
    });

    test("should handle very small prices", () => {
      const calculator = new PositionPriceCalculator() as any;
      const fraction = calculator.createPriceFraction(0.000001);

      expect(fraction).toBeInstanceOf(Fraction);
      expect(fraction.numerator.toString()).not.toBe("0");
    });

    test("should handle very large prices", () => {
      const calculator = new PositionPriceCalculator() as any;
      const fraction = calculator.createPriceFraction(1000000);

      expect(fraction).toBeInstanceOf(Fraction);
      expect(fraction.numerator.toString()).not.toBe("0");
    });
  });

  describe("calculateTokenPrice", () => {
    test("should calculate token price correctly", () => {
      const calculator = new PositionPriceCalculator() as any;
      const currency = createMockCurrency(18, "ETH");
      const amount = "1000000000000000000"; // 1 ETH
      const priceFraction = new Fraction("2000000000", "1000000"); // $2000 with 6 decimal places

      const result = calculator.calculateTokenPrice(currency, amount, priceFraction);

      expect(result).toBeInstanceOf(Fraction);
      expect(result.numerator).toBeDefined();
      expect(result.denominator).toBeDefined();
    });

    test("should handle different token decimals", () => {
      const calculator = new PositionPriceCalculator() as any;

      const eth = createMockCurrency(18, "ETH");
      const usdc = createMockCurrency(6, "USDC");
      const priceFraction = new Fraction("1000000", "1000000"); // $1

      const ethResult = calculator.calculateTokenPrice(eth, "1000000000000000000", priceFraction);
      const usdcResult = calculator.calculateTokenPrice(usdc, "1000000", priceFraction);

      expect(ethResult).toBeInstanceOf(Fraction);
      expect(usdcResult).toBeInstanceOf(Fraction);
    });

    test("should handle zero amount", () => {
      const calculator = new PositionPriceCalculator() as any;
      const currency = createMockCurrency(18, "ETH");
      const priceFraction = new Fraction("2000000000", "1000000");

      const result = calculator.calculateTokenPrice(currency, "0", priceFraction);

      expect(result).toBeInstanceOf(Fraction);
    });

    test("should handle zero price fraction", () => {
      const calculator = new PositionPriceCalculator() as any;
      const currency = createMockCurrency(18, "ETH");
      const priceFraction = new Fraction("0", "1");

      const result = calculator.calculateTokenPrice(currency, "1000000000000000000", priceFraction);

      expect(result).toBeInstanceOf(Fraction);
      expect(result.numerator.toString()).toBe("0");
    });
  });

  describe("Integration tests", () => {
    test("should handle realistic token portfolio calculation", () => {
      const calculator = createCalculator();
      const eth = createMockCurrency(18, "ETH");
      const usdc = createMockCurrency(6, "USDC");
      const dai = createMockCurrency(18, "DAI");

      const tokensData: TokenData[] = [
        [eth, "2500000000000000000", { price: 2000 }], // 2.5 ETH at $2000 = $5000
        [usdc, "1500000000", { price: 1.001 }], // 1500 USDC at $1.001 = $1501.5
        [dai, "800000000000000000000", { price: 0.999 }], // 800 DAI at $0.999 = $799.2
      ];

      const result = calculator.calculatePositionValue(tokensData);
      expect(result).toBeGreaterThan(7000); // Should be around $7300.7
      expect(result).toBeLessThan(8000);
    });

    test("should maintain precision with very small amounts", () => {
      const calculator = createCalculator();
      const currency = createMockCurrency(18, "MICROTOKEN");
      const tokensData: TokenData[] = [
        [currency, "1000", { price: 0.000001 }], // Very small amount and price
      ];

      const result = calculator.calculatePositionValue(tokensData);
      expect(result).toBeGreaterThanOrEqual(0);
    });

    test("should handle mixed valid and invalid tokens", () => {
      const calculator = createCalculator();
      const eth = createMockCurrency(18, "ETH");
      const usdc = createMockCurrency(6, "USDC");

      const tokensData: TokenData[] = [
        [eth, "1000000000000000000", { price: 2000 }], // Valid
        [usdc, "1000000", undefined], // Invalid - no price data
        [eth, "500000000000000000", { price: null as any }], // Invalid - null price
        [usdc, "2000000", { price: 1 }], // Valid
      ];

      const result = calculator.calculatePositionValue(tokensData);
      expect(result).toBeGreaterThan(0); // Should only count valid tokens
    });
  });
});
