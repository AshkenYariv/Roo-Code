# Phase 2: API Service Development (Weeks 3-4)

## Overview

Build a production-ready API service with authentication, workspace management, real-time communication, and comprehensive tool coverage. This phase transforms the basic extracted engine into a scalable service.

## Goals

- ✅ Production-ready HTTP API with full tool coverage
- ✅ Authentication and authorization system
- ✅ Real-time WebSocket communication
- ✅ Workspace isolation and management
- ✅ Comprehensive error handling and logging
- ✅ API documentation and testing

## Architecture Enhancements

### Phase 1 → Phase 2 Progression

```
Phase 1: Basic Engine        →    Phase 2: Production API
├── TaskManager              →    ├── SessionManager (multi-user)
├── Simple HTTP API          →    ├── Full REST API
├── Basic tool execution     →    ├── Secured tool execution
└── No authentication       →    ├── JWT + OAuth2
                                  ├── WebSocket real-time
                                  ├── Workspace isolation
                                  └── Comprehensive logging
```

## Step-by-Step Implementation

### Step 2.1: Authentication System (Days 1-2)

**Acceptance Criteria:**
- [ ] JWT-based authentication implemented
- [ ] OAuth2 integration (Google, GitHub)
- [ ] API key management for programmatic access
- [ ] Role-based access control (RBAC)
- [ ] Token refresh mechanism

**Implementation:**

1. **Authentication Service**
   ```typescript
   // packages/roo-core/src/auth/AuthService.ts
   export class AuthService {
     async authenticate(credentials: AuthCredentials): Promise<AuthResult> {
       // JWT token generation
       // OAuth2 provider validation
       // User profile creation/update
     }
     
     async validateToken(token: string): Promise<User | null> {
       // JWT validation
       // Token expiry check
       // User permission loading
     }
     
     async refreshToken(refreshToken: string): Promise<TokenPair> {
       // Refresh token validation
       // New token generation
     }
   }
   ```

2. **User Management**
   ```typescript
   interface User {
     id: string;
     email: string;
     provider: 'google' | 'github' | 'local';
     roles: Role[];
     preferences: UserPreferences;
     createdAt: Date;
     lastLoginAt: Date;
   }
   
   interface Role {
     name: string;
     permissions: Permission[];
   }
   ```

3. **Middleware Implementation**
   ```typescript
   // Authentication middleware
   export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
     const token = extractToken(req);
     const user = authService.validateToken(token);
     
     if (!user) {
       return res.status(401).json({ error: 'Unauthorized' });
     }
     
     req.user = user;
     next();
   };
   ```

**Validation:**
```bash
# Test authentication endpoints
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'

# Test protected endpoint
curl -H "Authorization: Bearer <token>" \
  http://localhost:3000/api/v1/sessions
```

### Step 2.2: Session and Workspace Management (Days 3-4)

**Acceptance Criteria:**
- [ ] Multi-user session management
- [ ] Isolated workspaces per session
- [ ] Workspace persistence and cleanup
- [ ] Resource limits and monitoring
- [ ] Session state management

**Implementation:**

1. **Session Manager**
   ```typescript
   export class SessionManager {
     private sessions = new Map<string, Session>();
     
     async createSession(userId: string, config: SessionConfig): Promise<Session> {
       const session = new Session({
         id: generateId(),
         userId,
         workspaceId: generateWorkspaceId(),
         config,
         createdAt: new Date()
       });
       
       await this.setupWorkspace(session);
       this.sessions.set(session.id, session);
       
       return session;
     }
     
     async getSession(sessionId: string, userId: string): Promise<Session> {
       const session = this.sessions.get(sessionId);
       if (!session || session.userId !== userId) {
         throw new Error('Session not found or access denied');
       }
       return session;
     }
   }
   ```

