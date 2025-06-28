/**
 * Configuration Abstraction Interface
 * 
 * Provides platform-independent configuration management.
 * Replaces VS Code's WorkspaceConfiguration API.
 */

export type ConfigurationTarget = 'global' | 'workspace' | 'workspaceFolder'

export interface IConfiguration {
  /**
   * Get a configuration value
   */
  get<T>(section: string): T | undefined
  get<T>(section: string, defaultValue: T): T
  
  /**
   * Check if a configuration value is defined
   */
  has(section: string): boolean
  
  /**
   * Get configuration inspection details
   */
  inspect<T>(section: string): {
    key: string
    defaultValue?: T
    globalValue?: T
    workspaceValue?: T
    workspaceFolderValue?: T
  } | undefined
  
  /**
   * Update a configuration value
   */
  update(section: string, value: any, target?: ConfigurationTarget): Promise<void>
  
  /**
   * Get all configuration keys
   */
  keys(): string[]
  
  /**
   * Get all configuration as object
   */
  getAll(): Record<string, any>
  
  /**
   * Listen for configuration changes
   */
  onDidChange(listener: (e: { affectsConfiguration: (section: string) => boolean }) => void): void
} 