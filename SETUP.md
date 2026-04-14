# 🚀 Vanguard — Local Setup & GitHub Webhook Guide

## Prerequisites
- Node.js >= 18
- Docker Desktop (running)
- Git

---

## 1. Start Infrastructure

```bash
# Spins up PostgreSQL + Redis in Docker
docker-compose up -d
```

---

## 2. Install Dependencies

```bash
npm install
```

---

## 3. Configure Environment

```bash
cp packages/api/.env.example packages/api/.env
cp packages/build-service/.env.example packages/build-service/.env
cp packages/proxy/env.example packages/proxy/.env
```

Edit `packages/api/.env` with your values.

---

## 4. Run Database Migrations

```bash
cd packages/api
npx prisma migrate dev --name init
npx prisma generate
```

---

## 5. Start All Services

Open **4 separate terminals**:

```bash
# Terminal 1 — Control Plane API
npm run dev:api

# Terminal 2 — Build Service Worker
npm run dev:build-service

# Terminal 3 — Reverse Proxy
npm run dev:proxy

# Terminal 4 — Dashboard
npm run dev:dashboard
```

| Service        | URL                          |
|----------------|------------------------------|
| API            | http://localhost:8000        |
| Dashboard      | http://localhost:3000        |
| Proxy          | http://localhost:8080        |
| Health Check   | http://localhost:8000/health |

---

## 6. Set Up GitHub Webhooks (Auto-Deploy on git push)

### Step 1: Generate a webhook secret
```bash
openssl rand -hex 32
```
Add this to `packages/api/.env` as `GITHUB_WEBHOOK_SECRET`.

### Step 2: Expose your local API using ngrok
```bash
# Install ngrok: https://ngrok.com
ngrok http 8000
# Copy the HTTPS URL: e.g. https://abc123.ngrok.io
```

### Step 3: Register webhook in GitHub
1. Go to your repo → **Settings** → **Webhooks** → **Add webhook**
2. **Payload URL**: `https://abc123.ngrok.io/api/webhooks/github`
3. **Content type**: `application/json`
4. **Secret**: (the secret from Step 1)
5. **Events**: Select `Just the push event`
6. Click **Add webhook**

### Step 4: Create a project in Vanguard
```bash
curl -X POST http://localhost:8000/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "name": "my-app",
    "repoUrl": "https://github.com/YOUR_USERNAME/YOUR_REPO",
    "subdomain": "myapp",
    "userId": "user_01"
  }'
```

### Step 5: Push to your repo
```bash
git push origin main
```

**Watch the magic:**
- GitHub sends webhook → Vanguard API receives it
- Build job queued in Redis
- Build service clones repo, builds Docker image
- Live logs stream to Dashboard at `http://localhost:3000/deployments/{id}`
- Container goes live at `http://myapp.localhost:8080`

---

## Architecture Recap

```
git push → GitHub Webhook → /api/webhooks/github
    → verifyHMAC (security) 
    → find project by repoUrl 
    → create Deployment record 
    → BullMQ job in Redis Queue
        → Build Worker picks up job
        → Clones repo → Docker build → Container runs
        → Every log → Redis Pub/Sub
            → API subscribes → WebSocket
                → Dashboard terminal renders live
        → Route registered: myapp.vanguard.dev → :PORT
            → Proxy serves traffic
```