2. **Workspace Isolation**
   ```typescript
   export class WorkspaceManager {
     async createWorkspace(sessionId: string): Promise<string> {
       const workspacePath = `/tmp/roo-workspaces/${sessionId}`;
       await fs.mkdir(workspacePath, { recursive: true });
       
       // Set up sandbox environment
       await this.setupSandbox(workspacePath);
       
       return workspacePath;
     }
     
     async setupSandbox(workspacePath: string): Promise<void> {
       // File system restrictions
       // Network access controls
       // Resource limits (CPU, memory, disk)
     }
   }
   ```

3. **Resource Management**
   ```typescript
   interface ResourceLimits {
     maxMemoryMB: number;
     maxCpuPercent: number;
     maxDiskMB: number;
     maxExecutionTime: number;
     maxConcurrentTasks: number;
   }
   
   export class ResourceMonitor {
     async enforceResourceLimits(sessionId: string): Promise<void> {
       // Monitor and enforce limits
       // Terminate runaway processes
       // Clean up resources
     }
   }
   ```

### Step 2.3: Real-time Communication (Days 5-6)

**Acceptance Criteria:**
- [ ] WebSocket server implementation
- [ ] Real-time task progress updates
- [ ] Tool execution streaming
- [ ] Approval request handling
- [ ] Connection management and heartbeat

**Implementation:**

1. **WebSocket Server**
   ```typescript
   // packages/roo-core/src/api/websocket.ts
   export class WebSocketManager {
     private connections = new Map<string, WebSocket>();
     
     handleConnection(ws: WebSocket, sessionId: string): void {
       this.connections.set(sessionId, ws);
       
       ws.on('message', (data) => this.handleMessage(sessionId, data));
       ws.on('close', () => this.handleDisconnection(sessionId));
       
       // Send initial state
       this.sendSessionState(sessionId);
     }
     
     broadcastToSession(sessionId: string, event: string, data: any): void {
       const ws = this.connections.get(sessionId);
       if (ws && ws.readyState === WebSocket.OPEN) {
         ws.send(JSON.stringify({ event, data }));
       }
     }
   }
   ```

2. **Event Types**
   ```typescript
   interface WebSocketEvent {
     event: 'task.progress' | 'task.complete' | 'tool.execution' | 'approval.required';
     sessionId: string;
     data: any;
     timestamp: Date;
   }
   
   // Real-time updates
   export enum EventType {
     TASK_STARTED = 'task.started',
     TASK_PROGRESS = 'task.progress',
     TASK_COMPLETE = 'task.complete',
     TOOL_EXECUTION = 'tool.execution',
     APPROVAL_REQUIRED = 'approval.required',
     ERROR_OCCURRED = 'error.occurred'
   }
   ```

3. **Integration with Task System**
   ```typescript
   export class Task {
     async execute(): Promise<void> {
       this.emit('started', { taskId: this.id });
       
       for (const step of this.steps) {
         this.emit('progress', { 
           taskId: this.id, 
           step: step.name, 
           progress: this.getProgress() 
         });
         
         await this.executeStep(step);
       }
       
       this.emit('complete', { taskId: this.id, result: this.result });
     }
   }
   ```

### Step 2.4: Complete API Implementation (Days 7-8)

**Acceptance Criteria:**
- [ ] Full REST API with all endpoints
- [ ] Request validation and sanitization
- [ ] Comprehensive error handling
- [ ] API versioning support
- [ ] Rate limiting implementation

**Core API Endpoints:**

1. **Authentication Endpoints**
   ```typescript
   // POST /api/v1/auth/login
   // POST /api/v1/auth/logout
   // POST /api/v1/auth/refresh
   // GET /api/v1/auth/profile
   // PUT /api/v1/auth/profile
   ```

2. **Session Management**
   ```typescript
   // GET /api/v1/sessions
   // POST /api/v1/sessions
   // GET /api/v1/sessions/:id
   // PUT /api/v1/sessions/:id
   // DELETE /api/v1/sessions/:id
   ```

