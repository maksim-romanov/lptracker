import "reflect-metadata";
import { container } from "tsyringe";
import type { Address } from "viem";

import { GetChainlinkPriceUseCase } from "./application/use-cases/get-chainlink-price";
import { configureChainlinkDI } from "./config/di-container";

// Initialize DI container
configureChainlinkDI();

async function testChainlinkPrice() {
  console.log("🔗 Testing Chainlink Price Feeds...\n");

  const useCase = container.resolve(GetChainlinkPriceUseCase);

  // Test availability first
  try {
    console.log("⏳ Checking Chainlink availability...");
    const isAvailable = await useCase.isChainlinkAvailable();
    console.log(`✅ Chainlink available: ${isAvailable}\n`);

    if (!isAvailable) {
      console.log("❌ Chainlink is not available, exiting...");
      return;
    }
  } catch (error) {
    console.error("❌ Error checking availability:", error);
    return;
  }

  // Test cases - using Arbitrum token addresses that work in uniswap example
  const testCases = [
    {
      name: "WETH on Arbitrum",
      tokenAddress: "0x82af49447d8a07e3bd95bd0d56f35241523fbab1" as Address, // ARB_WETH
      chainId: 42161,
    },
    {
      name: "USDC on Arbitrum",
      tokenAddress: "0xaf88d065e77c8cc2239327c5edb3a432268e5831" as Address, // ARB_USDC
      chainId: 42161,
    },
    {
      name: "GMX on Arbitrum",
      tokenAddress: "0x62edc0692BD897D2295872a9FFCac5425011c661" as Address, // ARB_GMX
      chainId: 42161,
    },
    {
      name: "Unsupported token test (should fail)",
      tokenAddress: "0x1234567890123456789012345678901234567890" as Address, // Random address - should fail
      chainId: 42161,
    },
  ];

  for (const testCase of testCases) {
    console.log(`📊 Testing ${testCase.name}...`);
    console.log(`   Token: ${testCase.tokenAddress}`);
    console.log(`   Chain: ${testCase.chainId}`);

    try {
      const price = await useCase.execute({ tokenAddress: testCase.tokenAddress, chainId: testCase.chainId });

      console.log("✅ Price fetched successfully!");
      console.log(`   Feed: ${price.feedName}`);
      console.log(`   Price: $${price.price.toFixed(8)}`); // Show more decimals to see exact price
      console.log(`   Decimals: ${price.decimals}`);
      console.log(`   Updated: ${price.updatedAt.toISOString()}`);
      console.log(`   Feed Address: ${price.feedAddress}`);
      console.log(`   Source: ${price.source}\n`);
    } catch (error) {
      console.error(`❌ Error fetching price for ${testCase.name}:`);
      if (error instanceof Error) {
        console.error(`   ${error.message}\n`);
        // More detailed error for debugging
        console.error(`   Stack: ${error.stack}\n`);
      } else {
        console.error(`   Unknown error\n`);
      }
    }
  }

  // Test with unsupported chain
  console.log("🧪 Testing unsupported chain...");
  try {
    await useCase.execute({ tokenAddress: "0x1234567890123456789012345678901234567890" as Address, chainId: 1 }); // Ethereum not supported anymore
    console.log("❌ Should have thrown error for unsupported chain");
  } catch (error) {
    console.log("✅ Correctly threw error for unsupported chain:", error instanceof Error ? error.message : error);
  }

  console.log("\n🏁 Test completed!");
}

// Run the test
testChainlinkPrice().catch(console.error);
