import http from 'http';
import httpProxy from 'http-proxy';
import dotenv from 'dotenv';
import { resolveRoute } from './router.js';

dotenv.config();

const PORT = parseInt(process.env.PROXY_PORT || '8080', 10);
const BASE_DOMAIN = process.env.BASE_DOMAIN || 'vanguard.dev';

// ─── Proxy Instance ───────────────────────────────────────────
const proxy = httpProxy.createProxyServer({
  changeOrigin: true,
  ws: true, // Also proxy WebSocket connections
});

// ─── Proxy Error Handler ──────────────────────────────────────
proxy.on('error', (err, req, res) => {
  console.error(`[Proxy] ❌ Error proxying request:`, err.message);
  if (res instanceof http.ServerResponse) {
    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        error: 'Bad Gateway',
        message: 'The upstream container is not responding.',
        detail: err.message,
      })
    );
  }
});

// ─── HTTP Server ──────────────────────────────────────────────
const server = http.createServer(async (req, res) => {
  const hostname = req.headers.host || '';
  const method = req.method || 'GET';
  const url = req.url || '/';

  console.log(`[Proxy] → ${method} ${hostname}${url}`);

  // ── Resolve the route ───────────────────────────────────────
  const route = await resolveRoute(hostname);

  if (!route) {
    // No container found for this subdomain
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        error: 'Not Found',
        message: `No deployment found for: ${hostname}`,
        hint: `Make sure your project is deployed and the subdomain matches.`,
      })
    );
    return;
  }

  console.log(`[Proxy] ✅ Routing ${hostname} → ${route.target}`);

  // ── Forward the request ─────────────────────────────────────
  proxy.web(req, res, { target: route.target });
});

// ─── WebSocket Proxying ───────────────────────────────────────
// If the deployed app itself uses WebSockets, we proxy those too
server.on('upgrade', async (req, socket, head) => {
  const hostname = req.headers.host || '';
  const route = await resolveRoute(hostname);

  if (!route) {
    socket.destroy();
    return;
  }

  console.log(`[Proxy] ⚡ WebSocket upgrade: ${hostname} → ${route.target}`);
  proxy.ws(req, socket, head, { target: route.target });
});

// ─── Start ───────────────────────────────────────────────────
server.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════╗
║          ⚡ Vanguard Reverse Proxy — ONLINE          ║
╠══════════════════════════════════════════════════════╣
║  Listening on   : http://localhost:${PORT}               ║
║  Base Domain    : ${BASE_DOMAIN}                   ║
║  Routing        : {subdomain}.${BASE_DOMAIN} → container  ║
║  WebSocket      : ✅ Enabled                         ║
╚══════════════════════════════════════════════════════╝
  `);
});
