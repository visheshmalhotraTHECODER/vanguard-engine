import { Redis } from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

// Dedicated publisher connection (Redis requires separate connections for pub/sub)
const publisher = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null, // Required for BullMQ
});

/**
 * Publishes a single log line to a deployment-specific Redis channel.
 *
 * Channel naming convention: logs:{deploymentId}
 * The API server subscribes to this channel and forwards
 * each message via WebSocket to the dashboard in real-time.
 */
export function publishLog(deploymentId: string, message: string): void {
  const channel = `logs:${deploymentId}`;
  const payload = JSON.stringify({
    timestamp: new Date().toISOString(),
    message,
  });
  publisher.publish(channel, payload);
}

/**
 * Signals that the build is complete.
 * The API subscriber uses this to know when to stop listening.
 */
export function publishDone(deploymentId: string, success: boolean): void {
  const channel = `logs:${deploymentId}`;
  const payload = JSON.stringify({
    timestamp: new Date().toISOString(),
    message: success
      ? '[Vanguard] ✅ Deployment complete.'
      : '[Vanguard] ❌ Deployment failed.',
    done: true,
    success,
  });
  publisher.publish(channel, payload);
}

export { publisher };
