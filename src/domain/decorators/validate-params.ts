import { plainToClass } from "class-transformer";
import { validate } from "class-validator";

import { ValidationException } from "../use-cases/base-use-case";

export function ValidateParams<T extends object>(dtoClass: new () => T) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      if (args.length > 0) {
        const params = args[0];
        const dto = plainToClass(dtoClass, params);
        const errors = await validate(dto);

        if (errors.length > 0) {
          throw new ValidationException(errors);
        }

        args[0] = dto;
      }

      return await originalMethod.apply(this, args);
    };

    return descriptor;
  };
}
