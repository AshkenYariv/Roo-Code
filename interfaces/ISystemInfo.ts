/**
 * System Information Abstraction Interface
 * 
 * Provides platform-independent system information.
 * Replaces VS Code's env API.
 */

export interface ISystemInfo {
  /**
   * Application name (e.g., "Visual Studio Code", "Roo-Code Server")
   */
  readonly appName: string
  
  /**
   * Application version
   */
  readonly version: string
  
  /**
   * Language identifier (e.g., "en", "pt-BR")
   */
  readonly language: string
  
  /**
   * Unique machine identifier
   */
  readonly machineId: string
  
  /**
   * URI scheme used by the application
   */
  readonly uriScheme: string
  
  /**
   * Operating system platform
   */
  readonly platform: 'win32' | 'darwin' | 'linux' | 'other'
  
  /**
   * Operating system architecture
   */
  readonly arch: string
  
  /**
   * Whether the application is running in development mode
   */
  readonly isDevelopment: boolean
  
  /**
   * Current working directory
   */
  readonly cwd: string
  
  /**
   * Environment variables
   */
  getEnvVar(name: string): string | undefined
  
  /**
   * Home directory path
   */
  readonly homeDir: string
  
  /**
   * Temporary directory path
   */
  readonly tmpDir: string
} 