import { Transform } from "class-transformer";
import { IsEthereumAddress, IsNumber, Min, IsIn, IsNotEmpty } from "class-validator";
import type { Address } from "viem";

import { CHAINLINK_SUPPORTED_CHAIN_IDS } from "../../configs";

export class GetChainlinkPriceDto {
  @IsEthereumAddress({ message: "Token address must be a valid Ethereum address" })
  @IsNotEmpty({ message: "Token address is required" })
  @Transform(({ value }) => (typeof value === "string" ? value.toLowerCase() : value))
  tokenAddress!: Address;

  @IsNumber({}, { message: "Chain ID must be a number" })
  @Min(1, { message: "Chain ID must be a positive number" })
  @IsIn(CHAINLINK_SUPPORTED_CHAIN_IDS, {
    message: `Chain ID must be one of: ${CHAINLINK_SUPPORTED_CHAIN_IDS.join(", ")}`,
  })
  chainId!: number;
}
