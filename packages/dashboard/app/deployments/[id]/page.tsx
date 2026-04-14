"use client";
import { use } from "react";
import { motion } from "framer-motion";
import { Sidebar, Topbar } from "../../components/Navigation";
import { StatusBadge } from "../../components/ProjectCard";
import { LiveTerminal } from "../../components/LiveTerminal";
import {
  ArrowLeft, GitBranch, Clock,
  ExternalLink, RefreshCw, Server,
  TerminalSquare
} from "lucide-react";
import Link from "next/link";

interface Props {
  params: Promise<{ id: string }>;
}

const DEMO_DEPLOYMENT = {
  id: "deploy_01",
  status: "BUILDING" as const,
  commitMsg: "feat: add WebSocket log streaming to dashboard",
  commitHash: "a1b2c3d4e5f6",
  projectName: "api-gateway",
  subdomain: "api",
  repoUrl: "https://github.com/vishesh/api-gateway",
  containerPort: 34521,
  // Static string to prevent hydration errors during demo
  duration: "45s"
};

export default function DeploymentPage({ params }: Props) {
  const { id } = use(params);
  const deployment = { ...DEMO_DEPLOYMENT, id };

  return (
    <div className="flex min-h-screen page-bg">
      <Sidebar />

      <div className="flex-1 ml-56 flex flex-col min-h-screen">
        <Topbar title={`Deployments / ${id.slice(0, 8)}`} />

        <main className="flex-1 p-6 dot-grid overflow-y-auto">
          {/* Back + Header */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Link
              href="/projects"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-300 mb-5 transition-colors uppercase tracking-wider"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Projects
            </Link>

            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-1.5">
                  <h1 className="text-3xl font-bold text-gradient">
                    {deployment.projectName}
                  </h1>
                  <div className="mt-1">
                     <StatusBadge status={deployment.status} />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <span className="mono">{deployment.subdomain}.vanguard.dev</span>
                  <span>·</span>
                  <a href={deployment.repoUrl} target="_blank" rel="noreferrer" className="hover:text-blue-400 transition-colors">
                    GitHub Repo ↗
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {deployment.status === "SUCCESS" && (
                  <a
                    href={`http://${deployment.subdomain}.localhost:8080`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold hover:bg-emerald-500/20 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Visit App
                    </motion.button>
                  </a>
                )}
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl glass text-slate-300 text-sm font-semibold hover:text-white transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Redeploy
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Metadata Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { icon: GitBranch, label: "Commit", value: deployment.commitHash.slice(0, 7), sub: deployment.commitMsg },
              { icon: Clock,     label: "Duration", value: deployment.duration, sub: "and counting..." },
              { icon: Server,    label: "Port mapping", value: `:${deployment.containerPort}`, sub: "internal host port" },
              { icon: TerminalSquare, label: "Deploy ID", value: id.slice(0, 8), sub: `id: ${id}` },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                className="glass rounded-2xl p-4"
              >
                <div className="flex items-center gap-2 mb-2.5">
                  <div className="w-6 h-6 rounded bg-white/[0.05] flex items-center justify-center">
                    <item.icon className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
                    {item.label}
                  </span>
                </div>
                <p className="text-xl font-bold text-white mono mb-0.5">
                  {item.value}
                </p>
                <p className="text-xs text-slate-500 truncate">
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
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg glass flex items-center justify-center border-blue-500/20 bg-blue-500/5">
                 <TerminalSquare className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-200">
                  Build Logs
                </h2>
                <p className="text-xs text-slate-500">
                  Real-time via WebSocket → Redis Pub/Sub
                </p>
              </div>
            </div>
            
            <div className="rounded-2xl overflow-hidden glass border-white/[0.1] shadow-2xl">
              <LiveTerminal deploymentId={id} />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
