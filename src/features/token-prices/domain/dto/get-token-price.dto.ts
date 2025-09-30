import { IsEthereumAddress, IsNotEmpty, Min, IsIn } from "class-validator";
import type { Address } from "viem";

import { SUPPORTED_CHAIN_IDS } from "../types";

export class GetTokenPriceDto {
  @IsEthereumAddress({ message: "Token address must be a valid Ethereum address" })
  @IsNotEmpty({ message: "Token address is required" })
  tokenAddress!: Address;

  @IsNotEmpty({ message: "Chain ID is required" })
  @Min(1, { message: "Chain ID must be a positive number" })
  @IsIn(SUPPORTED_CHAIN_IDS, { message: `Chain ID must be one of: ${SUPPORTED_CHAIN_IDS.join(", ")}` })
  chainId!: number;
}
