import { ILogger, LogLevel } from '../interfaces'

export class NodeLogger implements ILogger {
  private level: LogLevel = 'info'
  private prefix: string

  constructor(prefix: string = '') {
    this.prefix = prefix
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3
    }
    return levels[level] >= levels[this.level]
  }

  private formatMessage(level: LogLevel, message: string): string {
    const timestamp = new Date().toISOString()
    const levelStr = level.toUpperCase().padEnd(5)
    const prefixStr = this.prefix ? `[${this.prefix}] ` : ''
    return `${timestamp} ${levelStr} ${prefixStr}${message}`
  }

  log(message: string): void {
    this.info(message)
  }

  error(message: string | Error): void {
    if (!this.shouldLog('error')) return
    
    const errorMessage = message instanceof Error ? message.message : message
    const stack = message instanceof Error ? message.stack : undefined
    
    console.error(this.formatMessage('error', errorMessage))
    if (stack) {
      console.error(stack)
    }
  }

  warn(message: string): void {
    if (!this.shouldLog('warn')) return
    console.warn(this.formatMessage('warn', message))
  }

  info(message: string): void {
    if (!this.shouldLog('info')) return
    console.info(this.formatMessage('info', message))
  }

  debug(message: string): void {
    if (!this.shouldLog('debug')) return
    console.debug(this.formatMessage('debug', message))
  }

  setLevel(level: LogLevel): void {
    this.level = level
  }

  child(prefix: string): ILogger {
    const childPrefix = this.prefix ? `${this.prefix}:${prefix}` : prefix
    const child = new NodeLogger(childPrefix)
    child.setLevel(this.level)
    return child
  }

  clear?(): void {
    if (typeof console.clear === 'function') {
      console.clear()
    }
  }

  show?(): void {
    // No-op in Node.js - logs are already visible in console
  }
} 