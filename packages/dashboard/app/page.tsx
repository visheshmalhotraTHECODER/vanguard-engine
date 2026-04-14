"use client";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Sidebar, Topbar } from "./components/Navigation";
import {
  Server, Rocket, Activity, Clock,
  Zap, GitBranch, CheckCircle2, ChevronRight,
  ArrowUpRight, Layers3,
} from "lucide-react";
import Link from "next/link";

/* ── Types ─────────────────────────────── */
interface Stat {
  label: string; value: number; suffix: string;
  icon: React.ElementType; color: string; textColor: string;
  accent: string;
}

/* ── Animated Number ────────────────────── */
function AnimatedNumber({ value, suffix }: { value: number; suffix: string }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const duration = 1000;
    const step = value / (duration / 16);
    const t = setInterval(() => {
      start += step;
      if (start >= value) { setDisplay(value); clearInterval(t); }
      else setDisplay(Math.floor(start));
    }, 16);
    return () => clearInterval(t);
  }, [value]);
  return <>{display}{suffix}</>;
}

/* ── Data ───────────────────────────────── */
const STATS: Stat[] = [
  { label: "Projects",      value: 12, suffix: "",  icon: Server,   color: "from-violet-600 to-purple-700",  textColor: "text-violet-400",  accent: "card-accent-purple" },
  { label: "Deploys Today", value: 47, suffix: "",  icon: Rocket,   color: "from-blue-600 to-indigo-700",    textColor: "text-blue-400",    accent: "card-accent-blue"   },
  { label: "Live Apps",     value: 8,  suffix: "",  icon: Activity, color: "from-emerald-500 to-teal-600",   textColor: "text-emerald-400", accent: "card-accent-green"  },
  { label: "Avg Build",     value: 34, suffix: "s", icon: Clock,    color: "from-orange-500 to-amber-600",   textColor: "text-orange-400",  accent: "card-accent-orange" },
];

const PIPELINE = [
  { n:"01", title:"git push",       sub:"GitHub fires webhook",                  icon: GitBranch,    color:"text-violet-400", bg:"rgba(139,92,246,0.08)", border:"rgba(139,92,246,0.2)"  },
  { n:"02", title:"Queue Job",      sub:"BullMQ enqueues in Redis",              icon: Zap,          color:"text-blue-400",   bg:"rgba(59,130,246,0.08)", border:"rgba(59,130,246,0.2)"  },
  { n:"03", title:"Docker Build",   sub:"Isolated sandbox clones & builds",      icon: Layers3,      color:"text-cyan-400",   bg:"rgba(34,211,238,0.08)", border:"rgba(34,211,238,0.2)"  },
  { n:"04", title:"Live & Routed",  sub:"Proxy maps subdomain to container",     icon: CheckCircle2, color:"text-emerald-400",bg:"rgba(16,185,129,0.08)", border:"rgba(16,185,129,0.2)"  },
];

const SERVICES = [
  { dot:"bg-violet-400", name:"Control Plane",  tech:"Express · TypeScript", port:":8000" },
  { dot:"bg-blue-400",   name:"Build Worker",   tech:"BullMQ · Dockerode",   port:"worker" },
  { dot:"bg-amber-400",  name:"Redis",          tech:"Queue · Pub/Sub",      port:":6379" },
  { dot:"bg-cyan-400",   name:"Proxy",          tech:"Custom Node.js",       port:":8080" },
  { dot:"bg-emerald-400",name:"PostgreSQL",     tech:"Prisma ORM",           port:":5432" },
];

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] },
});

