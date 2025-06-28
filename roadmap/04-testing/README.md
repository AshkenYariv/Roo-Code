# Phase 4: Testing Strategy (Weeks 9-10)

## Overview

Implement a comprehensive testing framework that ensures reliability, security, and performance across all components of the Roo-Code deployment. This phase establishes testing from day one with continuous validation throughout development.

## Goals

- ✅ Comprehensive test coverage (>85% code coverage)
- ✅ Automated testing pipeline with CI/CD integration
- ✅ Performance and load testing validation
- ✅ Security testing and vulnerability assessment
- ✅ End-to-end user journey validation
- ✅ Internal validation commands for development

## Testing Pyramid

```
                    ╭─────────────╮
                   ╱ E2E Tests     ╲
                  ╱  (User Flows)  ╲
                 ╰─────────────────╯
                ╭───────────────────╮
               ╱ Integration Tests   ╲
              ╱   (API + Services)   ╲
             ╰─────────────────────────╯
           ╭─────────────────────────────╮
          ╱        Unit Tests            ╲
         ╱   (Functions + Components)     ╲
        ╰─────────────────────────────────╯
```

## Testing Architecture

### Core Testing Tools

| Layer | Technology | Purpose |
|-------|------------|---------|
| Unit Tests | Jest + Testing Library | Component and function testing |
| Integration Tests | Supertest + Testcontainers | API and service testing |
| E2E Tests | Playwright | Full user journey testing |
| Performance | Artillery + K6 | Load and stress testing |
| Security | OWASP ZAP + Snyk | Vulnerability scanning |
| Contract Tests | Pact | API contract validation |

### Test Environment Matrix

| Environment | Purpose | Data | Automation |
|-------------|---------|------|------------|
| Unit | Function validation | Mock data | Always |
| Integration | Service interaction | Test database | On commit |
| Staging | Pre-production validation | Sanitized production data | On deployment |
| Production | Health monitoring | Real data | Continuous |

## Step-by-Step Implementation

### Step 4.1: Unit Testing Framework (Days 1-2)

**Acceptance Criteria:**
- [ ] Jest configured for all packages
- [ ] Testing utilities established
- [ ] Mock services implemented
- [ ] Code coverage reporting
- [ ] Test data factories

**Implementation:**

1. **Jest Configuration**
   ```typescript
   // jest.config.js
   module.exports = {
     preset: 'ts-jest',
     testEnvironment: 'node',
     roots: ['<rootDir>/src', '<rootDir>/tests'],
     testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
     collectCoverageFrom: [
       'src/**/*.{ts,tsx}',
       '!src/**/*.d.ts',
       '!src/**/*.test.ts'
     ],
     coverageReporters: ['text', 'lcov', 'html'],
     coverageThreshold: {
       global: {
         branches: 80,
         functions: 80,
         lines: 80,
         statements: 80
       }
     },
     setupFilesAfterEnv: ['<rootDir>/tests/setup.ts']
   };
   ```

2. **Test Utilities**
   ```typescript
   // tests/utils/test-utils.ts
   export class TestUtils {
     static createMockUser(overrides?: Partial<User>): User {
       return {
         id: 'user-123',
         email: 'test@example.com',
         name: 'Test User',
         provider: 'local',
         roles: ['user'],
         createdAt: new Date().toISOString(),
         ...overrides
       };
     }
     
     static createMockSession(overrides?: Partial<Session>): Session {
       return {
         id: 'session-123',
         userId: 'user-123',
         name: 'Test Session',
         workspaceId: 'workspace-123',
         config: {
           provider: 'anthropic',
           model: 'claude-3-sonnet',
           mode: 'code',
           allowedCommands: ['npm', 'git']
         },
         status: 'active',
         createdAt: new Date().toISOString(),
         updatedAt: new Date().toISOString(),
         ...overrides
       };
     }
   }
   ```

