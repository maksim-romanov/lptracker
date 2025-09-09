import { Token, ChainId } from "@uniswap/sdk-core";
import { Pool } from "@uniswap/v4-sdk";
import { ethers } from "ethers";
import request from "graphql-request";
import { createPublicClient, http, Address, formatUnits } from "viem";
import { arbitrum } from "viem/chains";

import { UNISWAP_V4_CONFIGS } from "./api/configs";

const arbitrumConfig = UNISWAP_V4_CONFIGS.arbitrum;

const publicClient = createPublicClient({
  chain: arbitrum,
  transport: http(),
});

///

interface SubgraphPosition {
  id: string;
  tokenId: string;
  owner: string;
}

const GET_POSITIONS_QUERY = `
  query GetPositions($owner: String!) {
    positions(where: { owner: $owner }) {
      tokenId
      owner
      id
    }
  }
`;

async function getPositionIds(owner: Address): Promise<bigint[]> {
  // You can explore queries at: https://thegraph.com/explorer/subgraphs/EoCvJ5tyMLMJcTnLQwWpjAtPdn74PcrZgzfcT5bYxNBH?view=Query&chain=arbitrum-one

  const headers = {
    Authorization: "Bearer " + "483aa90f30cf4a8250dee1c72c643c9d", // Get your API key from https://thegraph.com/studio/apikeys/
  };

  const response = await request<{ positions: SubgraphPosition[] }>(
    arbitrumConfig.subgraphUrl,
    GET_POSITIONS_QUERY,
    { owner: owner.toLowerCase() },
    headers,
  );

  return response.positions.map((p) => BigInt(p.tokenId));
}

interface PackedPositionInfo {
  getTickUpper(): number;
  getTickLower(): number;
  hasSubscriber(): boolean;
}

function decodePositionInfo(value: bigint): PackedPositionInfo {
  return {
    getTickUpper: () => {
      const raw = Number((value >> 32n) & 0xffffffn);
      return raw >= 0x800000 ? raw - 0x1000000 : raw;
    },

    getTickLower: () => {
      const raw = Number((value >> 8n) & 0xffffffn);
      return raw >= 0x800000 ? raw - 0x1000000 : raw;
    },

    hasSubscriber: () => (value & 0xffn) !== 0n,
  };
}

interface PositionDetails {
  tokenId: bigint;
  tickLower: number;
  tickUpper: number;
  liquidity: bigint;
  poolKey: {
    currency0: Address;
    currency1: Address;
    fee: number;
    tickSpacing: number;
    hooks: Address;
  };
}

// Define return type for lifetime fees calculation
type LifetimeFees = {
  token0LifetimeFees: bigint;
  token1LifetimeFees: bigint;
};

const POSITION_MANAGER_ABI = [
  {
    name: "getPoolAndPositionInfo",
    type: "function",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [
      {
        name: "poolKey",
        type: "tuple",
        components: [
          { name: "currency0", type: "address" },
          { name: "currency1", type: "address" },
          { name: "fee", type: "uint24" },
          { name: "tickSpacing", type: "int24" },
          { name: "hooks", type: "address" },
        ],
      },
      { name: "info", type: "uint256" },
    ],
  },
  {
    name: "getPositionLiquidity",
    type: "function",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ name: "liquidity", type: "uint128" }],
  },
] as const;

async function getPositionDetails(tokenId: bigint): Promise<PositionDetails> {
  // Get pool key and packed position info
  // Get pool key and packed position info
  const [poolKey, infoValue] = (await publicClient.readContract({
    address: arbitrumConfig.positionManagerAddress,
    abi: POSITION_MANAGER_ABI,
    functionName: "getPoolAndPositionInfo",
    args: [tokenId],
  })) as readonly [
    {
      currency0: Address;
      currency1: Address;
      fee: number;
      tickSpacing: number;
      hooks: Address;
    },
    bigint,
  ];

  // Get current liquidity
  const liquidity = (await publicClient.readContract({
    address: arbitrumConfig.positionManagerAddress,
    abi: POSITION_MANAGER_ABI,
    functionName: "getPositionLiquidity",
    args: [tokenId],
  })) as bigint;

  // Decode packed position info
  const positionInfo = decodePositionInfo(infoValue);

  return {
    tokenId,
    tickLower: positionInfo.getTickLower(),
    tickUpper: positionInfo.getTickUpper(),
    liquidity,
    poolKey,
  };
}

async function fetchUserPositions(userAddress: Address) {
  try {
    // Get position IDs from subgraph
    const tokenIds = await getPositionIds(userAddress);
    console.log(`Found ${tokenIds.length} positions on Unichain`);

    // Fetch details for each position
    const [tokenId] = tokenIds;
    if (!tokenId) return null;
    return await getPositionDetails(tokenId);
    // for (const tokenId of tokenIds) {
    //   return await getPositionDetails(tokenId)
    // }
  } catch (error) {
    console.error("Error:", error);
  }
}

const position = await fetchUserPositions("0xeCa0b7CDd7F2fE6389Ee3720aE415D07ABe0Ed58");
// console.log("position: ", position);

if (!position) throw new Error("No position found");

const currency0 = new Token(ChainId.ARBITRUM_ONE, position.poolKey.currency0, 2, "ETH", "Etherium");
const currency1 = new Token(ChainId.ARBITRUM_ONE, position.poolKey.currency1, 6, "USDC", "USDC");
const poolId = Pool.getPoolId(
  currency0,
  currency1,
  position.poolKey.fee,
  position.poolKey.tickSpacing,
  position.poolKey.hooks,
);

// console.log("poolId: >>> ", poolId);

