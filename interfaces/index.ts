/**
 * Core Abstraction Interfaces
 * 
 * These interfaces provide platform-independent abstractions for
 * VS Code-specific APIs, enabling the Roo-Code engine to run
 * in standalone environments.
 */

// Core interfaces
export * from './IFileSystem'
export * from './ILogger'
export * from './IWorkspace'
export * from './IConfiguration'
export * from './INotification'
export * from './ISystemInfo'

// Additional utility interfaces
export interface IClipboard {
  writeText(text: string): Promise<void>
  readText(): Promise<string>
}

export interface IExternalApp {
  openExternal(uri: string): Promise<boolean>
}

export interface ITerminal {
  execute(
    command: string,
    options?: {
      cwd?: string
      env?: Record<string, string>
      timeout?: number
    }
  ): Promise<{
    stdout: string
    stderr: string
    exitCode: number
  }>
  
  spawn(
    command: string,
    args: string[],
    options?: {
      cwd?: string
      env?: Record<string, string>
    }
  ): Promise<{
    pid: number
    kill: () => void
    onData: (callback: (data: string) => void) => void
    onExit: (callback: (code: number) => void) => void
  }>
}

// Import all types for use in dependencies interface
import type { IFileSystem } from './IFileSystem'
import type { ILogger } from './ILogger'
import type { IWorkspace } from './IWorkspace'
import type { INotification } from './INotification'
import type { ISystemInfo } from './ISystemInfo'

/**
 * Main dependency container interface
 * 
 * This interface defines all the dependencies that the Roo-Code
 * engine requires to operate independently of VS Code.
 */
export interface IRooCodeDependencies {
  fileSystem: IFileSystem
  logger: ILogger
  workspace: IWorkspace
  notification: INotification
  systemInfo: ISystemInfo
  clipboard?: IClipboard
  externalApp?: IExternalApp
  terminal?: ITerminal
} 