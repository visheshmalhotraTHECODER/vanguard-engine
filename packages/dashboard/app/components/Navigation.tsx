"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Rocket,
  GitBranch,
  Settings,
  Terminal,
  Zap,
  Activity,
} from "lucide-react";
import { clsx } from "clsx";

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: Rocket, label: "Projects", href: "/projects" },
  { icon: GitBranch, label: "Deployments", href: "/deployments" },
  { icon: Activity, label: "Logs", href: "/logs" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-[220px] glass border-r border-white/5 flex flex-col z-50">
      {/* Logo */}
      <div className="px-6 py-5 flex items-center gap-2.5 border-b border-white/5">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold tracking-tight text-white">Vanguard</p>
          <p className="text-[10px] text-slate-500">Mission Control</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: 2 }}
                className={clsx(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all cursor-pointer",
                  isActive
                    ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                )}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                <span className="font-medium">{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400"
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom status */}
      <div className="px-4 py-4 border-t border-white/5">
        <div className="flex items-center gap-2 px-2 py-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-dot" />
          <span className="text-[11px] text-emerald-400 font-medium">Engine Running</span>
        </div>
        <p className="text-[10px] text-slate-600 mt-2 px-2">
          v0.1.0 · MIT License
        </p>
      </div>
    </aside>
  );
}

export function Topbar({ title }: { title: string }) {
  return (
    <header className="h-14 glass border-b border-white/5 flex items-center justify-between px-6">
      <div className="flex items-center gap-2">
        <Terminal className="w-4 h-4 text-slate-500" />
        <span className="text-sm font-medium text-slate-300">{title}</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="text-xs text-slate-600 font-mono">
          {new Date().toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </div>
      </div>
    </header>
  );
}
