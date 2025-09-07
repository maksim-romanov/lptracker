import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from "class-validator";
import { isAddress } from "ethers";

@ValidatorConstraint({ async: false })
export class IsEthereumAddressConstraint implements ValidatorConstraintInterface {
  validate(address: string): boolean {
    return isAddress(address);
  }

  defaultMessage(): string {
    return "Must be a valid Ethereum address";
  }
}

export function IsEthereumAddress(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsEthereumAddressConstraint,
    });
  };
}
