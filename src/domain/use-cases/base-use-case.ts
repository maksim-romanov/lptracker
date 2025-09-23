import { ValidationError as ClassValidatorError } from "class-validator";

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
}
