"use client";
import { motion } from "framer-motion";
import { Sidebar, Topbar } from "./components/Navigation";
import {
  Rocket,
  Activity,
  Server,
  GitBranch,
  ArrowUpRight,
  Zap,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import Link from "next/link";

const DEMO_STATS = [
  {
    label: "Total Projects",
    value: "—",
    icon: Server,
    color: "from-blue-500 to-blue-600",
    glow: "shadow-blue-500/20",
  },
  {
    label: "Deployments Today",
    value: "—",
    icon: Rocket,
    color: "from-violet-500 to-violet-600",
    glow: "shadow-violet-500/20",
  },
  {
    label: "Live Containers",
    value: "—",
    icon: Activity,
    color: "from-emerald-500 to-emerald-600",
    glow: "shadow-emerald-500/20",
  },
  {
    label: "Avg Build Time",
    value: "—",
    icon: Clock,
    color: "from-orange-500 to-orange-600",
    glow: "shadow-orange-500/20",
  },
];

const PIPELINE_STEPS = [
  { step: "01", label: "Git Push", desc: "Webhook triggers deployment", icon: GitBranch, done: true },
  { step: "02", label: "Queue Job", desc: "BullMQ enqueues build job in Redis", icon: Zap, done: true },
  { step: "03", label: "Docker Build", desc: "Isolated container clones + builds repo", icon: Server, done: true },
  { step: "04", label: "Live", desc: "Proxy routes subdomain to new container", icon: CheckCircle, done: true },
];

export default function DashboardPage() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />

      <main className="flex-1 ml-[220px] flex flex-col overflow-hidden">
        <Topbar title="Dashboard" />

        <div className="flex-1 overflow-y-auto p-6 grid-bg">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  Mission Control
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                  Your self-hosted deployment engine. Ship code, not config.
                </p>
              </div>
              <Link href="/projects/new">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 text-white text-sm font-semibold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all"
                >
                  <Rocket className="w-4 h-4" />
                  New Deployment
                </motion.button>
              </Link>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
            {DEMO_STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className={`glass border border-white/5 rounded-xl p-5 shadow-lg ${stat.glow}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                    <stat.icon className="w-4 h-4 text-white" />
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-600" />
                </div>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Two-column layout */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Deployment Pipeline Explainer */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass border border-white/5 rounded-xl p-6"
            >
              <div className="flex items-center gap-2 mb-6">
                <Zap className="w-4 h-4 text-blue-400" />
                <h2 className="text-sm font-semibold text-white">Deployment Pipeline</h2>
              </div>

              <div className="space-y-4">
                {PIPELINE_STEPS.map((s, i) => (
                  <motion.div
                    key={s.step}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                    className="flex items-center gap-4"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                      <s.icon className="w-3.5 h-3.5 text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-slate-600">{s.step}</span>
                        <span className="text-xs font-semibold text-slate-200">{s.label}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">{s.desc}</p>
                    </div>
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Tech Stack */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass border border-white/5 rounded-xl p-6"
            >
              <div className="flex items-center gap-2 mb-6">
                <Server className="w-4 h-4 text-violet-400" />
                <h2 className="text-sm font-semibold text-white">Engine Architecture</h2>
              </div>

              <div className="space-y-3">
                {[
                  { service: "Control Plane API", tech: "Express + TypeScript", port: ":8000", color: "blue" },
                  { service: "Build Service", tech: "BullMQ Worker + Dockerode", port: "Worker", color: "violet" },
                  { service: "Job Queue", tech: "Redis + BullMQ", port: ":6379", color: "orange" },
                  { service: "Reverse Proxy", tech: "Custom Node.js Proxy", port: ":8080", color: "emerald" },
                  { service: "Database", tech: "PostgreSQL + Prisma ORM", port: ":5432", color: "sky" },
                ].map((item) => (
                  <div key={item.service} className="flex items-center justify-between py-2.5 border-b border-white/3 last:border-0">
                    <div>
                      <p className="text-xs font-medium text-slate-200">{item.service}</p>
                      <p className="text-[10px] text-slate-500">{item.tech}</p>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-1 rounded bg-white/5 text-slate-400">
                      {item.port}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
