# Step 1.3: Extract Task Management (Days 3-4)

## 🎯 Objective
Extract and abstract the core Task.ts functionality from VS Code dependencies, implementing proper task lifecycle management in the standalone `packages/roo-core` package.

## 📋 Acceptance Criteria
- [ ] Task.ts extracted and abstracted from VS Code
- [ ] All VS Code dependencies removed and abstracted
- [ ] Task lifecycle maintained (create → execute → complete/error)
- [ ] Unit tests passing with 80%+ coverage
- [ ] TaskManager integration working

## 🔧 Implementation Tasks

### Task 1.3.1: Analyze Current Task Implementation

**Current Task Dependencies (to be abstracted):**
```typescript
// VS Code dependencies in src/shared/Task.ts
import * as vscode from 'vscode'
import { OutputChannel } from 'vscode'
import { workspace } from 'vscode'

// Components to extract:
- Task lifecycle management
- Output handling (OutputChannel)
- Configuration access (workspace.getConfiguration)
- File system operations (workspace.fs)
- Progress reporting (Progress API)
```

**Analysis Commands:**
```bash
# Find Task.ts and related files
find src -name "*Task*" -type f

# Analyze Task dependencies
grep -r "Task" src/shared/ src/core/

# Count VS Code usages in Task
grep -c "vscode\." src/shared/Task.ts
```

### Task 1.3.2: Create Abstracted TaskManager

**`packages/roo-core/src/engine/TaskManager.ts`:**
```typescript
import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import { Task } from './Task';
import { TaskConfig, TaskStatus, TaskResult } from '../types/engine';
import { ILogger, IFileSystem, IAIProvider } from '../types/interfaces';

export class TaskManager extends EventEmitter {
  private tasks = new Map<string, Task>();
  private activeTask: Task | null = null;

  constructor(
    private dependencies: {
      logger: ILogger;
      fileSystem: IFileSystem;
      aiProvider: IAIProvider;
    }
  ) {
    super();
  }

  async createTask(input: string, config: TaskConfig): Promise<Task> {
    const taskId = uuidv4();
    const task = new Task(taskId, input, config, this.dependencies);
    
    this.tasks.set(taskId, task);
    this.emit('taskCreated', task);
    
    return task;
  }

  async executeTask(taskId: string): Promise<TaskResult> {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }

    if (this.activeTask) {
      throw new Error('Another task is already running');
    }

    try {
      this.activeTask = task;
      this.emit('taskStarted', task);
      
      const result = await task.execute();
      
      this.emit('taskCompleted', task, result);
      return result;
    } catch (error) {
      this.emit('taskError', task, error);
      throw error;
    } finally {
      this.activeTask = null;
    }
  }

  async cancelTask(taskId: string): Promise<void> {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }

    await task.cancel();
    this.emit('taskCancelled', task);
  }

  getTask(taskId: string): Task | undefined {
    return this.tasks.get(taskId);
  }

  getAllTasks(): Task[] {
    return Array.from(this.tasks.values());
  }

  getActiveTask(): Task | null {
    return this.activeTask;
  }
}
```

### Task 1.3.3: Extract and Abstract Task Class

