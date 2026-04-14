import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import projectRoutes from './routes/projects.js';
import deploymentRoutes from './routes/deployments.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

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

// ─── 404 Handler ─────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ─── Start ───────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 Vanguard API is soaring at http://localhost:${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/health\n`);
});
