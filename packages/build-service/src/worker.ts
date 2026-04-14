import { Worker, Job } from 'bullmq';
import { Redis } from 'ioredis';
import simpleGit from 'simple-git';
import path from 'path';
import fs from 'fs';
import os from 'os';
import dotenv from 'dotenv';
import { buildImage, runContainer, teardownContainer } from './docker.js';
import { publishLog, publishDone } from './publisher.js';

// Separate Redis client for proxy route registration
const routeRegistry = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

/**
 * Registers subdomain → port in Redis so the Proxy knows where to route.
 * Key: proxy:subdomain:{subdomain} = port
 */
async function registerProxyRoute(subdomain: string, port: number): Promise<void> {
  await routeRegistry.set(`proxy:subdomain:${subdomain}`, String(port));
}

dotenv.config();

// ─── Redis Connection ────────────────────────────────────────
const connection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

// ─── Job Payload Type ────────────────────────────────────────
interface BuildJobData {
  deploymentId: string;
  projectId: string;
  repoUrl: string;
  subdomain: string;            // e.g. "myapp" → myapp.vanguard.dev
  previousContainerId?: string; // for zero-downtime swap
}

// ─── Worker ──────────────────────────────────────────────────
const worker = new Worker<BuildJobData>(
  'build-queue',
  async (job: Job<BuildJobData>) => {
    const { deploymentId, repoUrl, subdomain, previousContainerId } = job.data;

    // Convenience wrapper — publishes and also logs to console
    const log = (msg: string) => {
      console.log(`[${deploymentId}] ${msg}`);
      publishLog(deploymentId, msg);
    };

    log(`📦 Build job started for deployment: ${deploymentId}`);
    log(`🔗 Repo: ${repoUrl}`);

    // ── Step 1: Clone the Repository ─────────────────────────
    const cloneDir = path.join(os.tmpdir(), `vanguard-${deploymentId}`);

    try {
      if (fs.existsSync(cloneDir)) {
        fs.rmSync(cloneDir, { recursive: true, force: true });
      }
      fs.mkdirSync(cloneDir, { recursive: true });

      log(`📂 Cloning repository into temp dir...`);
      await simpleGit().clone(repoUrl, cloneDir, ['--depth=1']);
      log(`✅ Clone complete.`);
    } catch (err: any) {
      log(`❌ Clone failed: ${err.message}`);
      publishDone(deploymentId, false);
      throw err;
    }

    // ── Step 2: Ensure Dockerfile Exists ─────────────────────
    const dockerfilePath = path.join(cloneDir, 'Dockerfile');
    if (!fs.existsSync(dockerfilePath)) {
      log(`⚠️  No Dockerfile found. Injecting a default Node.js Dockerfile...`);

      // Auto-detect: if package.json exists, inject a smart Dockerfile
      const defaultDockerfile = `
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm install --frozen-lockfile
COPY . .
RUN npm run build 2>/dev/null || true
EXPOSE 3000
CMD ["node", "index.js"]
      `.trim();

      fs.writeFileSync(dockerfilePath, defaultDockerfile);
      log(`✅ Default Dockerfile injected.`);
    }

    // ── Step 3: Build Docker Image ───────────────────────────
    const imageTag = `vanguard/${deploymentId}:latest`;
    const buildResult = await buildImage(cloneDir, imageTag, log);

    if (!buildResult.success) {
      publishDone(deploymentId, false);
      throw new Error(buildResult.error);
    }

    // ── Step 4: Teardown Previous Container (Zero-Downtime) ──
    if (previousContainerId) {
      log(`🔄 Replacing previous container for zero-downtime deploy...`);
      await teardownContainer(previousContainerId, log);
    }

    // ── Step 5: Run the New Container ────────────────────────
    const runResult = await runContainer(imageTag, log);

    if (!runResult.success) {
      publishDone(deploymentId, false);
      throw new Error(runResult.error);
    }

    // ── Step 6: Register Route in Proxy ──────────────────────
    // This is the magic moment — subdomain is now live!
    if (runResult.port) {
      await registerProxyRoute(subdomain, runResult.port);
      log(`🌐 Route registered: ${subdomain}.vanguard.dev → :${runResult.port}`);
      log(`🔗 Your app is live at: http://${subdomain}.localhost:8080`);
    }

    // ── Step 7: Cleanup temp clone ───────────────────────────
    try {
      fs.rmSync(cloneDir, { recursive: true, force: true });
      log(`🧹 Build artifacts cleaned up.`);
    } catch {
      // Non-fatal
    }

    // ── Step 8: Signal completion ─────────────────────────────
    publishDone(deploymentId, true);

    // Return result for job record
    return {
      containerId: runResult.containerId,
      port: runResult.port,
    };
  },
  {
    connection,
    concurrency: 3, // Max 3 builds running in parallel
  }
);

// ─── Worker Event Handlers ────────────────────────────────────
worker.on('completed', (job, result) => {
  console.log(
    `✅ Job ${job.id} completed. Container: ${result.containerId?.slice(0, 12)} on port ${result.port}`
  );
});

worker.on('failed', (job, err) => {
  console.error(`❌ Job ${job?.id} failed:`, err.message);
});

worker.on('active', (job) => {
  console.log(`⚡ Job ${job.id} is now active (processing...)`);
});

console.log('🏗️  Vanguard Build Service is running. Waiting for jobs...\n');
