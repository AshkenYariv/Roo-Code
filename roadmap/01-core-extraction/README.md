# Phase 1: Core Engine Extraction (Weeks 1-2)

## Overview

Extract Roo-Code's core functionality from VS Code dependencies into a standalone service that can be deployed independently while maintaining all existing capabilities.

## Goals

- ✅ Remove VS Code dependencies from core engine
- ✅ Create standalone executable service
- ✅ Maintain all existing tool functionality
- ✅ Implement basic HTTP API interface
- ✅ Validate extraction with existing examples

## Architecture Changes

### Current State (VS Code Extension)
```
src/extension.ts
├── ClineProvider (webview + engine)
├── Task (core AI logic)
├── Tools (20+ tools with VS Code deps)
├── API layer (IPC communication)
└── VS Code integrations
```

### Target State (Standalone Service)
```
roo-core/
├── engine/
│   ├── RooEngine.ts (extracted ClineProvider core)
│   ├── TaskManager.ts (extracted Task logic)
│   ├── ToolExecutor.ts (abstracted tools)
│   └── ConfigManager.ts (settings management)
├── tools/ (VS Code independent)
├── providers/ (AI provider integrations)
├── api/ (HTTP API server)
└── types/ (shared interfaces)
```

## Step-by-Step Implementation

### Step 1.1: Analyze Dependencies (Day 1)

**Acceptance Criteria:**
- [ ] Complete dependency analysis of core components
- [ ] Identify all VS Code-specific dependencies
- [ ] Create dependency migration plan
- [ ] Document abstraction interfaces needed

**Implementation Tasks:**

1. **Analyze Core Components**
   ```bash
   # Analyze core dependencies
   grep -r "import.*vscode" src/core/ > vscode-deps.txt
   grep -r "vscode\." src/core/ >> vscode-deps.txt
   
   # List all core files
   find src/core -name "*.ts" | sort > core-files.txt
   ```

2. **Create Dependency Matrix**
   | Component | VS Code Dependencies | Abstraction Needed |
   |-----------|---------------------|-------------------|
   | Task.ts | OutputChannel, workspace | Logging, file system |
   | ClineProvider.ts | WebviewView, commands | UI abstraction |
   | Tools/ | Terminal, workspace | Terminal, file ops |

3. **Design Abstraction Interfaces**
   ```typescript
   // Abstract VS Code dependencies
   interface ILogger {
     log(message: string): void;
     error(message: string): void;
   }
   
   interface IFileSystem {
     readFile(path: string): Promise<string>;
     writeFile(path: string, content: string): Promise<void>;
     exists(path: string): Promise<boolean>;
   }
   
   interface ITerminal {
     execute(command: string, cwd?: string): Promise<string>;
   }
   ```

**Validation Commands:**
```bash
# Count VS Code dependencies
grep -r "import.*vscode" src/core/ | wc -l

# Validate abstraction coverage
npm run check-types
```

### Step 1.2: Create Core Package Structure (Day 2)

**Acceptance Criteria:**
- [ ] New `packages/roo-core` package created
- [ ] Basic project structure established
- [ ] TypeScript configuration set up
- [ ] Build system configured

**Implementation:**

1. **Create Package Structure**
   ```
   packages/roo-core/
   ├── package.json
   ├── tsconfig.json
   ├── src/
   │   ├── engine/
   │   ├── tools/
   │   ├── providers/
   │   ├── api/
   │   ├── types/
   │   └── index.ts
   ├── tests/
   └── examples/
   ```

2. **Package Configuration (`package.json`)**
   ```json
   {
     "name": "@roo-code/core",
     "version": "1.0.0",
     "description": "Roo-Code standalone engine",
     "main": "dist/index.js",
     "types": "dist/index.d.ts",
     "scripts": {
       "build": "tsc",
       "dev": "tsc --watch",
       "test": "jest",
       "start": "node dist/index.js"
     },
     "dependencies": {
       "@anthropic-ai/sdk": "^0.20.0",
       "express": "^4.18.0",
       "ws": "^8.14.0",
       "uuid": "^9.0.0"
     }
   }
   ```

