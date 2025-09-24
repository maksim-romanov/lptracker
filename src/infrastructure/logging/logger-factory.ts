import { injectable } from "tsyringe";

import { ConsoleLogger } from "./console-logger";
import { SilentLogger } from "./silent-logger";
import type { Logger, LoggerConfig, LoggerFactory, LogLevel } from "./types";

@injectable()
export class DefaultLoggerFactory implements LoggerFactory {
  constructor(private readonly config: LoggerConfig) {}

  createLogger(className: string): Logger {
    const level = this.getLogLevel(className);

    if (level === "silent") {
      return new SilentLogger();
    }

    return new ConsoleLogger(className, level);
  }

  private getLogLevel(className: string): LogLevel {
    // Check for exact class name match first
    if (this.config.classLevels[className]) {
      return this.config.classLevels[className];
    }

    // Check for partial matches (e.g., "TrustWallet" matches "TrustWalletMetadataRepository")
    for (const [configClass, level] of Object.entries(this.config.classLevels)) {
      if (className.includes(configClass)) {
        return level;
      }
    }

    // Default level
    return this.config.defaultLevel;
  }
}
