import { Redis } from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

const BASE_DOMAIN = process.env.BASE_DOMAIN || 'vanguard.dev';

// Redis key convention: proxy:subdomain:{subdomain} → port number
// This is written by the build-service when a container goes live
const PROXY_KEY = (subdomain: string) => `proxy:subdomain:${subdomain}`;

export interface RouteTarget {
  port: number;
  subdomain: string;
  target: string; // e.g. "http://localhost:3001"
}

/**
 * Resolves an incoming hostname to a target URL.
 *
 * e.g. "myapp.vanguard.dev" → "http://localhost:34521"
 *
 * Lookup order:
 * 1. Redis cache (fast path — O(1))
 * 2. Returns null if not found (proxy will return 404)
 */
export async function resolveRoute(hostname: string): Promise<RouteTarget | null> {
  // Strip port if present (e.g. "myapp.vanguard.dev:80" → "myapp.vanguard.dev")
  const host = hostname.split(':')[0];

  // Extract subdomain: "myapp.vanguard.dev" → "myapp"
  const subdomain = extractSubdomain(host);

  if (!subdomain) {
    console.warn(`[Proxy] ⚠️  Could not extract subdomain from: ${host}`);
    return null;
  }

  // Redis lookup
  const cachedPort = await redis.get(PROXY_KEY(subdomain));

  if (cachedPort) {
    const port = parseInt(cachedPort, 10);
    return {
      port,
      subdomain,
      target: `http://localhost:${port}`,
    };
  }

  console.warn(`[Proxy] ⚠️  No route found for subdomain: ${subdomain}`);
  return null;
}

/**
 * Registers a new route in Redis.
 * Called by the build-service after a container goes live.
 *
 * e.g. registerRoute("myapp", 34521)
 */
export async function registerRoute(subdomain: string, port: number): Promise<void> {
  await redis.set(PROXY_KEY(subdomain), String(port));
  console.log(`[Router] ✅ Registered route: ${subdomain}.${BASE_DOMAIN} → :${port}`);
}

/**
 * Removes a route from Redis (called on project deletion).
 */
export async function deregisterRoute(subdomain: string): Promise<void> {
  await redis.del(PROXY_KEY(subdomain));
  console.log(`[Router] 🗑️  Deregistered route for: ${subdomain}`);
}

/**
 * Extracts subdomain from hostname.
 * "myapp.vanguard.dev"  → "myapp"
 * "vanguard.dev"        → null (no subdomain)
 * "localhost"           → null
 */
function extractSubdomain(hostname: string): string | null {
  // For local dev: allow format "myapp.localhost"
  const parts = hostname.split('.');

  if (parts.length < 2) return null;
  if (hostname === BASE_DOMAIN) return null;

  return parts[0]; // Always the first segment
}

export { redis };
