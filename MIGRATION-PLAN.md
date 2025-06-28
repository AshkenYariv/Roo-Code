# Roo-Code Core Extraction Migration Plan

## 🎯 Phase 1: Core Engine Extraction Overview

This plan outlines the step-by-step migration of Roo-Code from a VS Code extension to a standalone service with API access.

## 📊 Current State Analysis

### ✅ Good News
- **Task.ts** (core engine) has **ZERO** direct VS Code dependencies
- **Well-structured architecture** with clear separation of concerns
- **Existing abstractions** in place for many components
- **Comprehensive tool system** already modular

### ⚠️ Migration Required
- **297 VS Code dependencies** across 131 files
- **UI layer** (ClineProvider, webview) tightly coupled to VS Code
- **Configuration system** using VS Code workspace APIs
- **File operations** using VS Code file system APIs

## 🗺️ Step-by-Step Migration Plan

### Step 1.1: Analyze Dependencies ✅ (Day 1 - CURRENT)
**Status**: COMPLETED
- [x] Complete dependency analysis (297 VS Code references found)
- [x] Dependency matrix created with priority levels
- [x] Abstraction interfaces designed
- [x] Migration strategy documented

**Deliverables**: 
- ✅ `analysis/vscode-deps.txt` 
- ✅ `analysis/dependency-matrix.md`
- ✅ `interfaces/` with all abstraction definitions
- ✅ `MIGRATION-PLAN.md` (this file)

### Step 1.2: Create Core Package Structure (Day 2)
**Goal**: Establish `packages/roo-core` foundation

**Tasks**:
- [ ] Create package structure with TypeScript config
- [ ] Set up build system and dependencies
- [ ] Create placeholder engine classes
- [ ] Implement basic testing framework
- [ ] Validate package compilation and imports

**Acceptance Criteria**:
- Package builds without errors
- Basic test suite runs
- All TypeScript types resolve correctly

### Step 1.3: Extract Task Management (Days 3-4)
**Goal**: Migrate core Task.ts with abstractions

**Tasks**:
- [ ] Copy Task.ts to `packages/roo-core/src/engine/`
- [ ] Implement concrete abstraction providers for Node.js
- [ ] Create TaskManager with dependency injection
- [ ] Migrate task lifecycle and event system
- [ ] Add comprehensive unit tests

**Acceptance Criteria**:
- Task creation and execution working
- All events properly fired
- 90%+ test coverage achieved

### Step 1.4: Extract Tool System (Days 5-6)
**Goal**: Migrate all 20+ tools with security

**Priority Order**:
1. **File Tools**: `readFileTool`, `writeToFileTool`, `listFilesTool`
2. **Search Tools**: `searchFilesTool`, `codebaseSearchTool`
3. **Edit Tools**: `applyDiffTool`, `searchAndReplaceTool`
4. **Execution Tools**: `executeCommandTool`
5. **Browser Tools**: `browserActionTool`

**Tasks per Tool**:
- [ ] Copy tool implementation
- [ ] Replace VS Code APIs with abstractions
- [ ] Add security validation (path traversal, command injection)
- [ ] Implement tool registry system
- [ ] Add unit and integration tests

**Acceptance Criteria**:
- All tools functional without VS Code
- Security validation prevents malicious operations
- Tool execution integrates with TaskManager

### Step 1.5: Create Basic HTTP API (Days 7-8)
**Goal**: Build Express server with WebSocket support

**API Endpoints**:
```
POST /api/v1/sessions          # Create session
POST /api/v1/sessions/:id/tasks # Execute task
GET  /api/v1/sessions/:id/tasks/:taskId # Task status
WebSocket /ws                  # Real-time updates
```

**Tasks**:
- [ ] Set up Express server with middleware
- [ ] Implement session management
- [ ] Add WebSocket for real-time communication
- [ ] Create request validation and error handling
- [ ] Add OpenAPI documentation
- [ ] Implement basic rate limiting

**Acceptance Criteria**:
- All endpoints functional
- WebSocket communication working
- API documentation complete

### Step 1.6: Validation and Testing (Days 9-10)
**Goal**: Comprehensive validation and performance testing

**Testing Strategy**:
- [ ] Unit tests (90%+ coverage)
- [ ] Integration tests (end-to-end workflows)
- [ ] Performance benchmarks vs VS Code extension
- [ ] Security validation
- [ ] Load testing under realistic conditions

