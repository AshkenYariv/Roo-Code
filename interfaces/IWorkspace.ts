/**
 * Workspace Abstraction Interface
 * 
 * Provides platform-independent workspace management.
 * Replaces VS Code's workspace API.
 */

import { IConfiguration } from './IConfiguration'

export interface WorkspaceFolder {
  /**
   * The associated URI for this workspace folder.
   */
  uri: string
  
  /**
   * The name of this workspace folder. Defaults to the basename of its URI path.
   */
  name: string
  
  /**
   * The ordinal number of this workspace folder.
   */
  index: number
}

export interface IWorkspace {
  /**
   * List of workspace folders currently opened.
   */
  readonly workspaceFolders: readonly WorkspaceFolder[] | undefined
  
  /**
   * The first workspace folder, if any.
   */
  readonly rootPath: string | undefined
  
  /**
   * Convert an absolute path to a relative path based on workspace folders.
   */
  asRelativePath(pathOrUri: string, includeWorkspaceFolder?: boolean): string
  
  /**
   * Get workspace configuration
   */
  getConfiguration(section?: string, scope?: string): IConfiguration
  
  /**
   * Find files across all workspace folders
   */
  findFiles(
    include: string,
    exclude?: string,
    maxResults?: number
  ): Promise<string[]>
  
  /**
   * Get the workspace folder that contains a given path
   */
  getWorkspaceFolder(uri: string): WorkspaceFolder | undefined
} 