3. **Task Management**
   ```typescript
   // POST /api/v1/sessions/:id/tasks
   // GET /api/v1/sessions/:id/tasks
   // GET /api/v1/sessions/:id/tasks/:taskId
   // PUT /api/v1/sessions/:id/tasks/:taskId
   // DELETE /api/v1/sessions/:id/tasks/:taskId
   ```

4. **File Operations**
   ```typescript
   // GET /api/v1/sessions/:id/files/*
   // POST /api/v1/sessions/:id/files/*
   // PUT /api/v1/sessions/:id/files/*
   // DELETE /api/v1/sessions/:id/files/*
   ```

5. **Tool Execution**
   ```typescript
   // POST /api/v1/sessions/:id/tools/:toolName
   // GET /api/v1/tools
   // GET /api/v1/tools/:toolName
   ```

**Request Validation:**
```typescript
import { z } from 'zod';

const CreateTaskSchema = z.object({
  input: z.string().min(1).max(10000),
  images: z.array(z.string()).optional(),
  config: z.object({
    provider: z.string(),
    model: z.string(),
    mode: z.string().optional()
  }).optional()
});

export const validateCreateTask = (req: Request, res: Response, next: NextFunction) => {
  try {
    CreateTaskSchema.parse(req.body);
    next();
  } catch (error) {
    res.status(400).json({ error: 'Invalid request', details: error.errors });
  }
};
```

### Step 2.5: Security Implementation (Days 9-10)

**Acceptance Criteria:**
- [ ] Input sanitization and validation
- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] Rate limiting per user/IP
- [ ] Audit logging for all actions

**Security Measures:**

1. **Input Sanitization**
   ```typescript
   export class SecurityService {
     sanitizeInput(input: string): string {
       // Remove potentially dangerous content
       // Validate against injection patterns
       // Limit input length
     }
     
     validateFileAccess(sessionId: string, filePath: string): boolean {
       // Ensure file access within workspace
       // Prevent directory traversal
       // Check file permissions
     }
   }
   ```

2. **Rate Limiting**
   ```typescript
   import rateLimit from 'express-rate-limit';
   
   const apiLimiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 100, // Limit each IP to 100 requests per windowMs
     message: 'Too many requests from this IP'
   });
   
   const taskLimiter = rateLimit({
     windowMs: 60 * 1000, // 1 minute
     max: 5, // Limit task creation to 5 per minute
     keyGenerator: (req) => req.user.id // Per user limiting
   });
   ```

3. **Audit Logging**
   ```typescript
   export class AuditLogger {
     async logAction(action: AuditAction): Promise<void> {
       const logEntry = {
         userId: action.userId,
         sessionId: action.sessionId,
         action: action.type,
         resource: action.resource,
         timestamp: new Date(),
         ip: action.ip,
         userAgent: action.userAgent
       };
       
       await this.store.save(logEntry);
     }
   }
   ```

### Step 2.6: Testing and Documentation (Days 11-12)

**Acceptance Criteria:**
- [ ] Comprehensive API test suite
- [ ] Performance benchmarks
- [ ] API documentation (OpenAPI/Swagger)
- [ ] Integration test examples
- [ ] Load testing results

**Testing Implementation:**

1. **API Test Suite**
   ```typescript
   // tests/api/auth.test.ts
   describe('Authentication API', () => {
     test('should authenticate with valid credentials', async () => {
       const response = await request(app)
         .post('/api/v1/auth/login')
         .send({ email: 'test@example.com', password: 'password' });
       
       expect(response.status).toBe(200);
       expect(response.body.token).toBeDefined();
     });
   });
   ```

2. **Performance Testing**
   ```bash
   # Load testing with artillery
   artillery run load-test.yml
   
   # Benchmark individual endpoints
   npm run benchmark:api
   ```

