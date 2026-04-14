import { Queue } from 'bullmq';
import { Redis } from 'ioredis';

const connection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

// The shared queue — build-service worker listens to this
export const buildQueue = new Queue('build-queue', { connection });

export interface BuildJobPayload {
  deploymentId: string;
  projectId: string;
  repoUrl: string;
  previousContainerId?: string;
}

/**
 * Adds a build job to the Redis queue.
 * The build-service worker will pick this up and execute it.
 */
export async function queueBuildJob(payload: BuildJobPayload) {
  const job = await buildQueue.add('build', payload, {
    attempts: 2,           // Retry once on failure
    backoff: {
      type: 'exponential',
      delay: 3000,
    },
    removeOnComplete: 100, // Keep last 100 completed jobs
    removeOnFail: 50,
  });

  console.log(`[Queue] 📦 Build job queued: ${job.id} for deployment: ${payload.deploymentId}`);
  return job;
}