3. **Mock Services**
   ```typescript
   // tests/mocks/api-client.mock.ts
   export class MockAPIClient {
     sessions = {
       create: jest.fn().mockResolvedValue(TestUtils.createMockSession()),
       get: jest.fn().mockResolvedValue(TestUtils.createMockSession()),
       list: jest.fn().mockResolvedValue([TestUtils.createMockSession()]),
       delete: jest.fn().mockResolvedValue(undefined)
     };
     
     tasks = {
       create: jest.fn().mockResolvedValue(TestUtils.createMockTask()),
       get: jest.fn().mockResolvedValue(TestUtils.createMockTask()),
       cancel: jest.fn().mockResolvedValue(undefined)
     };
   }
   ```

**Core Engine Unit Tests:**
```typescript
// packages/roo-core/src/engine/__tests__/TaskManager.test.ts
describe('TaskManager', () => {
  let taskManager: TaskManager;
  let mockDependencies: MockTaskDependencies;
  
  beforeEach(() => {
    mockDependencies = new MockTaskDependencies();
    taskManager = new TaskManager(mockDependencies);
  });
  
  describe('createTask', () => {
    it('should create task with valid input', async () => {
      const input = 'Create a React component';
      const config = TestUtils.createMockTaskConfig();
      
      const task = await taskManager.createTask(input, config);
      
      expect(task.id).toBeDefined();
      expect(task.input).toBe(input);
      expect(task.status).toBe('pending');
    });
    
    it('should validate input length', async () => {
      const longInput = 'a'.repeat(50000);
      const config = TestUtils.createMockTaskConfig();
      
      await expect(taskManager.createTask(longInput, config))
        .rejects.toThrow('Input too long');
    });
  });
  
  describe('executeTask', () => {
    it('should execute task successfully', async () => {
      const task = await taskManager.createTask('test input', {});
      
      await taskManager.executeTask(task.id);
      
      expect(mockDependencies.aiProvider.processInput).toHaveBeenCalled();
      expect(task.status).toBe('completed');
    });
  });
});
```

### Step 4.2: Integration Testing (Days 3-4)

**Acceptance Criteria:**
- [ ] API integration tests for all endpoints
- [ ] Database integration tests
- [ ] WebSocket integration tests
- [ ] Tool execution integration tests
- [ ] Authentication flow tests

**Implementation:**

1. **API Integration Tests**
   ```typescript
   // tests/integration/api/sessions.test.ts
   describe('Sessions API Integration', () => {
     let app: Express;
     let testUser: User;
     let authToken: string;
     
     beforeAll(async () => {
       app = await createTestApp();
       testUser = await createTestUser();
       authToken = await getAuthToken(testUser);
     });
     
     afterAll(async () => {
       await cleanupTestData();
     });
     
     describe('POST /api/v1/sessions', () => {
       it('should create session with valid config', async () => {
         const sessionConfig = {
           name: 'Test Session',
           config: {
             provider: 'anthropic',
             model: 'claude-3-sonnet',
             mode: 'code'
           }
         };
         
         const response = await request(app)
           .post('/api/v1/sessions')
           .set('Authorization', `Bearer ${authToken}`)
           .send(sessionConfig)
           .expect(201);
         
         expect(response.body.session.id).toBeDefined();
         expect(response.body.session.name).toBe(sessionConfig.name);
         expect(response.body.workspace).toBeDefined();
       });
       
       it('should reject invalid provider', async () => {
         const invalidConfig = {
           name: 'Test Session',
           config: {
             provider: 'invalid-provider',
             model: 'claude-3-sonnet'
           }
         };
         
         await request(app)
           .post('/api/v1/sessions')
           .set('Authorization', `Bearer ${authToken}`)
           .send(invalidConfig)
           .expect(400);
       });
     });
   });
   ```

2. **Database Integration Tests**
   ```typescript
   // tests/integration/database/user-repository.test.ts
   describe('UserRepository Integration', () => {
     let db: Database;
     let userRepo: UserRepository;
     
     beforeAll(async () => {
       db = await createTestDatabase();
       userRepo = new UserRepository(db);
     });
     
     afterAll(async () => {
       await db.close();
     });
     
     beforeEach(async () => {
       await db.query('TRUNCATE users CASCADE');
     });
     
     it('should create and retrieve user', async () => {
       const userData = TestUtils.createMockUser();
       
       const createdUser = await userRepo.create(userData);
       const retrievedUser = await userRepo.findById(createdUser.id);
       
       expect(retrievedUser).toEqual(createdUser);
     });
     
     it('should enforce unique email constraint', async () => {
       const userData = TestUtils.createMockUser();
       
       await userRepo.create(userData);
       
       await expect(userRepo.create(userData))
         .rejects.toThrow('Email already exists');
     });
   });
   ```

