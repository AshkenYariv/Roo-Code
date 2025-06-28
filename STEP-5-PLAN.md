# Step 1.5: Create Basic HTTP API (Days 7-8)

## 🎯 Objective
Build a production-ready Express.js HTTP API server with WebSocket support for real-time communication, enabling external applications to interact with the Roo-Code engine.

## 📋 Acceptance Criteria
- [ ] Express server with RESTful endpoints
- [ ] WebSocket support for real-time updates
- [ ] Task creation and execution via API
- [ ] Basic error handling and validation
- [ ] API documentation (OpenAPI/Swagger)

## 🔧 API Endpoints

### Core Session Management
```typescript
POST   /api/v1/sessions                    # Create new session
GET    /api/v1/sessions                    # List all sessions  
GET    /api/v1/sessions/:id                # Get session details
DELETE /api/v1/sessions/:id                # Delete session
```

### Task Management
```typescript
POST   /api/v1/sessions/:id/tasks          # Create and execute task
GET    /api/v1/sessions/:id/tasks          # List session tasks
GET    /api/v1/sessions/:id/tasks/:taskId  # Get task status
DELETE /api/v1/sessions/:id/tasks/:taskId  # Cancel task
```

### Real-time Communication
```typescript
WebSocket /ws                              # Real-time updates
```

## 🏗️ Server Architecture

### Main Server Class
```typescript
// packages/roo-core/src/api/server.ts
export class RooCodeServer {
  private app = express();
  private server: http.Server;
  private wsServer: WebSocketServer;
  private rooEngine: RooEngine;

  constructor(private config: ServerConfig) {
    this.setupMiddleware();
    this.setupRoutes();
    this.setupWebSocket();
  }

  async start(): Promise<void> {
    const port = this.config.port || 3000;
    this.server = this.app.listen(port, () => {
      console.log(`Roo-Code server running on port ${port}`);
    });
  }

  async stop(): Promise<void> {
    // Graceful shutdown
  }
}
```

### WebSocket Integration
```typescript
// packages/roo-core/src/api/websocket.ts
export class WebSocketManager {
  private clients = new Set<WebSocket>();

  broadcast(event: string, data: any): void {
    const message = JSON.stringify({ event, data });
    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  handleConnection(ws: WebSocket): void {
    this.clients.add(ws);
    ws.on('close', () => this.clients.delete(ws));
  }
}
```

## 📊 Deliverables

### Required Files
1. ✅ Express server with all endpoints
2. ✅ WebSocket real-time communication
3. ✅ Request validation middleware
4. ✅ Error handling and logging
5. ✅ OpenAPI documentation
6. ✅ Basic authentication/rate limiting

### Validation Commands
```bash
# Start server
cd packages/roo-core
npm run start

# Test endpoints
npm run test:api

# Load testing
npm run test:load
```

## 🚦 Success Criteria
- All API endpoints functional
- WebSocket communication working
- Proper error handling and validation
- API documentation complete
- Integration tests pass
- Basic security measures in place

## ➡️ Next Step Preparation
API server ready for validation and testing (Step 1.6) 