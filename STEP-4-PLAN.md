# Step 1.4: Extract Tool System (Days 5-6)

## 🎯 Objective
Extract and abstract all 20+ tools from VS Code dependencies into the standalone package, implementing a secure and sandboxed tool execution system.

## 📋 Acceptance Criteria
- [ ] All 20+ tools extracted and abstracted
- [ ] Tool validation system working
- [ ] File operations sandboxed 
- [ ] Terminal execution secured
- [ ] Tool execution integrated with TaskManager

## 🔧 Priority Tools to Extract

### Tier 1 (Critical - Day 5)
1. **`readFileTool`** - Read file contents
2. **`writeToFileTool`** - Write file contents  
3. **`listFilesTool`** - List directory contents
4. **`executeCommandTool`** - Terminal command execution
5. **`searchFilesTool`** - Search within files

### Tier 2 (Important - Day 6)
6. **`codebaseSearchTool`** - Search across codebase
7. **`applyDiffTool`** - Apply code diffs
8. **`searchAndReplaceTool`** - Find and replace text
9. **`browserActionTool`** - Browser automation
10. **`inspectSiteTool`** - Website inspection

## 🏗️ Tool Architecture

### Base Tool System
```typescript
// packages/roo-core/src/tools/BaseTool.ts
export abstract class BaseTool {
  constructor(protected dependencies: ToolDependencies) {}
  
  abstract readonly name: string;
  abstract readonly description: string;
  abstract readonly schema: ToolSchema;
  
  abstract execute(params: any): Promise<ToolResult>;
  
  protected validateParams(params: any): void {
    // JSON schema validation
  }
  
  protected checkPermissions(action: string): void {
    // Security validation
  }
  
  protected sanitizePath(path: string): string {
    // Path traversal protection
  }
}
```

### Tool Registry
```typescript
// packages/roo-core/src/tools/ToolRegistry.ts
export class ToolRegistry {
  private tools = new Map<string, BaseTool>();
  
  register(tool: BaseTool): void {
    this.tools.set(tool.name, tool);
  }
  
  get(name: string): BaseTool | undefined {
    return this.tools.get(name);
  }
  
  getAllTools(): BaseTool[] {
    return Array.from(this.tools.values());
  }
  
  async execute(name: string, params: any): Promise<ToolResult> {
    const tool = this.get(name);
    if (!tool) throw new Error(`Tool ${name} not found`);
    
    return await tool.execute(params);
  }
}
```

## 📊 Deliverables

### Required Files
1. ✅ `BaseTool.ts` - Abstract base class
2. ✅ `ToolRegistry.ts` - Tool management
3. ✅ All 20+ tool implementations
4. ✅ Security and validation layer
5. ✅ Comprehensive tool tests
6. ✅ Tool schema definitions

### Validation Commands
```bash
# Test all tools
cd packages/roo-core
npm run test:tools

# Security validation
npm run test:security

# Tool registry integration
npm run test:integration
```

## 🚦 Success Criteria
- All tools work without VS Code dependencies
- Security sandbox prevents malicious operations
- Tool execution integrates with TaskManager
- Performance matches original implementation
- 90%+ test coverage for all tools

## ➡️ Next Step Preparation
Tool system ready for HTTP API integration (Step 1.5) 