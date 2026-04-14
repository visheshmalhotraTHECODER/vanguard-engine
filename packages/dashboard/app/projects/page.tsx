"use client";
import { motion } from "framer-motion";
import { Sidebar, Topbar } from "../components/Navigation";
import { ProjectCard, StatusBadge } from "../components/ProjectCard";
import { Plus, Search, FolderOpen } from "lucide-react";
import { useState } from "react";

// Demo data — in production, fetched from API
const DEMO_PROJECTS = [
  {
    id: "1",
    name: "my-portfolio",
    subdomain: "portfolio",
    repoUrl: "https://github.com/vishesh/my-portfolio",
    status: "SUCCESS" as const,
    commitMsg: "feat: add hero section animations",
    commitHash: "a1b2c3d",
    updatedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
  },
  {
    id: "2",
    name: "api-gateway",
    subdomain: "api",
    repoUrl: "https://github.com/vishesh/api-gateway",
    status: "BUILDING" as const,
    commitMsg: "fix: resolve race condition in queue worker",
    commitHash: "f7e8d9c",
    updatedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
  },
  {
    id: "3",
    name: "redis-dashboard",
    subdomain: "redis-ui",
    repoUrl: "https://github.com/vishesh/redis-dashboard",
    status: "FAILED" as const,
    commitMsg: "chore: update dependencies",
    commitHash: "b3a4c5e",
    updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
];

export default function ProjectsPage() {
  const [search, setSearch] = useState("");

  const filtered = DEMO_PROJECTS.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />

      <main className="flex-1 ml-[220px] flex flex-col overflow-hidden">
        <Topbar title="Projects" />

        <div className="flex-1 overflow-y-auto p-6 grid-bg">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-6"
          >
            <div>
              <h1 className="text-xl font-bold text-white">Projects</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                {DEMO_PROJECTS.length} projects ·{" "}
                {DEMO_PROJECTS.filter((p) => p.status === "SUCCESS").length} live
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 text-white text-sm font-semibold shadow-lg shadow-blue-500/20"
            >
              <Plus className="w-4 h-4" />
              New Project
            </motion.button>
          </motion.div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative mb-6"
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects..."
              className="w-full pl-9 pr-4 py-2.5 glass border border-white/5 hover:border-white/10 focus:border-blue-500/30 rounded-lg text-sm text-slate-300 placeholder-slate-600 outline-none transition-all"
            />
          </motion.div>

          {/* Projects Grid */}
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <FolderOpen className="w-10 h-10 text-slate-700 mb-3" />
              <p className="text-sm text-slate-500">No projects found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((project, i) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.08 }}
                >
                  <ProjectCard {...project} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
