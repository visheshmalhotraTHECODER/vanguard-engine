"use client";
import { signIn } from "next-auth/react";
import { Github, Zap } from "lucide-react";
import { motion } from "framer-motion";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center page-bg p-4 relative overflow-hidden noise">
      {/* Visual background accents */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-[20%] -translate-y-[80%] w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[80px] pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="relative z-10 w-full max-w-sm"
      >
        <div className="glass rounded-3xl p-8 card-accent-purple shadow-2xl relative overflow-hidden group">
          {/* subtle glow inside card on hover */}
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="relative mb-8 text-center flex flex-col items-center">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: "spring" }}
              className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-[0_0_30px_rgba(109,40,217,0.3)] mb-5"
            >
              <Zap className="w-7 h-7 text-white" strokeWidth={2.5} />
            </motion.div>
            
            <h1 className="text-2xl font-bold tracking-tight text-white mb-2">
              Vanguard Engine
            </h1>
            <p className="text-sm text-slate-400 font-medium tracking-wide">
              AUTHORIZED PERSONNEL ONLY
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <button
              onClick={() => signIn("github", { callbackUrl: "/" })}
              className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl text-sm font-semibold transition-all shadow-lg"
              style={{
                background: "linear-gradient(180deg, #24292e 0%, #1b1f23 100%)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#fff"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 8px 30px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "0 4px 15px rgba(0,0,0,0.4)";
              }}
            >
              <Github className="w-5 h-5" />
              Sign in with GitHub
            </button>
          </motion.div>
          
          <div className="mt-8 text-center border-t border-white/[0.05] pt-6">
             <p className="text-[10px] text-slate-500 mono">PaaS CONTROL PLANE</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
