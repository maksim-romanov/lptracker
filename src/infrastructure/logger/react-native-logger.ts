import type { ILogger } from "domain/logger/logger.interface";
import { consoleTransport, logger, transportFunctionType } from "react-native-logs";

export class ReactNativeLogger implements ILogger {
  private loggerInstance = logger.createLogger({
    ...this.config,
    transport: [consoleTransport]
  });

  extend(namespace: string): ILogger {
    const extendedLogger = this.loggerInstance.extend(namespace);
    return { ...extendedLogger, extend: this.extend.bind(this) };
  }

  debug(...optionalParams: unknown[]): void {
    this.loggerInstance.debug(...optionalParams);
  }

  info(...optionalParams: unknown[]): void {
    this.loggerInstance.info(...optionalParams);
  }

  warn(...optionalParams: unknown[]): void {
    this.loggerInstance.warn(...optionalParams);
  }

  error(...optionalParams: unknown[]): void {
    this.loggerInstance.error(...optionalParams);
  }

  private get config() {
    return {
      levels: {
        debug: 0,
        info: 1,
        warn: 2,
        error: 3,
      },

      severity: "info",
      printDate: false,

      transportOptions: {
        colors: {
          info: "blueBright",
          warn: "yellowBright",
          error: "redBright",
        },

        extensionColors: {},
      },
    } as const;
  }
}
