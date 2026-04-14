"use client";
import { use } from "react";
import { motion } from "framer-motion";
import { Sidebar, Topbar } from "../../components/Navigation";
import { StatusBadge } from "../../components/ProjectCard";
import { LiveTerminal } from "../../components/LiveTerminal";
import {
  ArrowLeft,
  GitBranch,
  Clock,
  ExternalLink,
  RefreshCw,
  Server,
} from "lucide-react";
import Link from "next/link";

interface Props {
  params: Promise<{ id: string }>;
}

// In production: fetch from /api/deployments/:id
const DEMO_DEPLOYMENT = {
  id: "deploy_01",
  status: "BUILDING" as const,
  commitMsg: "feat: add WebSocket log streaming to dashboard",
  commitHash: "a1b2c3d4e5f6",
  projectName: "api-gateway",
  subdomain: "api",
  repoUrl: "https://github.com/vishesh/api-gateway",
  containerPort: 34521,
  startedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
  createdAt: new Date(Date.now() - 2.5 * 60 * 1000).toISOString(),
};

export default function DeploymentPage({ params }: Props) {
  const { id } = use(params);
  const deployment = { ...DEMO_DEPLOYMENT, id };

  const elapsed = deployment.startedAt
    ? Math.floor((Date.now() - new Date(deployment.startedAt).getTime()) / 1000)
    : 0;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />

      <main className="flex-1 ml-[220px] flex flex-col overflow-hidden">
        <Topbar title={`Deployment · ${id.slice(0, 8)}`} />

        <div className="flex-1 overflow-y-auto p-6 grid-bg">
          {/* Back + Header */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Link
              href="/projects"
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 mb-4 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Projects
            </Link>

            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-xl font-bold text-white">
                    {deployment.projectName}
                  </h1>
                  <StatusBadge status={deployment.status} />
                </div>
                <p className="text-xs text-slate-500 font-mono">
                  {deployment.subdomain}.vanguard.dev
                </p>
              </div>

              <div className="flex items-center gap-2">
                {deployment.status === "SUCCESS" && (
                  <a
                    href={`http://${deployment.subdomain}.localhost:8080`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium hover:bg-emerald-500/15 transition-all"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Visit App
                    </motion.button>
                  </a>
                )}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg glass border border-white/5 text-slate-400 text-xs font-medium hover:text-slate-200 transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Redeploy
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Metadata Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {[
              {
                icon: GitBranch,
                label: "Commit",
                value: deployment.commitHash.slice(0, 7),
                sub: deployment.commitMsg,
              },
              {
                icon: Clock,
                label: "Duration",
                value: `${elapsed}s`,
                sub: "and counting...",
              },
              {
                icon: Server,
                label: "Container Port",
                value: deployment.containerPort
                  ? `:${deployment.containerPort}`
                  : "—",
                sub: "host mapping",
              },
              {
                icon: GitBranch,
                label: "Deploy ID",
                value: id.slice(0, 8),
                sub: "full: " + id.slice(0, 16) + "...",
              },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.06 }}
                className="glass border border-white/5 rounded-xl p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <item.icon className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider">
                    {item.label}
                  </span>
                </div>
                <p className="text-sm font-mono font-semibold text-white">
                  {item.value}
                </p>
                <p className="text-[10px] text-slate-600 mt-0.5 truncate">
                  {item.sub}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Live Terminal */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400 pulse-dot" />
              <h2 className="text-sm font-semibold text-slate-200">
                Build Logs
              </h2>
              <span className="text-[10px] text-slate-600">
                · Real-time via WebSocket → Redis Pub/Sub
              </span>
            </div>
            <LiveTerminal deploymentId={id} />
          </motion.div>
        </div>
      </main>
    </div>
  );
}
