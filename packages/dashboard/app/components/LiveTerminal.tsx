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
  const bottomRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

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

  // Auto-scroll to bottom
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
      return "text-yellow-400";
    if (message.includes("[Vanguard]"))
      return "text-blue-300";
    if (message.includes("Step ") || message.startsWith("→"))
      return "text-violet-300";
    return "text-slate-300";
  };

  return (
    <div className="glass border border-white/5 rounded-xl overflow-hidden">
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-black/20">
        <div className="flex items-center gap-3">
          {/* macOS-style dots */}
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/70" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/70" />
          </div>
          <div className="flex items-center gap-2">
            <Terminal className="w-3 h-3 text-slate-500" />
            <span className="text-xs text-slate-500 font-mono">
              build/{deploymentId.slice(0, 8)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Connection status */}
          <div className="flex items-center gap-1.5">
            {connected && !finished ? (
              <>
                <Wifi className="w-3 h-3 text-emerald-400" />
                <span className="text-[10px] text-emerald-400 font-medium">Live</span>
              </>
            ) : finished ? (
              <>
                <CheckCheck className="w-3 h-3 text-blue-400" />
                <span className="text-[10px] text-blue-400 font-medium">Complete</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3 text-slate-500" />
                <span className="text-[10px] text-slate-500 font-medium">Connecting...</span>
              </>
            )}
          </div>
          {/* Copy button */}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-slate-300 transition-colors"
          >
            {copied ? (
              <CheckCheck className="w-3 h-3 text-emerald-400" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>

      {/* Terminal Body */}
      <div className="terminal bg-[#050810] h-[420px] overflow-y-auto p-4 space-y-0.5">
        <AnimatePresence initial={false}>
          {logs.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 text-slate-600"
            >
              <span className="text-blue-500">$</span>
              <span className="shimmer w-48 h-3 rounded" />
            </motion.div>
          )}

          {logs.map((log, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.1 }}
              className="flex gap-3 leading-relaxed"
            >
              <span className="text-slate-700 text-[10px] flex-shrink-0 mt-0.5 w-16 text-right">
                {new Date(log.timestamp).toLocaleTimeString("en-US", {
                  hour12: false,
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </span>
              <span className={clsx("flex-1 break-all", getLogColor(log.message))}>
                {log.message}
              </span>
            </motion.div>
          ))}

          {/* Blinking cursor when active */}
          {connected && !finished && (
            <motion.div
              key="cursor"
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="flex gap-3"
            >
              <span className="w-16" />
              <span className="text-blue-400">█</span>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
