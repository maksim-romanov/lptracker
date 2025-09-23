import { plainToClass } from "class-transformer";
import { validate, ValidationError as ClassValidatorError } from "class-validator";

export class ValidationException extends Error {
  constructor(
    public readonly errors: ClassValidatorError[],
    message = "Validation failed",
  ) {
    super(message);
    this.name = "ValidationException";
  }

  get formattedErrors(): string[] {
    return this.errors.flatMap((error) => Object.values(error.constraints || {}));
  }
}

export abstract class BaseUseCase<TParams, TResult> {
  abstract execute(params: TParams): Promise<TResult>;

  protected async validateDto<T extends object>(dtoClass: new () => T, data: any): Promise<T> {
    const dto = plainToClass(dtoClass, data);
    const errors = await validate(dto);

    if (errors.length > 0) {
      throw new ValidationException(errors);
    }

    return dto;
  }
}
