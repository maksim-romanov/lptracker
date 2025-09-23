import { IsEthereumAddress, IsNotEmpty, Min, IsIn } from "class-validator";
import type { Address } from "viem";

// Import supported chain IDs from token-prices feature
import { SUPPORTED_CHAIN_IDS } from "../../../token-prices/configs";

export class GetTokenMetadataDto {
  @IsEthereumAddress({ message: "Token address must be a valid Ethereum address" })
  @IsNotEmpty({ message: "Token address is required" })
  tokenAddress!: Address;

  @IsNotEmpty({ message: "Chain ID is required" })
  @Min(1, { message: "Chain ID must be a positive number" })
  @IsIn(SUPPORTED_CHAIN_IDS, { message: `Chain ID must be one of: ${SUPPORTED_CHAIN_IDS.join(", ")}` })
  chainId!: number;
}
