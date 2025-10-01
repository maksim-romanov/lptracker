/**
 * Logger interface for application-wide logging
 * Provides methods for different log levels and extensibility for namespaced logging
 */
export interface ILogger {
  /**
   * Log a debug message
   * @param message - The message to log
   * @param optionalParams - Additional parameters to log
   */
  debug(message: any, ...optionalParams: any[]): void;

  /**
   * Log an info message
   * @param message - The message to log
   * @param optionalParams - Additional parameters to log
   */
  info(message: any, ...optionalParams: any[]): void;

  /**
   * Log a warning message
   * @param message - The message to log
   * @param optionalParams - Additional parameters to log
   */
  warn(message: any, ...optionalParams: any[]): void;

  /**
   * Log an error message
   * @param message - The message to log
   * @param optionalParams - Additional parameters to log
   */
  error(message: any, ...optionalParams: any[]): void;

  /**
   * Create a namespaced logger extension
   * @param namespace - The namespace for the extended logger
   * @returns A new logger instance with the namespace
   */
  extend(namespace: string): ILogger;
}
