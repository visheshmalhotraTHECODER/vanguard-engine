"use client";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Sidebar, Topbar } from "./components/Navigation";
import {
  Rocket, Activity, Server, GitBranch, Zap,
  Clock, CheckCircle, ArrowUpRight, Layers,
} from "lucide-react";
import Link from "next/link";

/* ── Animated counter hook ──────────────────────── */
function useCounter(target: number, duration = 1500) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}

/* ── Mouse-tracking card tilt ───────────────────── */
function TiltCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-50, 50], [4, -4]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(x, [-50, 50], [-4, 4]), { stiffness: 300, damping: 30 });

  const handleMouse = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set(e.clientX - rect.left - rect.width / 2);
    y.set(e.clientY - rect.top - rect.height / 2);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      style={{ rotateX, rotateY, transformPerspective: 800 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const STATS = [
  { label: "Total Projects",    value: 12, icon: Server,   suffix: "",  color: "from-blue-500 to-blue-600",   shadow: "rgba(59,130,246,0.25)" },
  { label: "Deploys Today",     value: 47, icon: Rocket,   suffix: "",  color: "from-violet-500 to-violet-600",shadow: "rgba(139,92,246,0.25)" },
  { label: "Live Containers",   value: 8,  icon: Activity, suffix: "",  color: "from-emerald-500 to-teal-500", shadow: "rgba(16,185,129,0.25)" },
  { label: "Avg Build Time",    value: 34, icon: Clock,    suffix: "s", color: "from-orange-500 to-amber-500", shadow: "rgba(245,158,11,0.25)" },
];

const PIPELINE = [
  { step: "01", label: "git push",         desc: "GitHub webhook fires instantly",            icon: GitBranch },
  { step: "02", label: "Queue Job",         desc: "BullMQ enqueues in Redis (async, reliable)",icon: Zap },
  { step: "03", label: "Docker Build",      desc: "Isolated sandbox: clone → build → image",   icon: Server },
  { step: "04", label: "Live & Routed",     desc: "Proxy maps subdomain → container port",      icon: CheckCircle },
];

const SERVICES = [
  { name: "Control Plane API", tech: "Express + TypeScript", port: ":8000", dot: "bg-blue-400" },
  { name: "Build Worker",      tech: "BullMQ + Dockerode",   port: "worker",dot: "bg-violet-400" },
  { name: "Redis",             tech: "Queue + Pub/Sub",       port: ":6379", dot: "bg-orange-400" },
  { name: "Reverse Proxy",     tech: "Custom Node.js Proxy",  port: ":8080", dot: "bg-emerald-400" },
  { name: "PostgreSQL",        tech: "Prisma ORM",            port: ":5432", dot: "bg-sky-400" },
];

function StatCard({ stat, index }: { stat: typeof STATS[0]; index: number }) {
  const count = useCounter(stat.value, 1200 + index * 200);
  return (
    <TiltCard>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 + index * 0.08, type: "spring", stiffness: 200, damping: 20 }}
        whileHover={{ y: -4 }}
        className="glass card-beam rounded-2xl p-5 cursor-default relative overflow-hidden group"
      >
        {/* Inner glow on hover */}
        <motion.div
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{ background: `radial-gradient(ellipse at top left, ${stat.shadow}20, transparent 60%)` }}
        />

        <div className="relative flex items-start justify-between mb-4">
          <motion.div
            whileHover={{ rotate: 10, scale: 1.1 }}
            className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}
            style={{ boxShadow: `0 4px 20px ${stat.shadow}` }}
          >
            <stat.icon className="w-5 h-5 text-white" />
          </motion.div>
          <ArrowUpRight className="w-3.5 h-3.5 text-slate-700 group-hover:text-slate-500 transition-colors" />
        </div>

        <div className="relative">
          <motion.p className="text-3xl font-bold text-white tracking-tight">
            {count}{stat.suffix}
          </motion.p>
          <p className="text-xs text-slate-500 mt-1 font-medium">{stat.label}</p>
        </div>
      </motion.div>
    </TiltCard>
  );
}

