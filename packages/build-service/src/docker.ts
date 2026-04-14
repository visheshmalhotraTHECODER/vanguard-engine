import Docker from 'dockerode';
import { Readable } from 'stream';

// Connect to local Docker Engine via socket
// On Windows (Docker Desktop), it uses named pipe
const docker = new Docker(
  process.platform === 'win32'
    ? { socketPath: '//./pipe/docker_engine' }
    : { socketPath: '/var/run/docker.sock' }
);

export interface BuildResult {
  success: boolean;
  imageId?: string;
  error?: string;
}

export interface RunResult {
  success: boolean;
  containerId?: string;
  port?: number;
  error?: string;
}

/**
 * Builds a Docker image from a local directory (the cloned repo).
 * Streams each log line to the provided callback for real-time delivery.
 */
export async function buildImage(
  contextPath: string,
  imageTag: string,
  onLog: (log: string) => void
): Promise<BuildResult> {
  try {
    onLog(`[Vanguard] 🐳 Starting Docker build for image: ${imageTag}`);

    const stream = await docker.buildImage(
      {
        context: contextPath,
        src: ['.'], // Include everything in the directory
      },
      { t: imageTag }
    );

    // Wait for build to finish, streaming logs
    await new Promise<void>((resolve, reject) => {
      docker.modem.followProgress(
        stream as unknown as Readable,
        (err: Error | null) => {
          if (err) reject(err);
          else resolve();
        },
        (event: { stream?: string; error?: string }) => {
          if (event.stream) {
            const log = event.stream.trim();
            if (log) onLog(log);
          }
          if (event.error) {
            onLog(`[ERROR] ${event.error}`);
          }
        }
      );
    });

    onLog(`[Vanguard] ✅ Image built successfully: ${imageTag}`);
    return { success: true, imageId: imageTag };
  } catch (err: any) {
    const msg = err?.message || 'Unknown Docker build error';
    onLog(`[Vanguard] ❌ Build failed: ${msg}`);
    return { success: false, error: msg };
  }
}

/**
 * Runs a container from a built image.
 * Finds a free port and maps container port 3000 to it.
 * Returns the container ID and the host port.
 */
export async function runContainer(
  imageTag: string,
  onLog: (log: string) => void
): Promise<RunResult> {
  try {
    // Pick a random port in range 10000–60000
    const hostPort = Math.floor(Math.random() * 50000) + 10000;

    onLog(`[Vanguard] 🚀 Spinning up container from image: ${imageTag}`);
    onLog(`[Vanguard] 📡 Mapping container :3000 → host :${hostPort}`);

    const container = await docker.createContainer({
      Image: imageTag,
      ExposedPorts: { '3000/tcp': {} },
      HostConfig: {
        PortBindings: {
          '3000/tcp': [{ HostPort: String(hostPort) }],
        },
        // Resource limits — security best practice
        Memory: 512 * 1024 * 1024,       // 512 MB RAM cap
        NanoCpus: 1_000_000_000,          // 1 CPU core cap
        NetworkMode: 'bridge',
      },
    });

    await container.start();

    onLog(`[Vanguard] 🟢 Container is LIVE!`);
    onLog(`[Vanguard] 🔗 Accessible at http://localhost:${hostPort}`);
    onLog(`[Vanguard] 🆔 Container ID: ${container.id.slice(0, 12)}`);

    return {
      success: true,
      containerId: container.id,
      port: hostPort,
    };
  } catch (err: any) {
    const msg = err?.message || 'Unknown container run error';
    onLog(`[Vanguard] ❌ Container start failed: ${msg}`);
    return { success: false, error: msg };
  }
}

/**
 * Stops and removes a container by its ID.
 * Called during new deployments (replace old with new — Blue/Green prep)
 */
export async function teardownContainer(
  containerId: string,
  onLog: (log: string) => void
): Promise<void> {
  try {
    onLog(`[Vanguard] 🔄 Tearing down old container: ${containerId.slice(0, 12)}`);
    const container = docker.getContainer(containerId);
    await container.stop();
    await container.remove();
    onLog(`[Vanguard] 🗑️  Old container removed.`);
  } catch (err: any) {
    // Non-fatal — container may already be stopped
    onLog(`[Vanguard] ⚠️  Teardown warning: ${err?.message}`);
  }
}

export default docker;
