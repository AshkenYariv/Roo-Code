import { 
  IRooCodeDependencies,
  IFileSystem,
  ILogger,
  IWorkspace,
  INotification,
  ISystemInfo,
  IClipboard,
  IExternalApp,
  ITerminal
} from './interfaces'

import { NodeFileSystem } from './nodejs/NodeFileSystem'
import { NodeLogger } from './nodejs/NodeLogger'
import { NodeWorkspace } from './nodejs/NodeWorkspace'
import { NodeNotification } from './nodejs/NodeNotification'
import { NodeSystemInfo } from './nodejs/NodeSystemInfo'
import { NodeClipboard } from './nodejs/NodeClipboard'
import { NodeExternalApp } from './nodejs/NodeExternalApp'
import { NodeTerminal } from './nodejs/NodeTerminal'

export interface DependencyContainerOptions {
  workspacePath?: string
  logger?: ILogger
  fileSystem?: IFileSystem
  workspace?: IWorkspace
  notification?: INotification
  systemInfo?: ISystemInfo
  clipboard?: IClipboard
  externalApp?: IExternalApp
  terminal?: ITerminal
}

/**
 * Dependency container that provides all required abstractions
 * for the Roo-Code engine to operate independently of VS Code.
 */
export class DependencyContainer implements IRooCodeDependencies {
  public readonly fileSystem: IFileSystem
  public readonly logger: ILogger
  public readonly workspace: IWorkspace
  public readonly notification: INotification
  public readonly systemInfo: ISystemInfo
  public readonly clipboard?: IClipboard
  public readonly externalApp?: IExternalApp
  public readonly terminal?: ITerminal

  constructor(options: DependencyContainerOptions = {}) {
    // Core dependencies (required)
    this.logger = options.logger || new NodeLogger('roo-core')
    this.fileSystem = options.fileSystem || new NodeFileSystem()
    this.systemInfo = options.systemInfo || new NodeSystemInfo()
    this.workspace = options.workspace || new NodeWorkspace(
      options.workspacePath || process.cwd(),
      this.fileSystem,
      this.logger
    )
    this.notification = options.notification || new NodeNotification(this.logger)

    // Optional dependencies
    this.clipboard = options.clipboard || new NodeClipboard()
    this.externalApp = options.externalApp || new NodeExternalApp()
    this.terminal = options.terminal || new NodeTerminal()

    this.logger.info('Dependency container initialized')
  }

  /**
   * Create a new dependency container with Node.js implementations
   */
  static createNodeJsContainer(options: DependencyContainerOptions = {}): DependencyContainer {
    return new DependencyContainer(options)
  }

  /**
   * Create a child logger with the given prefix
   */
  createChildLogger(prefix: string): ILogger {
    return this.logger.child(prefix)
  }
} 