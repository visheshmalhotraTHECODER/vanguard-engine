"use client";
import { motion } from "framer-motion";
import { GitCommitHorizontal, Globe, Clock } from "lucide-react";
import { clsx } from "clsx";

type Status = "QUEUED" | "BUILDING" | "SUCCESS" | "FAILED" | "CANCELLED";

const S: Record<Status, { label:string; cls:string; dot:string }> = {
  SUCCESS:   { label:"Live",      cls:"status-live",     dot:"bg-emerald-400" },
  BUILDING:  { label:"Building",  cls:"status-building", dot:"bg-blue-400 pulse" },
  QUEUED:    { label:"Queued",    cls:"status-queued",   dot:"bg-amber-400" },
  FAILED:    { label:"Failed",    cls:"status-failed",   dot:"bg-red-400" },
  CANCELLED: { label:"Cancelled", cls:"status-queued",   dot:"bg-slate-400" },
};

export function StatusBadge({ status }: { status: Status }) {
  const c = S[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase ${c.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${c.dot}`} />
      {c.label}
    </span>
  );
}

interface ProjectCardProps {
  name: string; subdomain: string; repoUrl: string; status: Status;
  commitMsg?: string; commitHash?: string; updatedAt: string; onClick?: () => void;
}

const ACCENT: Record<Status, string> = {
  SUCCESS:"card-accent-green", BUILDING:"card-accent-blue",
  QUEUED:"card-accent-orange", FAILED:"", CANCELLED:"",
};

function timeAgo(d: string) {
  const s = (Date.now() - +new Date(d)) / 1000;
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s/60)}m ago`;
  if (s < 86400) return `${Math.floor(s/3600)}h ago`;
  return `${Math.floor(s/86400)}d ago`;
}

export function ProjectCard({ name, subdomain, repoUrl, status, commitMsg, commitHash, updatedAt, onClick }: ProjectCardProps) {
  const repo = repoUrl.split("/").slice(-2).join("/").replace(".git","");
  return (
    <motion.div
      whileHover={{ y:-4, scale:1.005, transition:{ duration:0.18 } }}
      whileTap={{ scale:0.98 }}
      onClick={onClick}
      className={`glass glass-hover rounded-2xl p-5 cursor-pointer group relative overflow-hidden ${ACCENT[status]}`}>

      {/* Top row */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0 mr-3">
          <h3 className="text-sm font-bold text-white group-hover:text-violet-200 transition-colors truncate">{name}</h3>
          <div className="flex items-center gap-1 mt-1">
            <Globe className="w-2.5 h-2.5 text-slate-700" />
            <span className="text-[10px] mono text-slate-600 truncate">{subdomain}.vanguard.dev</span>
          </div>
        </div>
        <StatusBadge status={status} />
      </div>

      {/* Commit */}
      {commitMsg && (
        <div className="flex items-start gap-2 p-2.5 rounded-xl mb-3"
          style={{ background:"rgba(255,255,255,0.025)", border:"1px solid rgba(255,255,255,0.05)" }}>
          <GitCommitHorizontal className="w-3 h-3 text-slate-600 flex-shrink-0 mt-0.5" />
          <p className="text-[11px] text-slate-400 truncate flex-1">{commitMsg}</p>
          {commitHash && (
            <span className="mono text-[9px] text-slate-700 flex-shrink-0 px-1.5 py-0.5 rounded"
              style={{ background:"rgba(255,255,255,0.05)" }}>
              {commitHash.slice(0,7)}
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] mono text-slate-700 truncate">{repo}</span>
        <div className="flex items-center gap-1 text-[10px] text-slate-700 flex-shrink-0">
          <Clock className="w-2.5 h-2.5" />
          {timeAgo(updatedAt)}
        </div>
      </div>
    </motion.div>
  );
}
