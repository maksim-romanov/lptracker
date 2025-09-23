/**
 * LogErrors decorator for automatic error handling in use cases
 *
 * Usage:
 * @LogErrors()
 * async execute(params: TParams): Promise<TResult> {
 *   // your logic here
 * }
 */
export function LogErrors() {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      try {
        return await originalMethod.apply(this, args);
      } catch (error) {
        // Log error with use case context
        const className = this.constructor.name;
        const message = error instanceof Error ? error.message : "Unknown error";
        const stack = error instanceof Error ? error.stack : undefined;

        console.error(`[${className}:${propertyKey}] Error:`, message, stack);

        // Re-throw the original error
        throw error;
      }
    };

    return descriptor;
  };
}
