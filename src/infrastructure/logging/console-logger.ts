import type { Logger, LogLevel } from "./types";

const LOG_LEVEL_PRIORITIES: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  silent: 4,
};

export class ConsoleLogger implements Logger {
  constructor(
    private readonly className: string,
    private readonly level: LogLevel = "info",
  ) {}

  debug(message: string, ...args: any[]): void {
    if (this.shouldLog("debug")) {
      console.debug(`[${this.className}] ${message}`, ...args);
    }
  }

  info(message: string, ...args: any[]): void {
    if (this.shouldLog("info")) {
      console.log(`[${this.className}] ${message}`, ...args);
    }
  }

  warn(message: string, ...args: any[]): void {
    if (this.shouldLog("warn")) {
      console.warn(`[${this.className}] ${message}`, ...args);
    }
  }

  error(message: string, ...args: any[]): void {
    if (this.shouldLog("error")) {
      console.error(`[${this.className}] ${message}`, ...args);
    }
  }

  private shouldLog(messageLevel: LogLevel): boolean {
    return LOG_LEVEL_PRIORITIES[messageLevel] >= LOG_LEVEL_PRIORITIES[this.level];
  }
}