async function getStoredPositionInfoV4(positionDetails: PositionDetails, tokenId: bigint) {
  const salt = `0x${tokenId.toString(16).padStart(64, "0")}`;
  const [liquidity, feeGrowthInside0Last, feeGrowthInside1Last] = (await publicClient.readContract({
    address: arbitrumConfig.stateViewAddress,
    abi: [
      {
        name: "getPositionInfo",
        type: "function",
        inputs: [
          { name: "poolId", type: "bytes32" },
          { name: "positionManager", type: "address" },
          { name: "tickLower", type: "int24" },
          { name: "tickUpper", type: "int24" },
          { name: "salt", type: "bytes32" },
        ],
        outputs: [
          { name: "liquidity", type: "uint128" },
          { name: "feeGrowthInside0Last", type: "uint128" },
          { name: "feeGrowthInside1Last", type: "uint128" },
        ],
      },
    ],
    functionName: "getPositionInfo",
    args: [poolId, arbitrumConfig.positionManagerAddress, positionDetails.tickLower, positionDetails.tickUpper, salt],
  })) as readonly [bigint, bigint, bigint];

  return {
    liquidity,
    feeGrowthInside0Last,
    feeGrowthInside1Last,
  };
}

const storedPositionInfo = await getStoredPositionInfoV4(position, position.tokenId);
// console.log("storedPositionInfo: >>> ", storedPositionInfo);

async function getCurrentFeeGrowthV4(positionDetails: PositionDetails) {
  const [feeGrowthInside0X128, feeGrowthInside1X128] = (await publicClient.readContract({
    address: arbitrumConfig.stateViewAddress,
    abi: [
      {
        name: "getFeeGrowthInside",
        type: "function",
        inputs: [
          { name: "poolId", type: "bytes32" },
          { name: "tickLower", type: "int24" },
          { name: "tickUpper", type: "int24" },
        ],
        outputs: [
          { name: "feeGrowthInside0X128", type: "uint128" },
          { name: "feeGrowthInside1X128", type: "uint128" },
        ],
      },
    ],
    functionName: "getFeeGrowthInside",
    args: [poolId, positionDetails.tickLower, positionDetails.tickUpper],
  })) as readonly [bigint, bigint];

  return {
    feeGrowthInside0X128,
    feeGrowthInside1X128,
  };
}

const currentFeeGrowth = await getCurrentFeeGrowthV4(position);
// console.log("currentFeeGrowth: >>> ", currentFeeGrowth);

function calculateLifetimeFeesV4(
  liquidity: bigint,
  feeGrowthInside0Current: bigint,
  feeGrowthInside1Current: bigint,
  feeGrowthInside0Last: bigint,
  feeGrowthInside1Last: bigint,
): LifetimeFees {
  const Q128 = 2n ** 128n;

  // Calculate the difference between current and last fee growth
  const feeGrowthInside0Delta = feeGrowthInside0Current - feeGrowthInside0Last;
  const feeGrowthInside1Delta = feeGrowthInside1Current - feeGrowthInside1Last;

  return {
    token0LifetimeFees: (feeGrowthInside0Delta * liquidity) / Q128,
    token1LifetimeFees: (feeGrowthInside1Delta * liquidity) / Q128,
  };
}

const lifetimeFees = calculateLifetimeFeesV4(
  storedPositionInfo.liquidity,
  currentFeeGrowth.feeGrowthInside0X128,
  currentFeeGrowth.feeGrowthInside1X128,
  storedPositionInfo.feeGrowthInside0Last,
  storedPositionInfo.feeGrowthInside1Last,
);

console.log("lifetimeFees: >>> ", {
  token0LifetimeFees: formatUnits(lifetimeFees.token0LifetimeFees, 18),
  token1LifetimeFees: formatUnits(lifetimeFees.token1LifetimeFees, 6),
});

// async function getCurrentFeeGrowthV4(positionDetails) {
//   const [feeGrowthInside0X128, feeGrowthInside1X128] = await publicClient.readContract({
//     address: arbitrumConfig.stateViewAddress,
//     functionName: 'getFeeGrowthInside',
//     args: [poolId, position.tickLower, position.tickUpper],
//     abi: [
//       {
//         name: 'getFeeGrowthInside',
//         type: 'function',
//         inputs: [
//           { name: 'poolId', type: 'bytes32' },
//           { name: 'tickLower', type: 'int24' },
//           { name: 'tickUpper', type: 'int24' },
//         ],
//         outputs: [{ type: 'uint128' }, { type: 'uint128' }],
//         stateMutability: 'view',
//       },
//     ]
//   })

//   console.log('feeGrowthInside0X128, feeGrowthInside1X128: ', feeGrowthInside0X128, feeGrowthInside1X128)
// }

// await getCurrentFeeGrowthV4(position)

// async function getStoredPositionInfoV4(positionDetails, tokenId, owner) {
//   const salt = `0x${tokenId.toString(16).padStart(64, '0')}`
//   const [liquidity, feeGrowthInside0Last, feeGrowthInside1Last] = await publicClient.readContract({
//     address: arbitrumConfig.stateViewAddress,
//     functionName: 'getPositionInfo',
//     args: [poolId, arbitrumConfig.positionManagerAddress, position.tickLower, position.tickUpper, salt],
//   })
// }

// async function getCurrentFeeGrowthV4(positionDetails) {
//   const [feeGrowthInside0X128, feeGrowthInside1X128] = await publicClient.readContract({
//     address: "0x7ffe42c4a5deea5b0fec41c94c136cf115597227",
//     functionName: 'getFeeGrowthInside',
//     args: [poolId, tickLower, tickUpper],
//   })
// }

// if(!positions) throw new Error('No positions found')
// const poisitonDetails = getPositionDetails(positions.tokenId)
// console.log('poisitonDetails: ', poisitonDetails)
