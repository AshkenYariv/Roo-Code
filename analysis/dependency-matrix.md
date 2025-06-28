# VS Code Dependency Matrix

## 🔍 Analysis Summary

**Total VS Code Dependencies Found**: 297 lines across 131 core files

**Key Discovery**: `src/core/task/Task.ts` (main engine) has **ZERO** direct VS Code dependencies! This is excellent news for extraction.

## 📊 Dependency Breakdown by Component

| Component | VS Code Dependencies | Abstraction Needed | Priority | Complexity |
|-----------|---------------------|-------------------|----------|------------|
| **Task.ts** | 0 direct references | ✅ Already abstracted | LOW | EASY |
| **ClineProvider.ts** | 36 references | UI/Webview abstraction | HIGH | HARD |
| **webviewMessageHandler.ts** | ~50 references | UI interactions | HIGH | HARD |
| **CustomModesManager.ts** | ~30 references | File watchers, config | MEDIUM | MEDIUM |
| **Tools (writeToFile, codebaseSearch)** | ~20 references | File system, workspace | HIGH | MEDIUM |
| **Config/ContextProxy** | ~15 references | Configuration management | MEDIUM | MEDIUM |
| **RooIgnoreController** | ~8 references | File watchers | MEDIUM | EASY |
| **Environment/System** | ~5 references | System info access | LOW | EASY |

## 🎯 Critical Dependencies to Abstract

### High Priority (Core Functionality)
1. **File System Operations** (`writeToFileTool.ts`, `codebaseSearchTool.ts`)
   - `vscode.workspace.fs` → `IFileSystem`
   - `vscode.workspace.workspaceFolders` → `IWorkspace`

2. **Configuration Management** (`CustomModesManager.ts`, `ContextProxy.ts`)
   - `vscode.workspace.getConfiguration()` → `IConfiguration`
   - `vscode.ConfigurationTarget` → Config abstraction

3. **UI Interactions** (`webviewMessageHandler.ts`)
   - `vscode.window.showErrorMessage()` → `INotification`
   - `vscode.window.showInformationMessage()` → `INotification`

### Medium Priority (Enhanced Features)
4. **File System Watchers** (`CustomModesManager.ts`, `RooIgnoreController.ts`)
   - `vscode.workspace.createFileSystemWatcher()` → `IFileWatcher`

5. **Clipboard Operations** (`webviewMessageHandler.ts`)
   - `vscode.env.clipboard.writeText()` → `IClipboard`

6. **External URLs** (`webviewMessageHandler.ts`)
   - `vscode.env.openExternal()` → `IExternalApp`

### Low Priority (Environment)
7. **System Information** (`getEnvironmentDetails.ts`)
   - `vscode.version`, `vscode.env.appName` → `ISystemInfo`

## 🏗️ Required Abstraction Interfaces

### Core Interfaces
```typescript
// File System Operations
interface IFileSystem {
  readFile(path: string): Promise<string>
  writeFile(path: string, content: string): Promise<void>
  exists(path: string): Promise<boolean>
  mkdir(path: string, recursive?: boolean): Promise<void>
  readdir(path: string): Promise<string[]>
  stat(path: string): Promise<FileStats>
}

// Workspace Management  
interface IWorkspace {
  workspaceFolders: WorkspaceFolder[]
  asRelativePath(path: string): string
  getConfiguration(section?: string): IConfiguration
}

// Configuration Access
interface IConfiguration {
  get<T>(key: string): T | undefined
  update(key: string, value: any, global?: boolean): Promise<void>
}

// User Interface
interface INotification {
  showInformation(message: string, ...items: string[]): Promise<string | undefined>
  showWarning(message: string, ...items: string[]): Promise<string | undefined>  
  showError(message: string, ...items: string[]): Promise<string | undefined>
}

// File Watching
interface IFileWatcher {
  onDidCreate: Event<Uri>
  onDidChange: Event<Uri>
  onDidDelete: Event<Uri>
  dispose(): void
}

// Logging
interface ILogger {
  log(message: string): void
  error(message: string | Error): void
  warn(message: string): void
  info(message: string): void
  debug(message: string): void
}
```

### Environment Interfaces
```typescript
// System Information
interface ISystemInfo {
  appName: string
  version: string
  language: string
  machineId: string
  uriScheme: string
}

// External Operations
interface IExternalApp {
  openExternal(uri: string): Promise<boolean>
}

// Clipboard Operations  
interface IClipboard {
  writeText(text: string): Promise<void>
  readText(): Promise<string>
}
```

## 🔄 Migration Strategy

### Phase 1: Core Abstraction (Days 1-2)
1. **Extract Task.ts** - Already VS Code independent ✅
2. **Abstract File System Tools** - Replace `vscode.workspace.fs` 
3. **Abstract Configuration** - Replace `vscode.workspace.getConfiguration()`
4. **Abstract Notifications** - Replace `vscode.window.show*Message()`

### Phase 2: Enhanced Features (Days 3-4)
5. **Abstract File Watchers** - Replace `vscode.workspace.createFileSystemWatcher()`
6. **Abstract System Info** - Replace `vscode.version`, `vscode.env.*`

### Phase 3: UI Separation (Days 5-6)
7. **Webview Abstraction** - Separate UI from core logic
8. **Command Abstraction** - Replace `vscode.commands.executeCommand()`

## 📈 Complexity Assessment

### Low Complexity (1-2 days)
- ✅ Task.ts (already done)
- ✅ System information abstraction
- ✅ Basic file operations

### Medium Complexity (2-3 days)  
- ⚠️ Configuration management
- ⚠️ File watchers
- ⚠️ Tool implementations

### High Complexity (3-4 days)
- 🔴 Webview provider separation
- 🔴 UI interaction abstraction
- 🔴 Command system replacement

## 🎯 Success Metrics

- **Zero VS Code imports** in core engine
- **All tools functional** with abstractions
- **Configuration system** working independently
- **Test coverage** > 90% for abstracted components
- **Performance** within 10% of original

## ➡️ Next Steps

1. **Create interface definitions** (interfaces/)
2. **Implement concrete abstractions** for Node.js environment
3. **Migrate tools one by one** starting with file operations
4. **Create VS Code compatibility layer** for gradual migration
5. **Comprehensive testing** of abstracted components 