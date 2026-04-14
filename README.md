<div align="center">

# ⚡ Vanguard

### The Open-Source Cloud Deployment Engine

*Because shipping code shouldn't require a PhD in DevOps.*

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Node.js](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white)](https://docker.com)
[![Next.js](https://img.shields.io/badge/Next.js-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org)

</div>

---

## 🔥 What is Vanguard?

Vanguard is a **self-hosted Platform-as-a-Service (PaaS)** that automates the full lifecycle of application deployment — from a Git push to a live, containerized app running under your own domain.

Think of it as building the engine that powers Vercel/Heroku — not just using it.

> "I don't deploy *to* platforms. I build the platform."

---

## 🏗️ System Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                        DEVELOPER                               │
│                   git push → GitHub Webhook                    │
└─────────────────────────┬──────────────────────────────────────┘
                          │
                          ▼
┌─────────────────── CONTROL PLANE ──────────────────────────────┐
│                                                                 │
│   ┌─────────────┐    ┌─────────────┐    ┌──────────────────┐   │
│   │  Vanguard   │───▶│    Redis    │───▶│  Build Service   │   │
│   │  API (REST) │    │   Queue     │    │  (Docker Worker) │   │
│   └─────────────┘    └─────────────┘    └────────┬─────────┘   │
│          │                                        │             │
│          │ WebSocket                              │ Logs        │
│          │ (Live Logs)                            │ (Pub/Sub)   │
│          ▼                                        ▼             │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │               Next.js Dashboard (Mission Control)       │  │
│   └─────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────── DATA PLANE ─────────────────────────────────┐
│   Docker Image Built → Pushed to Registry → Container Spun Up  │
└─────────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────── EDGE PLANE ─────────────────────────────────┐
│   Custom Reverse Proxy → Routes {project}.vanguard.dev         │
│   to the correct running container (Dynamic Routing)           │
└─────────────────────────────────────────────────────────────────┘
```

---

## ✨ Core Features

| Feature | Description | Status |
|---|---|---|
| 🐳 **Container Orchestration** | Full Docker Engine API integration via `dockerode` | `In Progress` |
| 📡 **Real-time Log Streaming** | Build logs streamed live via Redis Pub/Sub → WebSockets | `In Progress` |
| 🔀 **Custom Reverse Proxy** | Dynamic `{project-id}.vanguard.dev` routing to containers | `In Progress` |
| 🗄️ **PostgreSQL + Prisma** | Type-safe ORM for deployment & project state management | `In Progress` |
| 🎛️ **Mission Control Dashboard** | Next.js 14 dashboard with live metrics and terminal view | `In Progress` |
| 🔒 **Secure Build Sandboxes** | Every build runs in an isolated, resource-limited container | `Planned` |
| 🔵 **Blue-Green Deployments** | Zero-downtime deploys via traffic switching | `Planned` |
| 🔑 **GitHub OAuth + Webhooks** | Trigger deployments automatically on `git push` | `Planned` |

---

## 🛠️ Tech Stack

**Backend / Infrastructure**
- `Node.js` + `Express` + `TypeScript` — Control Plane API
- `Prisma` + `PostgreSQL` — Persistent state management
- `Redis` — Build job queue (Bull/BullMQ) + Log streaming (Pub/Sub)
- `Dockerode` — Node.js interface to the Docker Engine API
- `WebSockets (socket.io)` — Real-time log delivery to dashboard

**Frontend / Dashboard**
- `Next.js 14` (App Router) — Mission Control UI
- `Tailwind CSS` — Styling
- `Framer Motion` — Animations
- `socket.io-client` — Live log consumption

**Infrastructure**
- `Docker` + `Docker Compose` — Local orchestration
- `Nginx / Custom Proxy` — Edge routing layer

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- [Node.js](https://nodejs.org/) >= 18
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Git](https://git-scm.com/)

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/vanguard-engine.git
cd vanguard-engine
```

### 2. Start Infrastructure (Postgres + Redis)
```bash
docker-compose up -d
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Setup Environment Variables
```bash
cp packages/api/.env.example packages/api/.env
# Edit the .env file with your configs
```

### 5. Run Database Migrations
```bash
cd packages/api && npx prisma migrate dev
```

### 6. Start the Control Plane API
```bash
npm run dev:api
# API running at http://localhost:8000
```

### 7. Start the Dashboard
```bash
npm run dev:dashboard
# Dashboard at http://localhost:3000
```

---

## 📁 Project Structure

```
vanguard-engine/
├── packages/
│   ├── api/                  # Control Plane — REST API (Express + TypeScript)
│   │   ├── src/
│   │   │   ├── routes/       # API route handlers
│   │   │   ├── services/     # Business logic (build queue, docker, etc.)
│   │   │   ├── middleware/   # Auth, error handling
│   │   │   └── index.ts      # Entry point
│   │   └── prisma/
│   │       └── schema.prisma # Database schema
│   │
│   ├── build-service/        # Docker Worker — consumes job queue, runs builds
│   │   └── src/
│   │       ├── worker.ts     # Bull worker that processes build jobs
│   │       └── docker.ts     # Dockerode integration
│   │
│   ├── proxy/                # Edge Plane — Custom reverse proxy server
│   │   └── src/
│   │       └── index.ts      # Routes {project}.vanguard.dev → containers
│   │
│   └── dashboard/            # Mission Control — Next.js 14 frontend
│       └── app/
│           ├── page.tsx      # Home / Projects list
│           └── project/      # Per-project deployment view + live logs
│
├── docker-compose.yml        # Local Postgres + Redis
├── package.json              # NPM Workspaces root
└── README.md
```

---

## 🧠 Engineering Deep-Dives

### Why Redis for the Build Queue?
Instead of a simple HTTP call, deployments are queued in Redis using **BullMQ**. This means if the build service crashes mid-build, the job isn't lost — it retries automatically. This is exactly how production systems handle failure.

### How does Real-time Log Streaming work?
1. Build service runs Docker commands and captures `stdout/stderr`.
2. Each log line is **published** to a Redis channel: `logs:{deploymentId}`.
3. The API server **subscribes** to that channel and forwards each message over a **WebSocket** to the connected dashboard.
4. The dashboard displays it like a real terminal.

### How does the Custom Proxy work?
Every deployed app gets a subdomain: `{project-id}.vanguard.dev`. The proxy server:
1. Parses the incoming hostname.
2. Looks up the DB/Redis for which container port is running for that project.
3. Forwards the HTTP request to `localhost:{container-port}`.

---

## 👨‍💻 Author

**Vishesh Malhotra**
- 🎓 B.Tech IT @ MAIT, Delhi (2027)
- 💼 2x SDE Intern | Top 10 @ Microsoft Hackathon | Top 2 @ Google Hackathon
- 🔗 [LinkedIn](https://linkedin.com/in/vishesh-malhotra1)
- 📧 visheshmalhotra2023@gmail.com

---

<div align="center">

*Built to understand systems, not just use them.*

⭐ Star this repo if you think it's interesting!

</div>