3. **TypeScript Configuration**
   ```json
   {
     "extends": "../../packages/config-typescript/base.json",
     "compilerOptions": {
       "outDir": "./dist",
       "rootDir": "./src",
       "declaration": true,
       "declarationMap": true
     },
     "include": ["src/**/*"],
     "exclude": ["dist", "node_modules", "**/*.test.ts"]
   }
   ```

### Step 1.3: Extract Task Management (Days 3-4)

**Acceptance Criteria:**
- [ ] Task.ts extracted and abstracted
- [ ] All VS Code dependencies removed
- [ ] Task lifecycle maintained
- [ ] Unit tests passing

**Implementation:**

1. **Create TaskManager.ts**
   ```typescript
   // packages/roo-core/src/engine/TaskManager.ts
   export class TaskManager {
     private activeTasks = new Map<string, Task>();
     
     async createTask(input: string, config: TaskConfig): Promise<Task> {
       const task = new Task(input, config, this.dependencies);
       this.activeTasks.set(task.id, task);
       return task;
     }
     
     async executeTask(taskId: string): Promise<void> {
       const task = this.activeTasks.get(taskId);
       if (!task) throw new Error('Task not found');
       
       await task.execute();
     }
   }
   ```

2. **Abstract Dependencies**
   ```typescript
   // Replace VS Code specific implementations
   interface TaskDependencies {
     logger: ILogger;
     fileSystem: IFileSystem;
     terminal: ITerminal;
     aiProvider: IAIProvider;
   }
   ```

3. **Maintain Tool System**
   - Extract tools from `src/core/tools/`
   - Remove VS Code dependencies
   - Implement abstraction layer

### Step 1.4: Extract Tool System (Days 5-6)

**Acceptance Criteria:**
- [ ] All 20+ tools extracted and abstracted
- [ ] Tool validation system working
- [ ] File operations sandboxed
- [ ] Terminal execution secured

**Priority Tools to Extract:**
1. **File Operations**: `readFileTool`, `writeToFileTool`, `listFilesTool`
2. **Search Tools**: `searchFilesTool`, `codebaseSearchTool`
3. **Edit Tools**: `applyDiffTool`, `searchAndReplaceTool`
4. **Execution**: `executeCommandTool`
5. **Browser**: `browserActionTool`

**Tool Abstraction Pattern:**
```typescript
// packages/roo-core/src/tools/BaseTool.ts
export abstract class BaseTool {
  constructor(protected dependencies: ToolDependencies) {}
  
  abstract execute(params: any): Promise<ToolResult>;
  
  protected validateParams(params: any): void {
    // Parameter validation
  }
  
  protected checkPermissions(action: string): void {
    // Permission checking
  }
}
```

### Step 1.5: Create Basic HTTP API (Days 7-8)

**Acceptance Criteria:**
- [ ] Express server with basic endpoints
- [ ] Task creation and execution via API
- [ ] WebSocket support for real-time updates
- [ ] Basic error handling

**API Endpoints:**
```typescript
// POST /api/v1/sessions - Create new session
// POST /api/v1/sessions/:id/tasks - Create and execute task
// GET /api/v1/sessions/:id/tasks/:taskId - Get task status
// DELETE /api/v1/sessions/:id/tasks/:taskId - Cancel task
// WebSocket /ws - Real-time updates
```

**Basic Server Implementation:**
```typescript
// packages/roo-core/src/api/server.ts
export class RooCodeServer {
  private app = express();
  private taskManager = new TaskManager();
  
  constructor(private config: ServerConfig) {
    this.setupMiddleware();
    this.setupRoutes();
  }
  
  async start(): Promise<void> {
    const port = this.config.port || 3000;
    this.app.listen(port, () => {
      console.log(`Roo-Code server running on port ${port}`);
    });
  }
}
```

