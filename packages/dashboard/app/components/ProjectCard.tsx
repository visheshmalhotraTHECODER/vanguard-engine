"use client";
import { motion } from "framer-motion";
import { clsx } from "clsx";
import { GitCommitHorizontal, Globe, Clock } from "lucide-react";

type Status = "QUEUED" | "BUILDING" | "SUCCESS" | "FAILED" | "CANCELLED";

const STATUS_CONFIG: Record<Status, {
  label: string; dot: string; text: string;
  bg: string; border: string; glow: string;
}> = {
  QUEUED:    { label:"Queued",   dot:"bg-amber-400",   text:"text-amber-400",   bg:"bg-amber-400/8",   border:"border-amber-400/15",   glow:"rgba(245,158,11,0.2)"  },
  BUILDING:  { label:"Building", dot:"bg-blue-400",    text:"text-blue-400",    bg:"bg-blue-400/8",    border:"border-blue-400/15",    glow:"rgba(59,130,246,0.2)"  },
  SUCCESS:   { label:"Live",     dot:"bg-emerald-400", text:"text-emerald-400", bg:"bg-emerald-400/8", border:"border-emerald-400/15", glow:"rgba(16,185,129,0.2)"  },
  FAILED:    { label:"Failed",   dot:"bg-red-400",     text:"text-red-400",     bg:"bg-red-400/8",     border:"border-red-400/15",     glow:"rgba(239,68,68,0.2)"   },
  CANCELLED: { label:"Cancelled",dot:"bg-slate-400",   text:"text-slate-400",   bg:"bg-slate-400/8",   border:"border-slate-400/15",   glow:"rgba(100,116,139,0.2)" },
};

export function StatusBadge({ status }: { status: Status }) {
  const c = STATUS_CONFIG[status];
  return (
    <span className={clsx(
      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border",
      c.bg, c.text, c.border
    )}>
      <span className={clsx(
        "w-1.5 h-1.5 rounded-full flex-shrink-0",
        c.dot,
        status === "BUILDING" && "pulse-dot"
      )} />
      {c.label}
    </span>
  );
}

interface ProjectCardProps {
  name: string; subdomain: string; repoUrl: string;
  status: Status; commitMsg?: string; commitHash?: string;
  updatedAt: string; onClick?: () => void;
}

export function ProjectCard({
  name, subdomain, repoUrl, status, commitMsg, commitHash, updatedAt, onClick,
}: ProjectCardProps) {
  const c = STATUS_CONFIG[status];
  const repoName = repoUrl.split("/").slice(-2).join("/").replace(".git","");

  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="relative glass card-beam rounded-2xl p-5 cursor-pointer group overflow-hidden border border-white/[0.06] hover:border-white/[0.10] transition-colors"
    >
      {/* Status glow background */}
      <motion.div
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{ background: `radial-gradient(ellipse at top right, ${c.glow}15, transparent 60%)` }}
      />

      {/* Top accent line */}
      <div className={clsx(
        "absolute top-0 left-0 right-0 h-px",
        status === "SUCCESS"  && "bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent",
        status === "BUILDING" && "bg-gradient-to-r from-transparent via-blue-500/40 to-transparent",
        status === "FAILED"   && "bg-gradient-to-r from-transparent via-red-500/40 to-transparent",
        status === "QUEUED"   && "bg-gradient-to-r from-transparent via-amber-500/40 to-transparent",
        status === "CANCELLED"&& "bg-gradient-to-r from-transparent via-slate-500/40 to-transparent",
      )} />

      {/* Header */}
      <div className="relative flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0 mr-3">
          <h3 className="text-sm font-bold text-slate-100 group-hover:text-white transition-colors truncate">
            {name}
          </h3>
          <div className="flex items-center gap-1.5 mt-1">
            <Globe className="w-2.5 h-2.5 text-slate-600" />
            <p className="text-[10px] text-slate-600 font-mono truncate">
              {subdomain}.vanguard.dev
            </p>
          </div>
        </div>
        <StatusBadge status={status} />
      </div>

      {/* Commit */}
      {commitMsg && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative flex items-start gap-2.5 mb-4 p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05]"
        >
          <GitCommitHorizontal className="w-3 h-3 text-slate-600 flex-shrink-0 mt-0.5" />
          <p className="text-[11px] text-slate-400 truncate flex-1 leading-relaxed">{commitMsg}</p>
          {commitHash && (
            <span className="text-[9px] font-mono text-slate-700 flex-shrink-0 bg-white/[0.04] px-1.5 py-0.5 rounded">
              {commitHash.slice(0, 7)}
            </span>
          )}
        </motion.div>
      )}

      {/* Footer */}
      <div className="relative flex items-center justify-between">
        <span className="text-[10px] font-mono text-slate-700">{repoName}</span>
        <div className="flex items-center gap-1 text-[10px] text-slate-700">
          <Clock className="w-2.5 h-2.5" />
          {formatRelativeTime(updatedAt)}
        </div>
      </div>
    </motion.div>
  );
}

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  if (diff < 60_000)    return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff/60_000)}m ago`;
  if (diff <86_400_000) return `${Math.floor(diff/3_600_000)}h ago`;
  return `${Math.floor(diff/86_400_000)}d ago`;
}
