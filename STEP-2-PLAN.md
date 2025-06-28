# Step 1.2: Create Core Package Structure (Day 2)

## 🎯 Objective
Create the foundation `packages/roo-core` package with proper project structure, TypeScript configuration, and build system to house the extracted Roo-Code engine.

## 📋 Acceptance Criteria
- [ ] New `packages/roo-core` package created
- [ ] Basic project structure established
- [ ] TypeScript configuration set up
- [ ] Build system configured
- [ ] Package dependencies defined

## 🔧 Implementation Tasks

### Task 1.2.1: Create Package Structure
```bash
# Create the package directory structure
mkdir -p packages/roo-core/src/{engine,tools,providers,api,types}
mkdir -p packages/roo-core/{tests,examples}
mkdir -p packages/roo-core/src/tools/{file,search,edit,execution,browser}
```

**Target Structure:**
```
packages/roo-core/
├── package.json              # Package configuration
├── tsconfig.json             # TypeScript config
├── README.md                 # Package documentation
├── CHANGELOG.md              # Version history
├── src/
│   ├── index.ts              # Main export file
│   ├── engine/               # Core engine components
│   │   ├── RooEngine.ts      # Main engine class
│   │   ├── TaskManager.ts    # Task lifecycle
│   │   ├── ConfigManager.ts  # Configuration
│   │   └── SessionManager.ts # Session handling
│   ├── tools/                # Tool implementations
│   │   ├── BaseTool.ts       # Abstract base
│   │   ├── file/             # File operations
│   │   ├── search/           # Search tools
│   │   ├── edit/             # Edit tools
│   │   ├── execution/        # Command execution
│   │   └── browser/          # Browser automation
│   ├── providers/            # AI provider integrations
│   │   ├── BaseProvider.ts   # Provider interface
│   │   ├── AnthropicProvider.ts
│   │   ├── OpenAIProvider.ts
│   │   └── index.ts
│   ├── api/                  # HTTP API server
│   │   ├── server.ts         # Express server
│   │   ├── routes/           # Route handlers
│   │   ├── middleware/       # Auth, validation
│   │   └── websocket.ts      # WebSocket support
│   └── types/                # Type definitions
│       ├── engine.ts         # Engine interfaces
│       ├── tools.ts          # Tool interfaces
│       ├── api.ts            # API types
│       └── config.ts         # Configuration types
├── tests/
│   ├── unit/                 # Unit tests
│   ├── integration/          # Integration tests
│   └── __mocks__/            # Test mocks
└── examples/
    ├── basic-usage.ts        # Basic example
    ├── custom-tools.ts       # Custom tool example
    └── api-client.ts         # API usage example
```

### Task 1.2.2: Package Configuration

**`package.json`:**
```json
{
  "name": "@roo-code/core",
  "version": "1.0.0-alpha.1",
  "description": "Roo-Code standalone engine",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "files": [
    "dist",
    "README.md",
    "CHANGELOG.md"
  ],
  "scripts": {
    "build": "tsc",
    "build:watch": "tsc --watch",
    "dev": "tsx src/index.ts",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint src/**/*.ts",
    "lint:fix": "eslint src/**/*.ts --fix",
    "clean": "rimraf dist",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "@anthropic-ai/sdk": "^0.20.0",
    "express": "^4.18.0",
    "ws": "^8.14.0",
    "uuid": "^9.0.0",
    "zod": "^3.22.0",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "rate-limiter-flexible": "^3.0.0"
  },
  "devDependencies": {
    "@types/express": "^4.17.0",
    "@types/ws": "^8.5.0",
    "@types/uuid": "^9.0.0",
    "@types/cors": "^2.8.0",
    "tsx": "^3.14.0",
    "rimraf": "^5.0.0"
  },
  "engines": {
    "node": ">=18.0.0"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/AshkenYariv/Roo-Code.git",
    "directory": "packages/roo-core"
  }
}
```

### Task 1.2.3: TypeScript Configuration

