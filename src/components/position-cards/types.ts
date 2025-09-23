import type { ChainId } from "../../domain/entities/blockchain";

export interface BasePositionData {
  chainId: ChainId;
  protocol: string;
}

export interface UniswapV4PositionData extends BasePositionData {
  protocol: "uniswap-v4";
  positionId: bigint;
}

export type PositionData = UniswapV4PositionData;

export type SupportedProtocol = PositionData["protocol"];