3. **API Documentation**
   ```yaml
   # api-docs.yml
   openapi: 3.0.0
   info:
     title: Roo-Code API
     version: 1.0.0
   paths:
     /api/v1/sessions:
       post:
         summary: Create new session
         requestBody:
           required: true
           content:
             application/json:
               schema:
                 $ref: '#/components/schemas/CreateSessionRequest'
   ```

## Final File Structure

```
packages/roo-core/
├── src/
│   ├── api/
│   │   ├── server.ts
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   ├── sessions.ts
│   │   │   ├── tasks.ts
│   │   │   ├── files.ts
│   │   │   └── tools.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts
│   │   │   ├── validation.ts
│   │   │   ├── rate-limiting.ts
│   │   │   └── error-handling.ts
│   │   └── websocket.ts
│   ├── auth/
│   │   ├── AuthService.ts
│   │   ├── UserService.ts
│   │   └── PermissionService.ts
│   ├── session/
│   │   ├── SessionManager.ts
│   │   ├── WorkspaceManager.ts
│   │   └── ResourceMonitor.ts
│   ├── security/
│   │   ├── SecurityService.ts
│   │   ├── AuditLogger.ts
│   │   └── InputValidator.ts
│   └── database/
│       ├── models/
│       ├── migrations/
│       └── seeds/
├── tests/
│   ├── api/
│   ├── integration/
│   ├── performance/
│   └── security/
├── docs/
│   ├── api-reference/
│   ├── authentication.md
│   └── deployment.md
└── examples/
    ├── api-client.ts
    ├── websocket-client.ts
    └── load-test.yml
```

## Configuration

### Environment Variables
```bash
# .env.production
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/roocode
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
OAUTH_GOOGLE_CLIENT_ID=google-client-id
OAUTH_GITHUB_CLIENT_ID=github-client-id
```

### Production Config
```typescript
export const productionConfig = {
  server: {
    port: process.env.PORT || 3000,
    cors: {
      origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000']
    }
  },
  database: {
    url: process.env.DATABASE_URL,
    pool: { min: 2, max: 10 }
  },
  redis: {
    url: process.env.REDIS_URL
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET,
    tokenExpiry: '1h',
    refreshTokenExpiry: '7d'
  }
};
```

## Performance Benchmarks

### Target Metrics
- **API Response Time**: < 100ms for sync operations
- **Task Creation**: < 500ms
- **WebSocket Latency**: < 50ms
- **Concurrent Users**: 100+ simultaneous sessions
- **Memory Usage**: < 512MB per session
- **CPU Usage**: < 50% under normal load

### Load Testing Results
```bash
# Example results
Scenarios launched: 1000
Scenarios completed: 1000
Requests completed: 5000
Mean response/sec: 83.67
Response time (msec):
  min: 45
  max: 342
  median: 89
  p95: 156
  p99: 234
```

## Validation Checklist

### API Functionality
- [ ] All endpoints working correctly
- [ ] Authentication and authorization
- [ ] Request validation and sanitization
- [ ] Error handling and logging
- [ ] Rate limiting functional

### Real-time Features
- [ ] WebSocket connections stable
- [ ] Real-time updates working
- [ ] Connection management
- [ ] Heartbeat mechanism
- [ ] Event broadcasting

### Security
- [ ] Input validation complete
- [ ] SQL injection protected
- [ ] XSS prevention active
- [ ] Audit logging working
- [ ] Resource limits enforced

### Performance
- [ ] Response times under targets
- [ ] Load testing passed
- [ ] Memory usage optimized
- [ ] Database queries optimized
- [ ] Caching implemented

## Next Steps to Phase 3

1. **Frontend Development** begins with complete API
2. **Real-time UI** leveraging WebSocket events
3. **Comprehensive tool coverage** in frontend
4. **User experience optimization**

---

**Phase 2 Success Criteria**: Production-ready API service with authentication, real-time communication, comprehensive tool coverage, and security measures in place. 