3. **WebSocket Integration Tests**
   ```typescript
   // tests/integration/websocket/task-events.test.ts
   describe('WebSocket Task Events', () => {
     let server: Server;
     let client: Socket;
     let testSession: Session;
     
     beforeAll(async () => {
       server = await createTestServer();
       testSession = await createTestSession();
     });
     
     beforeEach(() => {
       client = io('http://localhost:3001', {
         auth: {
           token: testAuthToken,
           sessionId: testSession.id
         }
       });
     });
     
     afterEach(() => {
       client.close();
     });
     
     it('should receive task progress events', (done) => {
       client.on('task.progress', (data) => {
         expect(data.taskId).toBeDefined();
         expect(data.progress).toBeGreaterThan(0);
         expect(data.step).toBeDefined();
         done();
       });
       
       // Trigger task creation
       client.emit('task.create', {
         input: 'Create a simple function'
       });
     });
     
     it('should handle approval requests', (done) => {
       client.on('approval.required', (data) => {
         expect(data.action).toBeDefined();
         expect(data.description).toBeDefined();
         
         // Send approval
         client.emit('approval.response', {
           taskId: data.taskId,
           approved: true
         });
         
         done();
       });
       
       // Trigger task that requires approval
       client.emit('task.create', {
         input: 'Delete all files in the project'
       });
     });
   });
   ```

### Step 4.3: End-to-End Testing (Days 5-6)

**Acceptance Criteria:**
- [ ] Complete user journey tests
- [ ] Cross-browser compatibility
- [ ] Mobile responsiveness validation
- [ ] Real-time communication tests
- [ ] File operations validation

**Implementation:**

1. **Playwright E2E Setup**
   ```typescript
   // playwright.config.ts
   import { defineConfig } from '@playwright/test';
   
   export default defineConfig({
     testDir: './tests/e2e',
     fullyParallel: true,
     forbidOnly: !!process.env.CI,
     retries: process.env.CI ? 2 : 0,
     workers: process.env.CI ? 1 : undefined,
     reporter: 'html',
     use: {
       baseURL: 'http://localhost:3000',
       trace: 'on-first-retry',
       screenshot: 'only-on-failure'
     },
     projects: [
       {
         name: 'chromium',
         use: { ...devices['Desktop Chrome'] }
       },
       {
         name: 'firefox',
         use: { ...devices['Desktop Firefox'] }
       },
       {
         name: 'webkit',
         use: { ...devices['Desktop Safari'] }
       },
       {
         name: 'Mobile Chrome',
         use: { ...devices['Pixel 5'] }
       }
     ]
   });
   ```

