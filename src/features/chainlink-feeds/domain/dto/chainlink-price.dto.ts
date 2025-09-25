import { IsEthereumAddress, IsNumber, Min } from "class-validator";
import { Transform } from "class-transformer";
import type { Address } from "viem";

export class GetChainlinkPriceDto {
  @IsEthereumAddress()
  @Transform(({ value }) => (typeof value === "string" ? value.toLowerCase() : value))
  tokenAddress!: Address;

  @IsNumber()
  @Min(1)
  chainId!: number;
}