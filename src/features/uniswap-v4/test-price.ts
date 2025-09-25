import { makePublicClient } from "./data/viem";

// Minimal ABI for Chainlink AggregatorV3Interface
const aggregatorV3Abi = [
  {
    inputs: [],
    name: "decimals",
    outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "latestRoundData",
    outputs: [
      { internalType: "uint80", name: "roundId", type: "uint80" },
      { internalType: "int256", name: "answer", type: "int256" },
      { internalType: "uint256", name: "startedAt", type: "uint256" },
      { internalType: "uint256", name: "updatedAt", type: "uint256" },
      { internalType: "uint80", name: "answeredInRound", type: "uint80" },
    ],
    stateMutability: "view",
    type: "function",
  },
];

// Chainlink feeds on Arbitrum One
const CHAINLINK_BTC_USD_ARBITRUM = "0x6ce185860a4963106506C203335A2910413708e9" as const; // BTC/USD
const CHAINLINK_ETH_USD_ARBITRUM = "0x639Fe6ab55C921f74e7fac1ee960C0B6293ba612" as const; // ETH/USD (WETH proxy)
const CHAINLINK_USDC_USD_ARBITRUM = "0x50834F3163758fcC1Df9973b6e91f0F0F0434aD3" as const; // USDC/USD
const CHAINLINK_GMX_USD_ARBITRUM = "0xDB98056FecFff59D032aB628337A4887110df3dB" as const; // GMX/USD

async function readPrice(client: ReturnType<typeof makePublicClient>, feed: `0x${string}`) {
  const [decimals, latest] = await Promise.all([
    client.readContract({ address: feed, abi: aggregatorV3Abi, functionName: "decimals", args: [] }) as Promise<number>,
    client.readContract({ address: feed, abi: aggregatorV3Abi, functionName: "latestRoundData", args: [] }) as Promise<
      readonly [bigint, bigint, bigint, bigint, bigint]
    >,
  ]);
  const answer = latest[1];
  return Number(answer) / 10 ** Number(decimals);
}

// Chainlink Feed Registry (on-chain) example to avoid hardcoding feed addresses
// Registry address (Arbitrum One)
const FEED_REGISTRY_ARBITRUM = "0x47Fb2585D2C56Fe188D0E6ec628a38b74fCeeeDf" as const;
// USD quote sentinel used by Feed Registry
const FEED_REGISTRY_USD = "0x0000000000000000000000000000000000000348" as const;
// ETH sentinel used by Feed Registry (for ETH/USD)
const FEED_REGISTRY_ETH = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE" as const;

// Common token addresses on Arbitrum One
const ARB_WETH = "0x82af49447d8a07e3bd95bd0d56f35241523fbab1" as const;
const ARB_USDC = "0xaf88d065e77c8cC2239327C5EDb3A432268e5831" as const; // native USDC
const ARB_GMX = "0x62edc0692BD897D2295872a9FFCac5425011c661" as const;

const feedRegistryAbi = [
  {
    inputs: [
      { internalType: "address", name: "base", type: "address" },
      { internalType: "address", name: "quote", type: "address" },
    ],
    name: "decimals",
    outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "base", type: "address" },
      { internalType: "address", name: "quote", type: "address" },
    ],
    name: "latestRoundData",
    outputs: [
      { internalType: "uint80", name: "roundId", type: "uint80" },
      { internalType: "int256", name: "answer", type: "int256" },
      { internalType: "uint256", name: "startedAt", type: "uint256" },
      { internalType: "uint256", name: "updatedAt", type: "uint256" },
      { internalType: "uint80", name: "answeredInRound", type: "uint80" },
    ],
    stateMutability: "view",
    type: "function",
  },
];

async function readRegistryPrice(
  client: ReturnType<typeof makePublicClient>,
  base: `0x${string}`,
  quote: `0x${string}`,
) {
  const [decimals, latest] = await Promise.all([
    client.readContract({
      address: FEED_REGISTRY_ARBITRUM,
      abi: feedRegistryAbi,
      functionName: "decimals",
      args: [base, quote],
    }) as Promise<number>,
    client.readContract({
      address: FEED_REGISTRY_ARBITRUM,
      abi: feedRegistryAbi,
      functionName: "latestRoundData",
      args: [base, quote],
    }) as Promise<readonly [bigint, bigint, bigint, bigint, bigint]>,
  ]);
  const answer = latest[1];
  return Number(answer) / 10 ** Number(decimals);
}