**`tsconfig.json`:**
```json
{
  "extends": "../../packages/config-typescript/base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "module": "CommonJS",
    "target": "ES2020",
    "lib": ["ES2020"],
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true,
    "resolveJsonModule": true
  },
  "include": [
    "src/**/*"
  ],
  "exclude": [
    "dist",
    "node_modules",
    "**/*.test.ts",
    "**/*.spec.ts"
  ]
}
```

### Task 1.2.4: Create Base Files

**`src/index.ts` (Main Export):**
```typescript
// Core Engine
export { RooEngine } from './engine/RooEngine';
export { TaskManager } from './engine/TaskManager';
export { ConfigManager } from './engine/ConfigManager';
export { SessionManager } from './engine/SessionManager';

// Tools
export { BaseTool } from './tools/BaseTool';
export * from './tools';

// Providers
export { BaseProvider } from './providers/BaseProvider';
export * from './providers';

// API Server
export { RooCodeServer } from './api/server';

// Types
export * from './types';
```

**`src/engine/RooEngine.ts` (Placeholder):**
```typescript
import { TaskManager } from './TaskManager';
import { ConfigManager } from './ConfigManager';
import { SessionManager } from './SessionManager';

export class RooEngine {
  private taskManager: TaskManager;
  private configManager: ConfigManager;
  private sessionManager: SessionManager;

  constructor() {
    // Implementation will be added in Step 1.3
    this.configManager = new ConfigManager();
    this.taskManager = new TaskManager();
    this.sessionManager = new SessionManager();
  }

  async initialize(): Promise<void> {
    // TODO: Implement in Step 1.3
  }

  async shutdown(): Promise<void> {
    // TODO: Implement in Step 1.3
  }
}
```

### Task 1.2.5: Testing Setup

**`tests/jest.config.js`:**
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/index.ts'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html']
};
```

**Basic Test File (`tests/unit/engine.test.ts`):**
```typescript
import { RooEngine } from '../../src/engine/RooEngine';

describe('RooEngine', () => {
  let engine: RooEngine;

  beforeEach(() => {
    engine = new RooEngine();
  });

  it('should initialize successfully', async () => {
    await expect(engine.initialize()).resolves.not.toThrow();
  });

  it('should shutdown successfully', async () => {
    await expect(engine.shutdown()).resolves.not.toThrow();
  });
});
```

## 📊 Deliverables

### Required Files
1. ✅ Complete package.json with all dependencies
2. ✅ TypeScript configuration (tsconfig.json)
3. ✅ Project structure with all directories
4. ✅ Main export file (src/index.ts)
5. ✅ Placeholder engine classes
6. ✅ Testing framework setup
7. ✅ Build and development scripts

### Validation Commands
```bash
# Install dependencies
cd packages/roo-core && npm install

# Build package
npm run build

# Run tests
npm test

# Lint code
npm run lint

# Check TypeScript compilation
npx tsc --noEmit
```

## 🚦 Success Criteria
- Package builds successfully without errors
- All TypeScript types resolve correctly  
- Test framework runs (even with placeholder tests)
- Package can be imported by other packages
- Build outputs proper JavaScript and declaration files
- Development workflow is functional

## 📁 Expected Outputs
```
packages/roo-core/
├── dist/                     # Built JavaScript
│   ├── index.js
│   ├── index.d.ts
│   └── [compiled structure]
├── node_modules/             # Dependencies
├── coverage/                 # Test coverage reports
└── [source structure]        # All src files
```

## ⚠️ Prerequisites
- Step 1.1 completed (dependency analysis)
- Workspaces properly configured in root package.json
- TypeScript config packages available

## ⚠️ Risk Assessment  
- **Low**: Standard package setup with known dependencies
- **Medium**: TypeScript configuration complexity
- **High**: Ensuring proper workspace integration

## ➡️ Next Step Preparation
- Package structure ready for Task extraction in Step 1.3
- Build system supports incremental development
- Testing framework ready for TDD approach 