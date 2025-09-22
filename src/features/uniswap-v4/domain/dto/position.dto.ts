import { Transform } from "class-transformer";
import { IsNotEmpty, IsEthereumAddress, Min } from "class-validator";
import type { Address } from "viem";

export class GetPositionCardDto {
  tokenId: bigint;

  @IsNotEmpty({ message: "Chain ID is required" })
  @Min(1, { message: "Chain ID must be a positive number" })
  chainId: number;
}

export class GetPositionSummaryDto {
  tokenId: bigint;

  @IsNotEmpty({ message: "Chain ID is required" })
  @Min(1, { message: "Chain ID must be a positive number" })
  chainId: number;
}

export class GetPositionIdsDto {
  @IsEthereumAddress({ message: "Owner must be a valid Ethereum address" })
  @IsNotEmpty({ message: "Owner address is required" })
  owner: Address;

  @IsNotEmpty({ message: "Chain ID is required" })
  @Min(1, { message: "Chain ID must be a positive number" })
  chainId: number;
}