### Step 1.6: Validation and Testing (Days 9-10)

**Acceptance Criteria:**
- [ ] All existing functionality working
- [ ] API tests passing
- [ ] Integration tests with example scripts
- [ ] Performance benchmarks established

**Testing Strategy:**

1. **Unit Tests**
   ```bash
   npm run test
   # Should cover:
   # - TaskManager operations
   # - Tool execution
   # - API endpoints
   # - Configuration management
   ```

2. **Integration Tests**
   ```bash
   # Test with existing examples/api-server.ts
   npm run test:integration
   
   # Validate tool execution
   npm run test:tools
   ```

3. **Performance Validation**
   ```bash
   # Benchmark task execution time
   npm run benchmark
   
   # Memory usage analysis
   npm run test:memory
   ```

## File Structure After Extraction

```
packages/roo-core/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts                 # Main export
│   ├── engine/
│   │   ├── RooEngine.ts         # Main engine class
│   │   ├── TaskManager.ts       # Task lifecycle management
│   │   ├── ConfigManager.ts     # Configuration handling
│   │   └── SessionManager.ts    # Session management
│   ├── tools/
│   │   ├── BaseTool.ts         # Abstract base tool
│   │   ├── FileOperationsTool.ts
│   │   ├── SearchTool.ts
│   │   ├── EditTool.ts
│   │   ├── ExecutionTool.ts
│   │   └── BrowserTool.ts
│   ├── providers/
│   │   ├── BaseProvider.ts     # AI provider interface
│   │   ├── AnthropicProvider.ts
│   │   ├── OpenAIProvider.ts
│   │   └── LocalProvider.ts
│   ├── api/
│   │   ├── server.ts           # Express server
│   │   ├── routes/             # API route handlers
│   │   ├── websocket.ts        # WebSocket handling
│   │   └── middleware/         # Auth, validation, etc.
│   └── types/
│       ├── engine.ts           # Engine interfaces
│       ├── tools.ts            # Tool interfaces
│       ├── api.ts              # API types
│       └── config.ts           # Configuration types
├── tests/
│   ├── unit/
│   ├── integration/
│   └── performance/
└── examples/
    ├── basic-usage.ts
    ├── custom-tools.ts
    └── api-client.ts
```

## Validation Checklist

### Core Functionality
- [ ] Task creation and execution
- [ ] All tools working without VS Code
- [ ] AI provider integration
- [ ] Configuration management
- [ ] Error handling and logging

### API Functionality
- [ ] REST endpoints working
- [ ] WebSocket communication
- [ ] Request validation
- [ ] Error responses
- [ ] Rate limiting basics

### Testing
- [ ] Unit test coverage > 80%
- [ ] Integration tests passing
- [ ] Performance benchmarks
- [ ] Memory leak detection
- [ ] Error scenario testing

### Documentation
- [ ] API documentation
- [ ] Usage examples
- [ ] Migration guide
- [ ] Troubleshooting guide

## Next Steps to Phase 2

After successful extraction:
1. **Enhanced API Development** (Phase 2)
2. **Authentication and Authorization**
3. **Production-ready deployment**
4. **Monitoring and logging**

## Troubleshooting

### Common Issues

1. **VS Code Dependency Errors**
   ```bash
   # Find remaining VS Code imports
   grep -r "vscode" packages/roo-core/src/
   ```

2. **Tool Execution Failures**
   ```bash
   # Test individual tools
   npm run test -- --grep "FileOperationsTool"
   ```

3. **API Connection Issues**
   ```bash
   # Check server status
   curl http://localhost:3000/api/v1/health
   ```

---

**Phase 1 Success Criteria**: Standalone Roo-Code engine running independently with basic HTTP API, all tools functional, and validation tests passing.