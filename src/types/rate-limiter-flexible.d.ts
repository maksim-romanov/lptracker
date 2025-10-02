/**
 * Ambient type declarations for direct imports from rate-limiter-flexible
 * This allows us to import specific limiters without loading all backends
 */

declare module "rate-limiter-flexible/lib/RateLimiterMemory" {
  import type { RateLimiterMemory } from "rate-limiter-flexible";
  const RateLimiterMemoryImpl: typeof RateLimiterMemory;
  export default RateLimiterMemoryImpl;
}

declare module "rate-limiter-flexible/lib/RateLimiterQueue" {
  import type { RateLimiterQueue } from "rate-limiter-flexible";
  const RateLimiterQueueImpl: typeof RateLimiterQueue;
  export default RateLimiterQueueImpl;
}
