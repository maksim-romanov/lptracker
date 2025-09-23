import { Transform } from "class-transformer";
import { IsNotEmpty, IsEthereumAddress, Min, IsArray, ArrayMinSize } from "class-validator";
import type { Address } from "viem";

export class GetPositionCardDto {
  tokenId!: bigint;

  @IsNotEmpty({ message: "Chain ID is required" })
  @Min(1, { message: "Chain ID must be a positive number" })
  chainId!: number;
}

export class GetPositionSummaryDto {
  tokenId!: bigint;

  @IsNotEmpty({ message: "Chain ID is required" })
  @Min(1, { message: "Chain ID must be a positive number" })
  chainId!: number;
}

export class GetPositionIdsDto {
  @IsEthereumAddress({ message: "Owner must be a valid Ethereum address" })
  @IsNotEmpty({ message: "Owner address is required" })
  owner!: Address;

  @IsNotEmpty({ message: "Chain ID is required" })
  @Min(1, { message: "Chain ID must be a positive number" })
  chainId!: number;
}

export class GetMultiChainPositionIdsDto {
  @IsEthereumAddress({ message: "Owner must be a valid Ethereum address" })
  @IsNotEmpty({ message: "Owner address is required" })
  owner!: Address;

  @IsArray({ message: "Chain IDs must be an array" })
  @ArrayMinSize(1, { message: "At least one chain ID is required" })
  @Transform(({ value }) => value.map((id: any) => Number(id)))
  chainIds!: number[];
}
