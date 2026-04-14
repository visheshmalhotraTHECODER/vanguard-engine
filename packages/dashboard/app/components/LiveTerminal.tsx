"use client";
import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, Copy, CheckCheck, Wifi, WifiOff } from "lucide-react";
import { clsx } from "clsx";

interface LogEntry {
  timestamp: string;
  message: string;
  done?: boolean;
  success?: boolean;
}

interface LiveTerminalProps {
  deploymentId: string;
  apiUrl?: string;
}

export function LiveTerminal({
  deploymentId,
  apiUrl = "http://localhost:8000",
}: LiveTerminalProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [connected, setConnected] = useState(false);
  const [finished, setFinished] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  // Prevent hydration errors with time rendering
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const socket = io(apiUrl, { transports: ["websocket"] });
    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      setLogs([]);
      socket.emit("subscribe:logs", deploymentId);
    });

    socket.on("disconnect", () => setConnected(false));

    socket.on("log", (entry: LogEntry) => {
      setLogs((prev) => [...prev, entry]);
      if (entry.done) {
        setFinished(true);
        socket.disconnect();
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [deploymentId, apiUrl]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const handleCopy = async () => {
    const text = logs.map((l) => `[${l.timestamp}] ${l.message}`).join("\n");
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getLogColor = (message: string): string => {
    if (message.includes("❌") || message.includes("ERROR") || message.includes("failed"))
      return "text-red-400";
    if (message.includes("✅") || message.includes("complete") || message.includes("success"))
      return "text-emerald-400";
    if (message.includes("⚠️") || message.includes("warning") || message.includes("WARN"))
      return "text-amber-400";
    if (message.includes("[Vanguard]") || message.includes("VND"))
      return "text-violet-400 font-semibold";
    if (message.includes("Step ") || message.startsWith("→"))
      return "text-blue-400";
    return "text-slate-300";
  };

  if (!mounted) {
    return <div className="h-[460px] bg-[#05050A]" />; // Placeholder during SSR
  }

  return (
    <div className="flex flex-col h-[460px] terminal-bg overflow-hidden relative">
      {/* Terminal Header */}
      <div className="flex flex-none items-center justify-between px-4 py-2.5 border-b border-white/[0.08]"
           style={{ background: "rgba(255,255,255,0.02)" }}>
        <div className="flex items-center gap-4">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80 border border-red-500/50" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80 border border-amber-500/50" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80 border border-emerald-500/50" />
          </div>
          <div className="flex items-center gap-2 px-2 py-1 bg-white/[0.03] rounded-md border border-white/[0.05]">
            <Terminal className="w-3 h-3 text-slate-500" />
            <span className="text-[10px] text-slate-400 mono">
              vanguard-cli ~ {deploymentId.slice(0, 8)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            {connected && !finished ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-400 pulse" />
                <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">Streaming</span>
              </>
            ) : finished ? (
              <>
                <CheckCheck className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-[10px] text-blue-400 font-semibold uppercase tracking-wider">Finished</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Connecting</span>
              </>
            )}
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2 py-1 rounded bg-white/[0.05] hover:bg-white/[0.1] transition-colors text-[10px] font-semibold tracking-wide text-slate-400 hover:text-slate-200 uppercase"
          >
            {copied ? (
              <CheckCheck className="w-3 h-3 text-emerald-400" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
            {copied ? <span className="text-emerald-400">Copied</span> : "Copy"}
          </motion.button>
        </div>
      </div>

      {/* Terminal Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-0.5 mono">
        <AnimatePresence initial={false}>
          {logs.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-3 text-slate-600"
            >
              <span className="text-violet-500 font-bold">❯</span>
              <span className="shimmer w-48 h-3.5 rounded" />
            </motion.div>
          )}

          {logs.map((log, i) => {
            // Render nice time
            const d = new Date(log.timestamp);
            const timeStr = `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}:${d.getSeconds().toString().padStart(2,'0')}`;

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.15 }}
                className="flex gap-4 group hover:bg-white/[0.02] -mx-2 px-2 py-0.5 rounded"
              >
                <div className="flex items-center gap-3 w-[100px] flex-shrink-0 opacity-50 group-hover:opacity-100 transition-opacity">
                   <span className="text-slate-600">│</span>
                   <span className="text-slate-500 text-[10px]">{timeStr}</span>
                </div>
                <span className={clsx("flex-1 whitespace-pre-wrap break-all", getLogColor(log.message))}>
                  {log.message}
                </span>
              </motion.div>
            );
          })}

          {connected && !finished && (
            <motion.div
              key="cursor"
              className="flex gap-4 -mx-2 px-2"
            >
              <div className="w-[100px] flex-shrink-0" />
              <motion.span
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
                className="text-violet-500 inline-block w-2.5 h-3.5 bg-violet-500 mt-1"
              />
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={bottomRef} className="h-4" />
      </div>

    </div>
  );
}
