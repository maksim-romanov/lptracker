import type { Logger } from "./types";

export class SilentLogger implements Logger {
  debug(): void {
    // Silent - do nothing
  }

  info(): void {
    // Silent - do nothing
  }

  warn(): void {
    // Silent - do nothing
  }

  error(): void {
    // Silent - do nothing
  }
}
