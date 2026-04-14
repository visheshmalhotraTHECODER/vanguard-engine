import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { Redis } from 'ioredis';
import projectRoutes from './routes/projects.js';
import deploymentRoutes from './routes/deployments.js';
import webhookRoutes from './routes/webhooks.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// ─── HTTP + WebSocket Server ──────────────────────────────────
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: { origin: '*' },
});

// ─── Redis Subscriber ────────────────────────────────────────
// Dedicated subscriber connection (pub/sub needs its own connection)
const subscriber = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

// ─── Middleware ───────────────────────────────────────────────
app.use(helmet());
app.use(cors());
app.use(express.json());

// ─── Routes ──────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Vanguard Control Plane',
    version: '0.1.0',
  });
});

app.use('/api/projects', projectRoutes);
app.use('/api/deployments', deploymentRoutes);
app.use('/api/webhooks', webhookRoutes);

// ─── 404 Handler ─────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ─── WebSocket: Real-time Log Streaming ──────────────────────
/**
 * FLOW:
 * 1. Dashboard connects via socket and emits 'subscribe:logs' with deploymentId
 * 2. API subscribes to Redis channel `logs:{deploymentId}`
 * 3. Build service publishes each log line to that Redis channel
 * 4. API receives it and forwards to the correct socket room
 * 5. Dashboard renders it as a live terminal
 */
io.on('connection', (socket) => {
  console.log(`[WS] Client connected: ${socket.id}`);

  socket.on('subscribe:logs', async (deploymentId: string) => {
    console.log(`[WS] Client ${socket.id} subscribing to logs for: ${deploymentId}`);

    const channel = `logs:${deploymentId}`;
    socket.join(channel); // Join the room for this deployment

    // Subscribe to Redis Pub/Sub channel
    await subscriber.subscribe(channel);

    subscriber.on('message', (ch, message) => {
      if (ch === channel) {
        try {
          const parsed = JSON.parse(message);
          // Forward to all clients subscribed to this deployment
          io.to(channel).emit('log', parsed);
        } catch {
          io.to(channel).emit('log', { message, timestamp: new Date().toISOString() });
        }
      }
    });
  });

  socket.on('disconnect', () => {
    console.log(`[WS] Client disconnected: ${socket.id}`);
  });
});

// ─── Start ───────────────────────────────────────────────────
httpServer.listen(PORT, () => {
  console.log(`\n🚀 Vanguard API is soaring at http://localhost:${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/health`);
  console.log(`   WebSocket   : ws://localhost:${PORT}\n`);
});