2. **Complete User Journey Tests**
   ```typescript
   // tests/e2e/complete-workflow.spec.ts
   import { test, expect } from '@playwright/test';
   
   test.describe('Complete Roo-Code Workflow', () => {
     test('user can complete full coding session', async ({ page }) => {
       // Login
       await page.goto('/login');
       await page.fill('[data-testid="email"]', 'test@example.com');
       await page.fill('[data-testid="password"]', 'password123');
       await page.click('[data-testid="login-button"]');
       
       await expect(page).toHaveURL('/dashboard');
       
       // Create new session
       await page.click('[data-testid="new-session"]');
       await page.fill('[data-testid="session-name"]', 'E2E Test Session');
       await page.selectOption('[data-testid="provider"]', 'anthropic');
       await page.selectOption('[data-testid="model"]', 'claude-3-sonnet');
       await page.click('[data-testid="create-session"]');
       
       await expect(page.locator('[data-testid="session-created"]')).toBeVisible();
       
       // Send message and wait for response
       await page.fill('[data-testid="chat-input"]', 'Create a simple React component for a todo item');
       await page.click('[data-testid="send-button"]');
       
       // Wait for AI response
       await expect(page.locator('[data-testid="ai-message"]')).toBeVisible({ timeout: 30000 });
       
       // Verify file was created
       await expect(page.locator('[data-testid="file-created"]')).toBeVisible();
       
       // Open file in editor
       await page.click('[data-testid="file-TodoItem.tsx"]');
       await expect(page.locator('[data-testid="code-editor"]')).toBeVisible();
       
       // Verify file content
       const editorContent = await page.locator('[data-testid="editor-content"]').textContent();
       expect(editorContent).toContain('TodoItem');
       expect(editorContent).toContain('React');
       
       // Test terminal functionality
       await page.click('[data-testid="terminal-tab"]');
       await page.fill('[data-testid="terminal-input"]', 'npm --version');
       await page.press('[data-testid="terminal-input"]', 'Enter');
       
       await expect(page.locator('[data-testid="terminal-output"]')).toContainText(/\d+\.\d+\.\d+/);
       
       // Test real-time updates
       await page.fill('[data-testid="chat-input"]', 'Add TypeScript types to the component');
       await page.click('[data-testid="send-button"]');
       
       // Verify live updates in editor
       await expect(page.locator('[data-testid="file-modified-indicator"]')).toBeVisible();
       
       // Cleanup session
       await page.click('[data-testid="session-menu"]');
       await page.click('[data-testid="delete-session"]');
       await page.click('[data-testid="confirm-delete"]');
       
       await expect(page.locator('[data-testid="session-deleted"]')).toBeVisible();
     });
     
     test('handles approval workflows correctly', async ({ page }) => {
       await page.goto('/dashboard');
       
       // Create session and send dangerous command
       await createTestSession(page);
       await page.fill('[data-testid="chat-input"]', 'Delete all files in the src directory');
       await page.click('[data-testid="send-button"]');
       
       // Wait for approval request
       await expect(page.locator('[data-testid="approval-request"]')).toBeVisible();
       
       // Verify approval details
       await expect(page.locator('[data-testid="approval-action"]')).toContainText('delete');
       await expect(page.locator('[data-testid="approval-files"]')).toContainText('src/');
       
       // Reject approval
       await page.click('[data-testid="reject-approval"]');
       
       // Verify task was cancelled
       await expect(page.locator('[data-testid="task-cancelled"]')).toBeVisible();
     });
   });
   ```

3. **Performance E2E Tests**
   ```typescript
   // tests/e2e/performance.spec.ts
   test('performance benchmarks', async ({ page }) => {
     await page.goto('/dashboard');
     
     // Measure initial load time
     const loadTime = await page.evaluate(() => {
       return performance.timing.loadEventEnd - performance.timing.navigationStart;
     });
     expect(loadTime).toBeLessThan(3000); // < 3 seconds
     
     // Measure chat response time
     const startTime = Date.now();
     await page.fill('[data-testid="chat-input"]', 'Create a simple function');
     await page.click('[data-testid="send-button"]');
     await page.waitForSelector('[data-testid="ai-response"]');
     const responseTime = Date.now() - startTime;
     
     expect(responseTime).toBeLessThan(10000); // < 10 seconds for first response
   });
   ```

### Step 4.4: Performance and Load Testing (Days 7-8)

**Acceptance Criteria:**
- [ ] Load testing with Artillery/K6
- [ ] Performance benchmarks established
- [ ] Stress testing for concurrent users
- [ ] Memory and CPU profiling
- [ ] Database performance validation

**Implementation:**