**`packages/roo-core/src/engine/Task.ts`:**
```typescript
import { EventEmitter } from 'events';
import { TaskConfig, TaskStatus, TaskResult, SubTask } from '../types/engine';
import { ILogger, IFileSystem, IAIProvider } from '../types/interfaces';

export class Task extends EventEmitter {
  public readonly id: string;
  public readonly input: string;
  public readonly config: TaskConfig;
  public status: TaskStatus = 'pending';
  public createdAt: Date = new Date();
  public startedAt?: Date;
  public completedAt?: Date;
  public result?: TaskResult;
  public error?: Error;
  public subTasks: SubTask[] = [];

  private cancelled = false;

  constructor(
    id: string,
    input: string,
    config: TaskConfig,
    private dependencies: {
      logger: ILogger;
      fileSystem: IFileSystem;
      aiProvider: IAIProvider;
    }
  ) {
    super();
    this.id = id;
    this.input = input;
    this.config = config;
  }

  async execute(): Promise<TaskResult> {
    if (this.status !== 'pending') {
      throw new Error(`Task ${this.id} is not in pending state`);
    }

    try {
      this.status = 'running';
      this.startedAt = new Date();
      this.emit('statusChanged', this.status);

      this.dependencies.logger.log(`Starting task ${this.id}: ${this.input}`);

      // Core task execution logic (extracted from original Task.ts)
      const result = await this.executeTaskLogic();

      this.status = 'completed';
      this.completedAt = new Date();
      this.result = result;
      this.emit('statusChanged', this.status);
      this.emit('completed', result);

      return result;
    } catch (error) {
      this.status = 'error';
      this.completedAt = new Date();
      this.error = error as Error;
      this.emit('statusChanged', this.status);
      this.emit('error', error);
      throw error;
    }
  }

  async cancel(): Promise<void> {
    if (this.status === 'completed' || this.status === 'error') {
      return;
    }

    this.cancelled = true;
    this.status = 'cancelled';
    this.completedAt = new Date();
    this.emit('statusChanged', this.status);
    this.emit('cancelled');
  }

  private async executeTaskLogic(): Promise<TaskResult> {
    // TODO: Extract actual task execution logic from original Task.ts
    // This will include:
    // - AI provider interaction
    // - Tool execution coordination
    // - Sub-task management
    // - Progress tracking

    // Placeholder implementation
    const response = await this.dependencies.aiProvider.complete(this.input);
    
    return {
      success: true,
      output: response,
      tokensUsed: 0, // TODO: Get from AI provider
      duration: Date.now() - (this.startedAt?.getTime() || 0)
    };
  }

  private checkCancellation(): void {
    if (this.cancelled) {
      throw new Error('Task was cancelled');
    }
  }
}
```

### Task 1.3.4: Define Task-Related Types

**`packages/roo-core/src/types/engine.ts`:**
```typescript
export interface TaskConfig {
  maxTokens?: number;
  temperature?: number;
  provider?: string;
  model?: string;
  systemPrompt?: string;
  workspaceRoot?: string;
  allowedTools?: string[];
}

export type TaskStatus = 'pending' | 'running' | 'completed' | 'error' | 'cancelled';

export interface TaskResult {
  success: boolean;
  output: string;
  tokensUsed: number;
  duration: number;
  error?: string;
}

export interface SubTask {
  id: string;
  description: string;
  status: TaskStatus;
  result?: any;
}

export interface TaskEvent {
  type: 'created' | 'started' | 'progress' | 'completed' | 'error' | 'cancelled';
  taskId: string;
  timestamp: Date;
  data?: any;
}
```

**`packages/roo-core/src/types/interfaces.ts`:**
```typescript
export interface ILogger {
  log(message: string): void;
  error(message: string | Error): void;
  warn(message: string): void;
  info(message: string): void;
  debug(message: string): void;
}

export interface IFileSystem {
  readFile(path: string): Promise<string>;
  writeFile(path: string, content: string): Promise<void>;
  exists(path: string): Promise<boolean>;
  mkdir(path: string, recursive?: boolean): Promise<void>;
  readdir(path: string): Promise<string[]>;
  stat(path: string): Promise<{ isDirectory(): boolean; isFile(): boolean }>;
}

export interface IAIProvider {
  complete(prompt: string, options?: any): Promise<string>;
  stream(prompt: string, options?: any): AsyncIterable<string>;
  getModelInfo(): { name: string; maxTokens: number };
}
```

### Task 1.3.5: Migration from Original Task

**Migration Steps:**
1. **Copy Core Logic**: Extract the main task execution flow
2. **Replace VS Code APIs**: Use abstracted interfaces instead
3. **Maintain Event System**: Keep the same event-based architecture
4. **Preserve Sub-task Logic**: Keep the hierarchical task structure
5. **Update Error Handling**: Ensure proper error propagation

**Key Changes:**
```typescript
// BEFORE (VS Code dependent)
import * as vscode from 'vscode';
this.outputChannel = vscode.window.createOutputChannel('Roo');
const config = vscode.workspace.getConfiguration('roo');

// AFTER (Abstracted)
import { ILogger } from '../types/interfaces';
this.logger = dependencies.logger;
const config = this.config; // Passed via constructor
```