async function main() {
  // Arbitrum One chain id used across this project
  const ARBITRUM_CHAIN_ID = 42_161 as const;
  const client = makePublicClient(ARBITRUM_CHAIN_ID);

  const [decimals, latest] = await Promise.all([
    client.readContract({
      address: CHAINLINK_BTC_USD_ARBITRUM,
      abi: aggregatorV3Abi,
      functionName: "decimals",
      args: [],
    }) as Promise<number>,
    client.readContract({
      address: CHAINLINK_BTC_USD_ARBITRUM,
      abi: aggregatorV3Abi,
      functionName: "latestRoundData",
      args: [],
    }) as Promise<readonly [bigint, bigint, bigint, bigint, bigint]>,
  ]);

  const answer = latest[1];
  const price = Number(answer) / 10 ** Number(decimals);

  console.log(price);

  // Print as WBTC ~ BTC (USD)
  // Example: WBTC price: $64,123.45 (BTC/USD via Chainlink on Arbitrum)
  const formatted = price.toLocaleString(undefined, {
    maximumFractionDigits: Number(decimals),
  });
  console.log(`WBTC price: $${formatted} (BTC/USD via Chainlink on Arbitrum)`);

  // Also fetch WETH (ETH/USD) and USDC (USDC/USD), plus derived WETH/USDC
  const [ethUsd, usdcUsd] = await Promise.all([
    readPrice(client, CHAINLINK_ETH_USD_ARBITRUM),
    readPrice(client, CHAINLINK_USDC_USD_ARBITRUM),
  ]);

  const wethUsdc = ethUsd / usdcUsd;

  console.log(
    `WETH price: $${ethUsd.toLocaleString(undefined, { maximumFractionDigits: 8 })} (ETH/USD via Chainlink on Arbitrum)`,
  );
  console.log(
    `USDC price: $${usdcUsd.toLocaleString(undefined, { maximumFractionDigits: 8 })} (USDC/USD via Chainlink on Arbitrum)`,
  );
  console.log(`WETH/USDC price: ${wethUsdc.toLocaleString(undefined, { maximumFractionDigits: 8 })}`);

  // Feed Registry reads (no hardcoded feed addresses) — only if registry exists on this chain
  try {
    const code = await client.getCode({ address: FEED_REGISTRY_ARBITRUM });
    if (code && code !== "0x") {
      const [registryEthUsd, registryUsdcUsd, registryGmxUsd] = await Promise.all([
        readRegistryPrice(client, FEED_REGISTRY_ETH, FEED_REGISTRY_USD),
        readRegistryPrice(client, ARB_USDC, FEED_REGISTRY_USD),
        readRegistryPrice(client, ARB_GMX, FEED_REGISTRY_USD),
      ]);
      console.log(`REGISTRY ETH/USD: $${registryEthUsd.toLocaleString(undefined, { maximumFractionDigits: 8 })}`);
      console.log(`REGISTRY USDC/USD: $${registryUsdcUsd.toLocaleString(undefined, { maximumFractionDigits: 8 })}`);
      console.log(`REGISTRY GMX/USD: $${registryGmxUsd.toLocaleString(undefined, { maximumFractionDigits: 8 })}`);
    } else {
      console.warn("Feed Registry not found on this chain. Skipping registry example.");
    }
  } catch {
    console.warn("Feed Registry check failed. Skipping registry example.");
  }

  // GMX/USD
  const gmxUsd = await readPrice(client, CHAINLINK_GMX_USD_ARBITRUM);
  console.log(
    `GMX price: $${gmxUsd.toLocaleString(undefined, { maximumFractionDigits: 8 })} (GMX/USD via Chainlink on Arbitrum)`,
  );
}

main().catch((err) => {
  console.error("Script error:", err);
  process.exitCode = 1;
});