1. **Artillery Load Testing**
   ```yaml
   # tests/load/api-load-test.yml
   config:
     target: 'http://localhost:3000'
     phases:
       - duration: 60
         arrivalRate: 5
         name: Warm up
       - duration: 120
         arrivalRate: 10
         name: Normal load
       - duration: 60
         arrivalRate: 20
         name: High load
     variables:
       auth_tokens:
         - "token1"
         - "token2"
         - "token3"
   
   scenarios:
     - name: "Complete user workflow"
       weight: 70
       flow:
         - post:
             url: "/api/v1/sessions"
             headers:
               Authorization: "Bearer {{ auth_tokens }}"
             json:
               name: "Load Test Session"
               config:
                 provider: "anthropic"
                 model: "claude-3-sonnet"
         - post:
             url: "/api/v1/sessions/{{ session.id }}/tasks"
             headers:
               Authorization: "Bearer {{ auth_tokens }}"
             json:
               input: "Create a simple function"
         - get:
             url: "/api/v1/sessions/{{ session.id }}/tasks/{{ task.id }}"
             headers:
               Authorization: "Bearer {{ auth_tokens }}"
   ```

2. **K6 Stress Testing**
   ```javascript
   // tests/load/stress-test.js
   import http from 'k6/http';
   import { check, sleep } from 'k6';
   import { Rate } from 'k6/metrics';
   
   export const errorRate = new Rate('errors');
   
   export const options = {
     stages: [
       { duration: '2m', target: 100 }, // Ramp up to 100 users
       { duration: '5m', target: 100 }, // Stay at 100 users
       { duration: '2m', target: 200 }, // Ramp up to 200 users
       { duration: '5m', target: 200 }, // Stay at 200 users
       { duration: '2m', target: 0 },   // Ramp down
     ],
     thresholds: {
       http_req_duration: ['p(99)<1500'], // 99% of requests must complete below 1.5s
       errors: ['rate<0.1'], // Error rate must be below 10%
     },
   };
   
   export default function() {
     const authToken = 'test-token';
     
     // Create session
     const sessionResponse = http.post(
       'http://localhost:3000/api/v1/sessions',
       JSON.stringify({
         name: 'Stress Test Session',
         config: { provider: 'anthropic', model: 'claude-3-sonnet' }
       }),
       {
         headers: {
           'Authorization': `Bearer ${authToken}`,
           'Content-Type': 'application/json'
         }
       }
     );
     
     const sessionSuccess = check(sessionResponse, {
       'session created': (r) => r.status === 201,
       'session has id': (r) => JSON.parse(r.body).session.id !== undefined,
     });
     
     errorRate.add(!sessionSuccess);
     
     if (sessionSuccess) {
       const sessionId = JSON.parse(sessionResponse.body).session.id;
       
       // Create task
       const taskResponse = http.post(
         `http://localhost:3000/api/v1/sessions/${sessionId}/tasks`,
         JSON.stringify({ input: 'Create a simple function' }),
         {
           headers: {
             'Authorization': `Bearer ${authToken}`,
             'Content-Type': 'application/json'
           }
         }
       );
       
       const taskSuccess = check(taskResponse, {
         'task created': (r) => r.status === 201,
       });
       
       errorRate.add(!taskSuccess);
     }
     
     sleep(1);
   }
   ```

3. **Memory and CPU Profiling**
   ```typescript
   // tests/performance/memory-profile.test.ts
   describe('Memory Profiling', () => {
     it('should not leak memory during task execution', async () => {
       const initialMemory = process.memoryUsage();
       
       // Execute multiple tasks
       for (let i = 0; i < 100; i++) {
         const session = await sessionManager.createSession(testUser.id, testConfig);
         const task = await taskManager.createTask(session.id, 'Simple task');
         await taskManager.executeTask(task.id);
         await sessionManager.deleteSession(session.id);
       }
       
       // Force garbage collection
       if (global.gc) {
         global.gc();
       }
       
       const finalMemory = process.memoryUsage();
       const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
       
       // Memory increase should be minimal (< 50MB)
       expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
     });
   });
   ```

### Step 4.5: Security Testing (Days 9-10)

**Acceptance Criteria:**
- [ ] OWASP ZAP security scanning
- [ ] Dependency vulnerability scanning
- [ ] Input validation testing
- [ ] Authentication security tests
- [ ] Authorization bypass tests

**Implementation:**

1. **OWASP ZAP Integration**
   ```bash
   #!/bin/bash
   # scripts/security-scan.sh
   
   # Start the application
   npm run start:test &
   APP_PID=$!
   
   # Wait for app to start
   sleep 30
   
   # Run ZAP baseline scan
   docker run -t owasp/zap2docker-stable zap-baseline.py \
     -t http://localhost:3000 \
     -J zap-report.json \
     -r zap-report.html
   
   # Kill the application
   kill $APP_PID
   
   # Check for high-risk vulnerabilities
   if grep -q '"risk":"High"' zap-report.json; then
     echo "High-risk vulnerabilities found!"
     exit 1
   fi
   ```

2. **Security Test Suite**
   ```typescript
   // tests/security/auth-security.test.ts
   describe('Authentication Security', () => {
     it('should prevent brute force attacks', async () => {
       const attempts = Array(10).fill(null).map(() =>
         request(app)
           .post('/api/v1/auth/login')
           .send({ email: 'test@example.com', password: 'wrong' })
       );
       
       const responses = await Promise.all(attempts);
       
       // After 5 attempts, should be rate limited
       expect(responses[5].status).toBe(429);
       expect(responses[9].status).toBe(429);
     });
     
     it('should validate JWT tokens properly', async () => {
       const malformedToken = 'invalid.jwt.token';
       
       const response = await request(app)
         .get('/api/v1/sessions')
         .set('Authorization', `Bearer ${malformedToken}`);
       
       expect(response.status).toBe(401);
     });
     
     it('should prevent SQL injection', async () => {
       const maliciousInput = "'; DROP TABLE users; --";
       
       const response = await request(app)
         .post('/api/v1/sessions')
         .set('Authorization', `Bearer ${validToken}`)
         .send({
           name: maliciousInput,
           config: { provider: 'anthropic', model: 'claude-3-sonnet' }
         });
       
       // Should either reject or sanitize input
       expect(response.status).not.toBe(500);
       
       // Verify users table still exists
       const users = await db.query('SELECT COUNT(*) FROM users');
       expect(users.rows[0].count).toBeGreaterThan(0);
     });
   });
   ```

3. **Input Validation Tests**
   ```typescript
   // tests/security/input-validation.test.ts
   describe('Input Validation Security', () => {
     it('should prevent directory traversal in file operations', async () => {
       const maliciousPath = '../../../etc/passwd';
       
       const response = await request(app)
         .get(`/api/v1/sessions/${testSession.id}/files/${maliciousPath}`)
         .set('Authorization', `Bearer ${validToken}`);
       
       expect(response.status).toBe(403);
     });
     
     it('should prevent command injection', async () => {
       const maliciousCommand = 'ls; rm -rf /';
       
       const response = await request(app)
         .post(`/api/v1/sessions/${testSession.id}/tools/execute_command`)
         .set('Authorization', `Bearer ${validToken}`)
         .send({ parameters: { command: maliciousCommand } });
       
       expect(response.status).toBe(400);
     });
   });
   ```

## Internal Validation Commands

### Development Validation Scripts

1. **Quick Health Check**
   ```bash
   #!/bin/bash
   # scripts/health-check.sh
   
   echo "🔍 Running Roo-Code Health Check..."
   
   # Check if all services are running
   curl -f http://localhost:3000/health || exit 1
   echo "✅ API Server healthy"
   
   # Check database connection
   npm run db:ping || exit 1
   echo "✅ Database connected"
   
   # Check Redis connection
   npm run redis:ping || exit 1
   echo "✅ Redis connected"
   
   # Run core functionality test
   npm run test:core || exit 1
   echo "✅ Core functionality working"
   
   echo "🎉 All systems operational!"
   ```

2. **Tool Validation Script**
   ```bash
   #!/bin/bash
   # scripts/validate-tools.sh
   
   echo "🔧 Validating all tools..."
   
   for tool in $(ls packages/roo-core/src/tools/*.ts); do
     tool_name=$(basename $tool .ts)
     echo "Testing $tool_name..."
     
     npm run test:tool $tool_name || {
       echo "❌ $tool_name failed validation"
       exit 1
     }
     
     echo "✅ $tool_name validated"
   done
   
   echo "🎉 All tools validated!"
   ```

3. **API Validation Script**
   ```bash
   #!/bin/bash
   # scripts/validate-api.sh
   
   echo "🌐 Validating API endpoints..."
   
   # Get auth token
   TOKEN=$(curl -s -X POST http://localhost:3000/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password"}' \
     | jq -r '.tokens.accessToken')
   
   # Test session creation
   SESSION_ID=$(curl -s -X POST http://localhost:3000/api/v1/sessions \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"name":"Validation Test","config":{"provider":"anthropic","model":"claude-3-sonnet"}}' \
     | jq -r '.session.id')
   
   echo "✅ Session created: $SESSION_ID"
   
   # Test task creation
   TASK_ID=$(curl -s -X POST http://localhost:3000/api/v1/sessions/$SESSION_ID/tasks \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"input":"Create a simple function"}' \
     | jq -r '.task.id')
   
   echo "✅ Task created: $TASK_ID"
   
   # Cleanup
   curl -s -X DELETE http://localhost:3000/api/v1/sessions/$SESSION_ID \
     -H "Authorization: Bearer $TOKEN"
   
   echo "✅ API validation complete"
   ```

## CI/CD Integration

### GitHub Actions Workflow
```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run test:unit
      - run: npm run test:coverage
      
      - uses: codecov/codecov-action@v4
        with:
          files: ./coverage/lcov.info

  integration-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run test:integration
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
          REDIS_URL: redis://localhost:6379

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - run: npm ci
      - run: npx playwright install
      - run: npm run build
      - run: npm run start:test &
      - run: npm run test:e2e
      
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/

  security-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm audit --audit-level moderate
      - run: npx snyk test
      - run: ./scripts/security-scan.sh
```

## Test Data Management

### Test Database Setup
```sql
-- tests/fixtures/test-schema.sql
CREATE DATABASE roocode_test;

-- Create test users
INSERT INTO users (id, email, name, provider) VALUES
  ('test-user-1', 'test1@example.com', 'Test User 1', 'local'),
  ('test-user-2', 'test2@example.com', 'Test User 2', 'local');

-- Create test sessions
INSERT INTO sessions (id, user_id, name, config) VALUES
  ('test-session-1', 'test-user-1', 'Test Session 1', '{"provider":"anthropic","model":"claude-3-sonnet"}');
```

### Test Data Factories
```typescript
// tests/factories/index.ts
export class TestDataFactory {
  static async createUser(overrides?: Partial<User>): Promise<User> {
    const userData = {
      email: `test-${Date.now()}@example.com`,
      name: 'Test User',
      provider: 'local',
      ...overrides
    };
    
    return await userRepository.create(userData);
  }
  
  static async createSession(userId: string, overrides?: Partial<Session>): Promise<Session> {
    const sessionData = {
      userId,
      name: `Test Session ${Date.now()}`,
      config: {
        provider: 'anthropic',
        model: 'claude-3-sonnet',
        mode: 'code'
      },
      ...overrides
    };
    
    return await sessionRepository.create(sessionData);
  }
}
```

## Validation Checklist

### Test Coverage
- [ ] Unit tests: >85% code coverage
- [ ] Integration tests: All API endpoints
- [ ] E2E tests: Critical user journeys
- [ ] Performance tests: Load and stress
- [ ] Security tests: Vulnerability scanning

### Test Quality
- [ ] Tests are deterministic and reliable
- [ ] Test data is properly isolated
- [ ] Tests run in reasonable time (<5 min total)
- [ ] Tests provide clear failure messages
- [ ] Tests are maintainable and readable

### CI/CD Integration
- [ ] Tests run automatically on commits
- [ ] Test failures block deployments
- [ ] Test reports are easily accessible
- [ ] Performance regressions are detected
- [ ] Security issues are caught early

## Next Steps to Phase 5

1. **Deployment Pipeline** setup with testing integration
2. **Production Monitoring** with health checks
3. **Performance Monitoring** with alerting
4. **Security Monitoring** with vulnerability tracking

---

**Phase 4 Success Criteria**: Comprehensive testing framework with >85% coverage, automated CI/CD integration, performance validation, and security testing in place. 