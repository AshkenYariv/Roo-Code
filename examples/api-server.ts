// Example API Server Implementation
import express from 'express'
import { Server as SocketIOServer } from 'socket.io'
import { createServer } from 'http'
import cors from 'cors'
import multer from 'multer'
import { v4 as uuidv4 } from 'uuid'

// Extracted core types (would come from packages/types)
interface Session {
  id: string
  userId: string
  workspaceId: string
  createdAt: Date
  config: SessionConfig
}

interface SessionConfig {
  provider: string
  apiKey: string
  model: string
  mode: string
  allowedPaths: string[]
  maxFileSize: number
}

interface TaskRequest {
  sessionId: string
  input: string
  images?: Buffer[]
}

interface TaskResponse {
  taskId: string
  type: 'message' | 'tool_execution' | 'approval_required' | 'completed' | 'error'
  content: any
  needsApproval?: boolean
}

// Core Engine (extracted from existing Roo Code logic)
class RooCodeEngine {
  private sessions = new Map<string, Session>()
  private activeTasks = new Map<string, any>() // Would be actual Task instances
  
  async createSession(userId: string, config: SessionConfig): Promise<Session> {
    const session: Session = {
      id: uuidv4(),
      userId,
      workspaceId: uuidv4(),
      createdAt: new Date(),
      config
    }
    
    this.sessions.set(session.id, session)
    return session
  }

  async executeTask(request: TaskRequest): Promise<string> {
    const session = this.sessions.get(request.sessionId)
    if (!session) throw new Error('Session not found')

    // This would use the extracted Task class logic
    const taskId = uuidv4()
    
    // Initialize workspace for this session
    const workspacePath = `/tmp/roo-workspaces/${session.workspaceId}`
    
    // Create task with extracted logic (simplified here)
    const task = {
      id: taskId,
      sessionId: request.sessionId,
      input: request.input,
      status: 'running',
      workspace: workspacePath
    }
    
    this.activeTasks.set(taskId, task)
    
    // Start async execution
    this.executeTaskAsync(task).catch(console.error)
    
    return taskId
  }

  private async executeTaskAsync(task: any) {
    // This would contain the extracted logic from Task.recursivelyMakeClineRequests()
    // Simplified example:
    
    try {
      // 1. Process user input with AI provider
      // 2. Execute tools as needed
      // 3. Stream responses back via WebSocket
      // 4. Handle approval requests
      
      const response: TaskResponse = {
        taskId: task.id,
        type: 'message',
        content: 'Task started successfully'
      }
      
      // Emit to WebSocket
      this.emitToSession(task.sessionId, 'task.response', response)
      
    } catch (error) {
      const errorResponse: TaskResponse = {
        taskId: task.id,
        type: 'error',
        content: error.message
      }
      
      this.emitToSession(task.sessionId, 'task.response', errorResponse)
    }
  }

  private emitToSession(sessionId: string, event: string, data: any) {
    // This would emit to the specific session's WebSocket connection
    global.io?.to(sessionId).emit(event, data)
  }
}

// Express Server Setup
const app = express()
const server = createServer(app)
const io = new SocketIOServer(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
})

// Make io globally available for the engine
declare global {
  var io: SocketIOServer | undefined
}
global.io = io

const engine = new RooCodeEngine()
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
})

// Middleware
app.use(cors())
app.use(express.json({ limit: '10mb' }))

// REST API Routes

// Session Management
app.post('/api/v1/sessions', async (req, res) => {
  try {
    const { userId, config } = req.body
    const session = await engine.createSession(userId, config)
    res.json(session)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.get('/api/v1/sessions/:id', async (req, res) => {
  try {
    const session = await engine.getSession(req.params.id)
    res.json(session)
  } catch (error) {
    res.status(404).json({ error: 'Session not found' })
  }
})

// Task Management
app.post('/api/v1/sessions/:id/tasks', upload.array('images'), async (req, res) => {
  try {
    const { input } = req.body
    const images = req.files as Express.Multer.File[]
    
    const taskRequest: TaskRequest = {
      sessionId: req.params.id,
      input,
      images: images?.map(f => f.buffer)
    }
    
    const taskId = await engine.executeTask(taskRequest)
    res.json({ taskId })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.delete('/api/v1/sessions/:id/tasks/:taskId', async (req, res) => {
  try {
    await engine.cancelTask(req.params.taskId)
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// File Operations (Sandboxed)
app.get('/api/v1/sessions/:id/files', async (req, res) => {
  try {
    const { path = '' } = req.query
    const files = await engine.listFiles(req.params.id, path as string)
    res.json(files)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.get('/api/v1/sessions/:id/files/*', async (req, res) => {
  try {
    const filePath = req.params[0]
    const content = await engine.readFile(req.params.id, filePath)
    res.json({ content })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.put('/api/v1/sessions/:id/files/*', async (req, res) => {
  try {
    const filePath = req.params[0]
    const { content } = req.body
    await engine.writeFile(req.params.id, filePath, content)
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// WebSocket Connection Handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id)
  
  socket.on('join-session', (sessionId: string) => {
    socket.join(sessionId)
    console.log(`Client ${socket.id} joined session ${sessionId}`)
  })
  
  socket.on('task.approve', async (data: { taskId: string, approved: boolean }) => {
    try {
      await engine.approveTask(data.taskId, data.approved)
    } catch (error) {
      socket.emit('error', { message: error.message })
    }
  })
  
  socket.on('task.cancel', async (data: { taskId: string }) => {
    try {
      await engine.cancelTask(data.taskId)
    } catch (error) {
      socket.emit('error', { message: error.message })
    }
  })
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id)
  })
})

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() })
})

const PORT = process.env.PORT || 3000
const WS_PORT = process.env.WS_PORT || 3001

server.listen(PORT, () => {
  console.log(`Roo Code API Server running on port ${PORT}`)
  console.log(`WebSocket server running on port ${WS_PORT}`)
})

export { app, server, io } 