export default function Home() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <div className="flex-1 ml-56 flex flex-col min-h-screen">
        <Topbar title="Dashboard" />

        <main className="flex-1 p-6 dot-grid">
          {/* ── Hero ── */}
          <motion.div {...fade(0)} className="mb-8 flex items-end justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase"
                  style={{ background:"rgba(139,92,246,0.15)", color:"#a78bfa", border:"1px solid rgba(139,92,246,0.25)" }}>
                  v0.1.0
                </span>
                <span className="text-[10px] text-slate-600">· MIT License</span>
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-gradient leading-tight">
                Mission Control
              </h1>
              <p className="text-slate-500 mt-1.5 text-sm">
                Your self-hosted deployment engine. Ship code, not config.
              </p>
            </div>
            <Link href="/projects">
              <motion.button whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }}
                className="btn-glow flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold">
                <Rocket className="w-4 h-4" />
                New Deployment
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </motion.button>
            </Link>
          </motion.div>

          {/* ── Stats Grid ── */}
          <motion.div {...fade(0.08)} className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            {STATS.map((s, i) => (
              <motion.div key={s.label}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 + i * 0.06, duration: 0.4, ease: [0.22,1,0.36,1] }}
                whileHover={{ y: -3, transition: { duration: 0.2 } }}
                className={`glass glass-hover rounded-2xl p-5 cursor-default ${s.accent}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center`}
                    style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.3)" }}>
                    <s.icon className="w-4.5 h-4.5 text-white" size={18} />
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-700" />
                </div>
                <p className={`text-3xl font-bold ${s.textColor}`}>
                  <AnimatedNumber value={s.value} suffix={s.suffix} />
                </p>
                <p className="text-xs text-slate-600 mt-1 font-medium">{s.label}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* ── Two Col ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

            {/* Pipeline */}
            <motion.div {...fade(0.2)} className="glass rounded-2xl p-6 card-accent-purple">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background:"rgba(139,92,246,0.1)", border:"1px solid rgba(139,92,246,0.2)" }}>
                  <Zap className="w-3.5 h-3.5 text-violet-400" />
                </div>
                <h2 className="text-sm font-semibold text-white">Deployment Pipeline</h2>
              </div>

              <div className="space-y-1">
                {PIPELINE.map((p, i) => (
                  <motion.div key={p.n}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25 + i * 0.09, duration: 0.35, ease: [0.22,1,0.36,1] }}
                    whileHover={{ x: 4, transition: { duration: 0.15 } }}
                    className="flex items-center gap-3.5 p-3 rounded-xl cursor-default group"
                    style={{ background: "rgba(255,255,255,0)" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0)")}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: p.bg, border: `1px solid ${p.border}` }}>
                      <p.icon className={`w-3.5 h-3.5 ${p.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] mono text-slate-700">{p.n}</span>
                        <span className="text-xs font-semibold text-slate-100">{p.title}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 truncate mt-0.5">{p.sub}</p>
                    </div>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 opacity-60 flex-shrink-0" />
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Services */}
            <motion.div {...fade(0.25)} className="glass rounded-2xl p-6 card-accent-blue">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background:"rgba(59,130,246,0.1)", border:"1px solid rgba(59,130,246,0.2)" }}>
                  <Server className="w-3.5 h-3.5 text-blue-400" />
                </div>
                <h2 className="text-sm font-semibold text-white">Engine Services</h2>
              </div>

              <div className="space-y-0.5">
                {SERVICES.map((svc, i) => (
                  <motion.div key={svc.name}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.07, duration: 0.35 }}
                    whileHover={{ x: -3, transition: { duration: 0.15 } }}
                    className="flex items-center justify-between p-3 rounded-xl cursor-default"
                    style={{ background:"rgba(255,255,255,0)", transition:"background 0.15s" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0)")}>
                    <div className="flex items-center gap-3">
                      <span className={`w-1.5 h-1.5 rounded-full ${svc.dot} flex-shrink-0`} />
                      <div>
                        <p className="text-xs font-semibold text-slate-200">{svc.name}</p>
                        <p className="text-[10px] text-slate-600 mt-0.5">{svc.tech}</p>
                      </div>
                    </div>
                    <span className="mono text-[10px] text-slate-600 px-2 py-1 rounded-lg"
                      style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.06)" }}>
                      {svc.port}
                    </span>
                  </motion.div>
                ))}
              </div>

              {/* Live indicator row */}
              <div className="mt-4 pt-4 border-t border-white/[0.05] flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse" />
                <span className="text-[11px] text-slate-500">5 services healthy</span>
                <span className="ml-auto text-[10px] text-slate-700">uptime 99.9%</span>
              </div>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}
