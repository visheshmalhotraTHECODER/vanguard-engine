"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Rocket, AlertCircle } from "lucide-react";

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function NewProjectModal({ isOpen, onClose, onSuccess }: NewProjectModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [name, setName] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [subdomain, setSubdomain] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("http://localhost:8000/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          repoUrl,
          subdomain,
          userId: "user_default" // Hardcoded for now
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to create project");
      }

      // Automatically trigger a deployment
      const deployRes = await fetch("http://localhost:8000/api/deployments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: data.data.id,
          commitMsg: "Initial Deployment",
        }),
      });

      if (!deployRes.ok) {
        console.warn("Project created, but initial deployment trigger failed.");
      }

      onSuccess();
      onClose();
      // Reset form
      setName(""); setRepoUrl(""); setSubdomain("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
          >
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md glass rounded-2xl p-6 border border-white/10 shadow-2xl relative overflow-hidden"
            >
              {/* Decorative gradient top */}
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-violet-500 to-blue-500" />
              
              <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-slate-300">
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                  <Rocket className="w-5 h-5 text-violet-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Deploy New App</h2>
                  <p className="text-xs text-slate-500">Connect a repository and push to live.</p>
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-2 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Project Name</label>
                  <input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="my-awesome-app"
                    className="w-full px-3 py-2 bg-black/20 border border-white/5 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-violet-500/50 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Subdomain</label>
                  <div className="flex items-center">
                    <input
                      required
                      value={subdomain}
                      onChange={(e) => setSubdomain(e.target.value)}
                      placeholder="myapp"
                      className="w-full px-3 py-2 bg-black/20 border border-white/5 border-r-0 rounded-l-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-violet-500/50 transition-colors"
                    />
                    <span className="px-3 py-2 bg-black/40 border border-white/5 border-l-0 rounded-r-xl text-sm text-slate-500 flex-shrink-0">
                      .vanguard.dev
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">GitHub Repository URL</label>
                  <input
                    required
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    placeholder="https://github.com/username/repo"
                    className="w-full px-3 py-2 bg-black/20 border border-white/5 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-violet-500/50 transition-colors"
                  />
                </div>

                <div className="pt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={loading}
                    type="submit"
                    className="w-full py-2.5 rounded-xl btn-primary text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                      "Deploy Project"
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