**Validation Checklist**:
- [ ] All existing functionality works without VS Code
- [ ] Performance within 10% of original
- [ ] Security sandbox prevents malicious operations
- [ ] API documentation complete and accurate
- [ ] Migration guide created

## 🏗️ Implementation Strategy

### Dependency Injection Architecture
```typescript
// Core engine with injected dependencies
class RooEngine {
  constructor(private dependencies: IRooCodeDependencies) {
    this.taskManager = new TaskManager(dependencies)
    this.toolRegistry = new ToolRegistry(dependencies)
  }
}

// Dependencies provided by environment
const dependencies: IRooCodeDependencies = {
  fileSystem: new NodeFileSystem(),
  logger: new ConsoleLogger(),
  workspace: new NodeWorkspace(workspacePath),
  notification: new ConsoleNotification(),
  systemInfo: new NodeSystemInfo()
}
```

### Abstraction Implementation Strategy
1. **Interface-First**: Design interfaces before implementation
2. **Gradual Migration**: Migrate one component at a time
3. **Backwards Compatibility**: Keep VS Code layer working during migration
4. **Testing**: Comprehensive testing at each step

### Tool Migration Pattern
```typescript
// Before (VS Code dependent)
import * as vscode from 'vscode'

export async function writeToFileTool(path: string, content: string) {
  await vscode.workspace.fs.writeFile(vscode.Uri.file(path), content)
}

// After (Abstracted)
import { IRooCodeDependencies } from '../interfaces'

export class WriteToFileTool extends BaseTool {
  constructor(private deps: IRooCodeDependencies) { super() }
  
  async execute(params: { path: string, content: string }) {
    await this.deps.fileSystem.writeFile(params.path, params.content)
  }
}
```

## 🔒 Security Considerations

### File System Security
- **Path traversal protection**: Validate all file paths
- **Workspace sandboxing**: Restrict access to workspace folders only
- **Permission validation**: Check file permissions before operations

### Command Execution Security
- **Command whitelist**: Only allow approved commands
- **Argument sanitization**: Prevent command injection
- **Timeout limits**: Prevent long-running processes

### API Security
- **Input validation**: Validate all API inputs
- **Rate limiting**: Prevent abuse
- **Authentication**: Basic API key or token auth

## 📈 Performance Targets

| Metric | Current (VS Code) | Target (Standalone) | Max Acceptable |
|--------|------------------|---------------------|----------------|
| Task Creation | ~50ms | <75ms | <100ms |
| File Read/Write | ~10ms | <15ms | <25ms |
| Tool Execution | ~100ms | <150ms | <200ms |
| API Response | N/A | <100ms | <200ms |
| Memory Usage | ~200MB | <300MB | <500MB |

## 🧪 Testing Strategy

### Unit Testing (90% coverage target)
- All engine components
- Individual tools
- API endpoints
- Abstraction implementations

### Integration Testing
- End-to-end task execution
- Tool interaction workflows
- API client workflows
- WebSocket communication

### Performance Testing
- Load testing with concurrent requests
- Memory leak detection
- Long-running stability tests
- Benchmark against VS Code extension

### Security Testing
- Path traversal attempts
- Command injection attempts
- Input validation testing
- Rate limiting validation

## 🚀 Success Criteria

### Phase 1 Completion Criteria
- [ ] ✅ Standalone Roo-Code engine running independently
- [ ] ✅ All 20+ tools functional without VS Code
- [ ] ✅ Basic HTTP API with core endpoints
- [ ] ✅ WebSocket real-time communication
- [ ] ✅ 90%+ test coverage achieved
- [ ] ✅ Performance within acceptable limits
- [ ] ✅ Security validation passed
- [ ] ✅ API documentation complete

### Quality Gates
- **Zero VS Code imports** in core engine
- **All tests passing** including integration tests
- **Performance benchmarks** meeting targets
- **Security review** completed and passed
- **Documentation** complete for Phase 2 handoff

## ➡️ Phase 2 Preparation

After Phase 1 completion, the following will be ready for Phase 2:
- **Stable core engine** proven in production conditions
- **Comprehensive API** ready for enhancement
- **Testing infrastructure** for continuous validation
- **Performance baselines** for optimization
- **Security framework** for production hardening

---

**Phase 1 Timeline**: 10 days (2 weeks)  
**Phase 1 Outcome**: Production-ready standalone Roo-Code engine with basic API 