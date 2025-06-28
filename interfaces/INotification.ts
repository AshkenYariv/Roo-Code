/**
 * Notification Abstraction Interface
 * 
 * Provides platform-independent user notification capabilities.
 * Replaces VS Code's window.show*Message APIs.
 */

export interface MessageOptions {
  modal?: boolean
  detail?: string
}

export interface INotification {
  /**
   * Show an information message
   */
  showInformation(message: string, ...items: string[]): Promise<string | undefined>
  showInformation(message: string, options: MessageOptions, ...items: string[]): Promise<string | undefined>
  
  /**
   * Show a warning message
   */
  showWarning(message: string, ...items: string[]): Promise<string | undefined>
  showWarning(message: string, options: MessageOptions, ...items: string[]): Promise<string | undefined>
  
  /**
   * Show an error message
   */
  showError(message: string, ...items: string[]): Promise<string | undefined>
  showError(message: string, options: MessageOptions, ...items: string[]): Promise<string | undefined>
  
  /**
   * Show a progress notification
   */
  withProgress<R>(
    options: {
      title: string
      cancellable?: boolean
    },
    task: (progress: {
      report: (value: { message?: string; increment?: number }) => void
    }) => Promise<R>
  ): Promise<R>
  
  /**
   * Show an input box for user input
   */
  showInputBox(options?: {
    prompt?: string
    placeholder?: string
    value?: string
    password?: boolean
    validateInput?: (value: string) => string | undefined
  }): Promise<string | undefined>
  
  /**
   * Show a quick pick list
   */
  showQuickPick(
    items: string[] | { label: string; description?: string; detail?: string }[],
    options?: {
      placeHolder?: string
      canPickMany?: boolean
      matchOnDescription?: boolean
      matchOnDetail?: boolean
    }
  ): Promise<string | string[] | undefined>
} 