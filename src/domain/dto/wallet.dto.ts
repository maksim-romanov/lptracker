import { IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from "class-validator";
import { Address } from "viem";

import { IsEthereumAddress } from "utils/form";

export class WalletDto {
  @IsNotEmpty({ message: "Wallet address is required" })
  @IsEthereumAddress({ message: "Must be a valid Ethereum address" })
  address!: Address;

  @IsOptional()
  @IsString({ message: "Wallet name must be a string" })
  @MinLength(1, { message: "Wallet name must be at least 1 character long" })
  @MaxLength(50, { message: "Wallet name must be no more than 50 characters long" })
  name?: string;
}

export class AddressDto {
  @IsNotEmpty({ message: "Address is required" })
  @IsEthereumAddress({ message: "Must be a valid Ethereum address" })
  address!: Address;
}

export class UpdateWalletDto {
  @IsNotEmpty({ message: "Old address is required" })
  @IsEthereumAddress({ message: "Old address must be a valid Ethereum address" })
  oldAddress!: Address;

  @IsNotEmpty({ message: "New wallet address is required" })
  @IsEthereumAddress({ message: "New wallet address must be a valid Ethereum address" })
  newAddress!: Address;

  @IsOptional()
  @IsString({ message: "Wallet name must be a string" })
  @MinLength(1, { message: "Wallet name must be at least 1 character long" })
  @MaxLength(50, { message: "Wallet name must be no more than 50 characters long" })
  name?: string;
}
