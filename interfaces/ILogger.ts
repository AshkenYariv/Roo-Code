/**
 * Logger Abstraction Interface
 * 
 * Provides platform-independent logging capabilities.
 * Replaces VS Code's OutputChannel API.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export interface ILogger {
  /**
   * Log a general message
   */
  log(message: string): void
  
  /**
   * Log an error message or Error object
   */
  error(message: string | Error): void
  
  /**
   * Log a warning message
   */
  warn(message: string): void
  
  /**
   * Log an informational message
   */
  info(message: string): void
  
  /**
   * Log a debug message
   */
  debug(message: string): void
  
  /**
   * Set the minimum log level
   */
  setLevel(level: LogLevel): void
  
  /**
   * Create a child logger with a prefix
   */
  child(prefix: string): ILogger
  
  /**
   * Clear all logs (if supported)
   */
  clear?(): void
  
  /**
   * Show the log output (if supported)
   */
  show?(): void
} 