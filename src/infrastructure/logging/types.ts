export type LogLevel = "debug" | "info" | "warn" | "error" | "silent";

export interface Logger {
  debug(message: string, ...args: any[]): void;
  info(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;
}

export interface LoggerConfig {
  // Default log level for all classes
  defaultLevel: LogLevel;
  // Per-class log level overrides
  classLevels: Record<string, LogLevel>;
}

export interface LoggerFactory {
  createLogger(className: string): Logger;
}
