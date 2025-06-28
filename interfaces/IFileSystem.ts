/**
 * File System Abstraction Interface
 * 
 * Provides platform-independent file system operations.
 * Replaces VS Code's workspace.fs API.
 */

export interface FileStats {
  isFile(): boolean
  isDirectory(): boolean
  size: number
  mtime: number
  ctime: number
}

export interface IFileSystem {
  /**
   * Read file content as string
   */
  readFile(path: string): Promise<string>
  
  /**
   * Write content to file
   */
  writeFile(path: string, content: string): Promise<void>
  
  /**
   * Check if file or directory exists
   */
  exists(path: string): Promise<boolean>
  
  /**
   * Create directory
   */
  mkdir(path: string, options?: { recursive?: boolean }): Promise<void>
  
  /**
   * List directory contents
   */
  readdir(path: string): Promise<string[]>
  
  /**
   * Get file/directory statistics
   */
  stat(path: string): Promise<FileStats>
  
  /**
   * Delete file or directory
   */
  delete(path: string, options?: { recursive?: boolean }): Promise<void>
  
  /**
   * Copy file or directory
   */
  copy(source: string, target: string): Promise<void>
  
  /**
   * Move/rename file or directory
   */
  move(source: string, target: string): Promise<void>
  
  /**
   * Watch for file system changes
   */
  watch(path: string, options?: { recursive?: boolean }): IFileWatcher
}

export interface IFileWatcher {
  /**
   * Event fired when a file/directory is created
   */
  onDidCreate: (listener: (path: string) => void) => void
  
  /**
   * Event fired when a file/directory is changed
   */
  onDidChange: (listener: (path: string) => void) => void
  
  /**
   * Event fired when a file/directory is deleted
   */
  onDidDelete: (listener: (path: string) => void) => void
  
  /**
   * Stop watching and clean up resources
   */
  dispose(): void
} 