export default function DashboardPage() {
  return (
    <div className="flex h-screen overflow-hidden noise">
      {/* Background orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <Sidebar />

      <main className="relative flex-1 ml-[220px] flex flex-col overflow-hidden z-10">
        <Topbar title="Dashboard" />

        <div className="flex-1 overflow-y-auto p-6 grid-bg">
          {/* ── Hero ─────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="mb-8 flex items-start justify-between"
          >
            <div>
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="text-3xl font-bold tracking-tight gradient-text mb-1"
              >
                Mission Control
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-sm text-slate-500"
              >
                Self-hosted deployment engine ·{" "}
                <span className="text-blue-400/80">Ship code, not config</span>
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Link href="/projects/new">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold"
                >
                  <Rocket className="w-4 h-4" />
                  New Deployment
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>

          {/* ── Stats ────────────────────────────────── */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            {STATS.map((stat, i) => <StatCard key={stat.label} stat={stat} index={i} />)}
          </div>

          {/* ── Two columns ──────────────────────────── */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">

            {/* Pipeline */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 180 }}
              className="glass card-beam rounded-2xl p-6 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl" />

              <div className="flex items-center gap-2.5 mb-6">
                <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                  <Zap className="w-3.5 h-3.5 text-blue-400" />
                </div>
                <h2 className="text-sm font-semibold text-white">Deployment Pipeline</h2>
              </div>

              <div className="space-y-1">
                {PIPELINE.map((s, i) => (
                  <motion.div
                    key={s.step}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.1, type: "spring", stiffness: 200 }}
                    whileHover={{ x: 6 }}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/[0.03] transition-colors cursor-default group"
                  >
                    {/* Step icon */}
                    <motion.div
                      whileHover={{ rotate: 12, scale: 1.1 }}
                      className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500/10 to-violet-500/10 border border-blue-500/10 flex items-center justify-center flex-shrink-0"
                    >
                      <s.icon className="w-4 h-4 text-blue-400" />
                    </motion.div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-slate-700">{s.step}</span>
                        <span className="text-xs font-semibold text-slate-200 group-hover:text-white transition-colors">{s.label}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 truncate mt-0.5">{s.desc}</p>
                    </div>

                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.7 + i * 0.1, type: "spring" }}
                    >
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500/70 flex-shrink-0" />
                    </motion.div>
                  </motion.div>
                ))}
              </div>

              {/* Connecting line decoration */}
              <div className="absolute left-[42px] top-[88px] bottom-[60px] w-px bg-gradient-to-b from-blue-500/20 via-violet-500/20 to-transparent" />
            </motion.div>

            {/* Services */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, type: "spring", stiffness: 180 }}
              className="glass card-beam rounded-2xl p-6 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-violet-500/5 rounded-full blur-3xl" />

              <div className="flex items-center gap-2.5 mb-6">
                <div className="w-7 h-7 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                  <Layers className="w-3.5 h-3.5 text-violet-400" />
                </div>
                <h2 className="text-sm font-semibold text-white">Engine Architecture</h2>
              </div>

              <div className="space-y-1">
                {SERVICES.map((svc, i) => (
                  <motion.div
                    key={svc.name}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + i * 0.08, type: "spring", stiffness: 200 }}
                    whileHover={{ x: -4 }}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.03] transition-colors group cursor-default"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-1.5 h-1.5 rounded-full ${svc.dot} flex-shrink-0`} />
                      <div>
                        <p className="text-xs font-semibold text-slate-200 group-hover:text-white transition-colors">{svc.name}</p>
                        <p className="text-[10px] text-slate-600 mt-0.5">{svc.tech}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-1 rounded-lg bg-white/[0.04] border border-white/[0.06] text-slate-500 group-hover:text-slate-400 transition-colors">
                      {svc.port}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
