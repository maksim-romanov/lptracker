import { Address } from "viem";

import { UNISWAP_V4_CONFIGS } from "../api/configs";

export type SupportedChain = keyof typeof UNISWAP_V4_CONFIGS;
export type UniswapV4Config = (typeof UNISWAP_V4_CONFIGS)[SupportedChain] & { positionManagerAddress: Address };

// Subgraph types are generated via GraphQL Code Generator

export interface PackedPositionInfo {
  getTickUpper(): number;
  getTickLower(): number;
  hasSubscriber(): boolean;
}

// PositionDetails and UniswapV4Position are inferred from service methods (type-only import to avoid runtime cycles)
export type PositionDetails = Awaited<
  ReturnType<import("../api/uniswap-v4-service").UniswapV4Service["getPositionDetails"]>
>;
export type UniswapV4Position = Awaited<
  ReturnType<import("../api/uniswap-v4-service").UniswapV4Service["fetchUserPositions"]>
>[number];

// moved UNISWAP_V4_CONFIGS to feature JSON + typed wrapper