### Task 1.3.6: Unit Testing

**`packages/roo-core/tests/unit/TaskManager.test.ts`:**
```typescript
import { TaskManager } from '../../src/engine/TaskManager';
import { MockLogger, MockFileSystem, MockAIProvider } from '../__mocks__';

describe('TaskManager', () => {
  let taskManager: TaskManager;
  let mockDependencies: any;

  beforeEach(() => {
    mockDependencies = {
      logger: new MockLogger(),
      fileSystem: new MockFileSystem(),
      aiProvider: new MockAIProvider()
    };
    taskManager = new TaskManager(mockDependencies);
  });

  describe('createTask', () => {
    it('should create a new task with unique ID', async () => {
      const task = await taskManager.createTask('test input', {});
      
      expect(task.id).toBeDefined();
      expect(task.input).toBe('test input');
      expect(task.status).toBe('pending');
    });

    it('should emit taskCreated event', async () => {
      const eventSpy = jest.fn();
      taskManager.on('taskCreated', eventSpy);

      const task = await taskManager.createTask('test', {});
      
      expect(eventSpy).toHaveBeenCalledWith(task);
    });
  });

  describe('executeTask', () => {
    it('should execute task and return result', async () => {
      const task = await taskManager.createTask('test', {});
      const result = await taskManager.executeTask(task.id);
      
      expect(result.success).toBe(true);
      expect(task.status).toBe('completed');
    });

    it('should prevent concurrent task execution', async () => {
      const task1 = await taskManager.createTask('test1', {});
      const task2 = await taskManager.createTask('test2', {});
      
      const promise1 = taskManager.executeTask(task1.id);
      
      await expect(taskManager.executeTask(task2.id))
        .rejects.toThrow('Another task is already running');
    });
  });
});
```

## 📊 Deliverables

### Required Files
1. ✅ `TaskManager.ts` - Main task orchestration
2. ✅ `Task.ts` - Individual task implementation  
3. ✅ `types/engine.ts` - Task-related type definitions
4. ✅ `types/interfaces.ts` - Abstraction interfaces
5. ✅ Comprehensive unit tests (80%+ coverage)
6. ✅ Mock implementations for testing
7. ✅ Integration with existing package structure

### Validation Commands
```bash
# Build and test
cd packages/roo-core
npm run build
npm test

# Test coverage
npm run test:coverage

# Type checking
npx tsc --noEmit

# Integration test with original Task
npm run test:integration
```

## 🚦 Success Criteria
- ✅ All VS Code dependencies removed from task logic
- ✅ Task lifecycle works identically to original
- ✅ Event system maintains compatibility
- ✅ Unit tests achieve 80%+ coverage
- ✅ Integration tests pass
- ✅ TypeScript compiles without errors
- ✅ No runtime errors during basic task execution

## ⚠️ Risk Assessment
- **High**: Complex coupling with AI providers and tool system
- **Medium**: Event system compatibility with original implementation
- **Medium**: Performance impact of abstraction layer
- **Low**: Basic task lifecycle management

## 📁 Expected File Changes
```
packages/roo-core/src/
├── engine/
│   ├── TaskManager.ts        # ✅ Main orchestrator
│   ├── Task.ts              # ✅ Individual task
│   └── TaskFactory.ts       # ✅ Task creation
├── types/
│   ├── engine.ts            # ✅ Task types
│   └── interfaces.ts        # ✅ Abstractions
└── tests/
    ├── unit/
    │   ├── TaskManager.test.ts
    │   └── Task.test.ts
    └── __mocks__/
        ├── MockLogger.ts
        ├── MockFileSystem.ts
        └── MockAIProvider.ts
```

## ➡️ Next Step Preparation
- Task system ready for tool integration (Step 1.4)
- Event system compatible with tool execution
- Abstraction interfaces support tool requirements
- Testing framework supports tool validation

## 🔄 Migration Validation
```bash
# Compare with original Task behavior
npm run compare:task-behavior

# Validate event compatibility
npm run test:events

# Performance benchmarks
npm run benchmark:task-execution
``` 