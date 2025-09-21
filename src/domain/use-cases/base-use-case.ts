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

export abstract class BaseUseCase {
  protected async validateDto<T extends object>(dtoClass: new () => T, data: any): Promise<T> {
    const dto = plainToClass(dtoClass, data);
    const errors = await validate(dto);

    if (errors.length > 0) {
      throw new ValidationException(errors);
    }

    return dto;
  }

  protected async execute<T>(operation: () => Promise<T>): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      this.logError(error);
      throw error;
    }
  }

  protected logError(error: unknown): void {
    const message = error instanceof Error ? error.message : "Unknown error";
    const stack = error instanceof Error ? error.stack : undefined;

    console.error(`[${this.constructor.name}] Error:`, message, stack);
  }

  protected handleError(error: unknown, defaultMessage = "An unexpected error occurred"): Error {
    if (error instanceof Error) {
      return error;
    }

    return new Error(defaultMessage);
  }
}
