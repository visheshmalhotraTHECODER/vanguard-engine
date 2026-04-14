"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard, Rocket, GitBranch,
  Settings, Activity, Zap, ChevronRight,
} from "lucide-react";

const NAV = [
  { icon: LayoutDashboard, label: "Dashboard",   href: "/" },
  { icon: Rocket,          label: "Projects",    href: "/projects" },
  { icon: GitBranch,       label: "Deployments", href: "/deployments" },
  { icon: Activity,        label: "Logs",        href: "/logs" },
  { icon: Settings,        label: "Settings",    href: "/settings" },
];

export function Sidebar() {
  const path = usePathname();
  return (
    <aside className="fixed inset-y-0 left-0 w-56 flex flex-col z-40 border-r border-white/[0.06]"
      style={{ background: "rgba(8,8,15,0.95)", backdropFilter: "blur(20px)" }}>

      {/* Logo */}
      <div className="px-4 py-5 flex items-center gap-3 border-b border-white/[0.06]">
        <div className="relative w-8 h-8 rounded-xl overflow-hidden flex-shrink-0"
          style={{ background: "linear-gradient(135deg,#7c3aed,#4f46e5)" }}>
          <div className="absolute inset-0 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <div className="absolute inset-0"
            style={{ background: "linear-gradient(135deg,rgba(255,255,255,0.2),transparent)" }} />
        </div>
        <div>
          <p className="text-sm font-bold text-white leading-none">Vanguard</p>
          <p className="text-[10px] text-slate-600 mt-0.5 tracking-widest uppercase">Engine</p>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {NAV.map((item, i) => {
          const active = path === item.href;
          return (
            <motion.div key={item.href}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05, type: "spring", stiffness: 300, damping: 24 }}>
              <Link href={item.href}>
                <motion.div whileHover={{ x: 2 }} whileTap={{ scale: 0.97 }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer
                    ${active ? "nav-item-active" : "text-slate-500 hover:text-slate-200 hover:bg-white/[0.04]"}`}>
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  {active && <ChevronRight className="w-3 h-3 opacity-50" />}
                </motion.div>
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* Status */}
      <div className="px-3 py-4 border-t border-white/[0.06]">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg"
          style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.15)" }}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0 pulse" />
          <span className="text-[11px] font-semibold text-emerald-400">All Systems Online</span>
        </div>
      </div>
    </aside>
  );
}

export function Topbar({ title }: { title: string }) {
  return (
    <div className="h-14 flex items-center px-6 border-b border-white/[0.06]"
      style={{ background: "rgba(8,8,15,0.8)", backdropFilter: "blur(12px)" }}>
      <div className="flex items-center gap-2 text-slate-500">
        <span className="text-slate-700">/</span>
        <span className="text-sm font-medium text-slate-300">{title}</span>
      </div>
    </div>
  );
}
