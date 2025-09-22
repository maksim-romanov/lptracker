import { IsEthereumAddress, IsNotEmpty, Min } from "class-validator";
import type { Address } from "viem";

export class GetTokenPriceDto {
  @IsEthereumAddress({ message: "Token address must be a valid Ethereum address" })
  @IsNotEmpty({ message: "Token address is required" })
  tokenAddress: Address;

  @IsNotEmpty({ message: "Chain ID is required" })
  @Min(1, { message: "Chain ID must be a positive number" })
  chainId: number;
}