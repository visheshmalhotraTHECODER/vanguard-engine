"use client";
import { motion } from "framer-motion";
import { clsx } from "clsx";

type Status = "QUEUED" | "BUILDING" | "SUCCESS" | "FAILED" | "CANCELLED";

const STATUS_CONFIG: Record<
  Status,
  { label: string; dot: string; bg: string; text: string; border: string }
> = {
  QUEUED: {
    label: "Queued",
    dot: "bg-yellow-400",
    bg: "bg-yellow-500/10",
    text: "text-yellow-400",
    border: "border-yellow-500/20",
  },
  BUILDING: {
    label: "Building",
    dot: "bg-blue-400 pulse-dot",
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    border: "border-blue-500/20",
  },
  SUCCESS: {
    label: "Live",
    dot: "bg-emerald-400",
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "border-emerald-500/20",
  },
  FAILED: {
    label: "Failed",
    dot: "bg-red-400",
    bg: "bg-red-500/10",
    text: "text-red-400",
    border: "border-red-500/20",
  },
  CANCELLED: {
    label: "Cancelled",
    dot: "bg-slate-400",
    bg: "bg-slate-500/10",
    text: "text-slate-400",
    border: "border-slate-500/20",
  },
};

export function StatusBadge({ status }: { status: Status }) {
  const config = STATUS_CONFIG[status];
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border",
        config.bg,
        config.text,
        config.border
      )}
    >
      <span className={clsx("w-1.5 h-1.5 rounded-full", config.dot)} />
      {config.label}
    </span>
  );
}

interface ProjectCardProps {
  name: string;
  subdomain: string;
  repoUrl: string;
  status: Status;
  commitMsg?: string;
  commitHash?: string;
  updatedAt: string;
  onClick?: () => void;
}

export function ProjectCard({
  name,
  subdomain,
  repoUrl,
  status,
  commitMsg,
  commitHash,
  updatedAt,
  onClick,
}: ProjectCardProps) {
  const repoName = repoUrl.split("/").pop()?.replace(".git", "") || repoUrl;

  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.005 }}
      whileTap={{ scale: 0.995 }}
      onClick={onClick}
      className="glass glow-blue border border-white/5 hover:border-blue-500/20 rounded-xl p-5 cursor-pointer transition-all group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-white group-hover:text-blue-300 transition-colors">
            {name}
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5 font-mono">
            {subdomain}.vanguard.dev
          </p>
        </div>
        <StatusBadge status={status} />
      </div>

      {/* Commit info */}
      {commitMsg && (
        <div className="flex items-center gap-2 mb-4 py-2 px-3 rounded-lg bg-white/3 border border-white/5">
          <div className="w-1 h-4 rounded-full bg-blue-500/50" />
          <p className="text-[11px] text-slate-400 truncate flex-1">{commitMsg}</p>
          {commitHash && (
            <span className="text-[10px] font-mono text-slate-600 flex-shrink-0">
              {commitHash.slice(0, 7)}
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-[10px] text-slate-600">
        <span className="font-mono">{repoName}</span>
        <span>{formatRelativeTime(updatedAt)}</span>
      </div>
    </motion.div>
  );
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const diff = Date.now() - date.getTime();
  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
}
