"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Rocket, GitBranch, Settings,
  Terminal, Zap, Activity, ChevronRight, Box,
} from "lucide-react";
import { clsx } from "clsx";

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard",   href: "/" },
  { icon: Rocket,          label: "Projects",    href: "/projects" },
  { icon: GitBranch,       label: "Deployments", href: "/deployments" },
  { icon: Activity,        label: "Logs",        href: "/logs" },
  { icon: Settings,        label: "Settings",    href: "/settings" },
];

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, x: -16 },
  show:   { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-[220px] flex flex-col z-50 border-r border-white/[0.04]"
      style={{ background: "linear-gradient(180deg, rgba(10,10,18,0.97) 0%, rgba(5,5,10,0.97) 100%)" }}
    >
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="px-5 py-5 flex items-center gap-3 border-b border-white/[0.04]"
      >
        <div className="relative w-8 h-8">
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 blur-sm opacity-70" />
          <div className="relative w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg">
            <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
        </div>
        <div>
          <p className="text-sm font-bold tracking-tight text-white">Vanguard</p>
          <p className="text-[10px] text-slate-600 font-medium tracking-wide uppercase">Mission Control</p>
        </div>
      </motion.div>

      {/* Nav */}
      <motion.nav
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto"
      >
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <motion.div key={item.href} variants={itemVariants}>
              <Link href={item.href}>
                <motion.div
                  whileHover={{ x: 3 }}
                  whileTap={{ scale: 0.97 }}
                  className={clsx(
                    "relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors cursor-pointer group card-beam",
                    isActive ? "nav-active text-white" : "text-slate-500 hover:text-slate-200 hover:bg-white/[0.04]"
                  )}
                >
                  {/* Active background glow */}
                  {isActive && (
                    <motion.div
                      layoutId="nav-glow"
                      className="absolute inset-0 rounded-xl"
                      style={{ background: "radial-gradient(ellipse at left, rgba(99,102,241,0.15), transparent 70%)" }}
                    />
                  )}

                  <item.icon className={clsx(
                    "w-4 h-4 flex-shrink-0 transition-colors",
                    isActive ? "text-blue-400" : "text-slate-600 group-hover:text-slate-400"
                  )} />

                  <span className="font-medium">{item.label}</span>

                  {isActive && (
                    <motion.div
                      layoutId="nav-dot"
                      className="ml-auto"
                      initial={false}
                    >
                      <ChevronRight className="w-3.5 h-3.5 text-blue-400/60" />
                    </motion.div>
                  )}
                </motion.div>
              </Link>
            </motion.div>
          );
        })}
      </motion.nav>

      {/* Build Status */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="px-3 py-4 border-t border-white/[0.04] space-y-2"
      >
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-emerald-500/[0.06] border border-emerald-500/[0.12]">
          <div className="relative flex-shrink-0">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <div className="absolute inset-0 rounded-full bg-emerald-400 pulse-dot" />
          </div>
          <span className="text-[11px] font-semibold text-emerald-400">Engine Online</span>
        </div>
        <p className="text-[10px] text-slate-700 px-3">v0.1.0 · MIT License</p>
      </motion.div>
    </aside>
  );
}

export function Topbar({ title }: { title: string }) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-14 flex items-center justify-between px-6 border-b border-white/[0.04]"
      style={{ background: "rgba(5,5,10,0.8)", backdropFilter: "blur(20px)" }}
    >
      <div className="flex items-center gap-2.5">
        <Terminal className="w-3.5 h-3.5 text-slate-600" />
        <span className="text-sm font-medium text-slate-400">{title}</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/[0.06]">
          <Box className="w-3 h-3 text-slate-600" />
          <span className="text-[11px] text-slate-600 font-mono">
            {new Date().toLocaleTimeString("en-US", { hour12: false })}
          </span>
        </div>
      </div>
    </motion.header>
  );
}
