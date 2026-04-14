"use client";
import { useState } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { Sidebar, Topbar } from "../components/Navigation";
import { ProjectCard } from "../components/ProjectCard";
import { Plus, Search, FolderOpen, SlidersHorizontal } from "lucide-react";

// Using static dates/strings to completely prevent hydration mismatches
const DEMO_PROJECTS = [
  {
    id: "1", name: "my-portfolio",    subdomain: "portfolio",
    repoUrl: "https://github.com/vishesh/my-portfolio",
    status: "SUCCESS" as const,
    commitMsg: "feat: add hero section with GSAP scroll animations",
    commitHash: "a1b2c3d", updatedAt: "2026-04-14T10:00:00Z",
  },
  {
    id: "2", name: "api-gateway",     subdomain: "api",
    repoUrl: "https://github.com/vishesh/api-gateway",
    status: "BUILDING" as const,
    commitMsg: "fix: resolve race condition in queue consumer",
    commitHash: "f7e8d9c", updatedAt: "2026-04-14T10:15:00Z",
  },
  {
    id: "3", name: "redis-dashboard", subdomain: "redis-ui",
    repoUrl: "https://github.com/vishesh/redis-dashboard",
    status: "FAILED" as const,
    commitMsg: "chore: bump all dependencies to latest",
    commitHash: "b3a4c5e", updatedAt: "2026-04-14T09:30:00Z",
  },
  {
    id: "4", name: "auth-service",    subdomain: "auth",
    repoUrl: "https://github.com/vishesh/auth-service",
    status: "SUCCESS" as const,
    commitMsg: "feat: implement JWT refresh token rotation",
    commitHash: "c9d1e2f", updatedAt: "2026-04-13T15:00:00Z",
  },
  {
    id: "5", name: "notification-svc",subdomain: "notif",
    repoUrl: "https://github.com/vishesh/notification-svc",
    status: "QUEUED" as const,
    commitMsg: "feat: add Slack + Discord webhook integrations",
    commitHash: "d4e5f6a", updatedAt: "2026-04-14T10:18:00Z",
  },
];

const FILTERS = ["All", "Live", "Building", "Failed"] as const;
type Filter = typeof FILTERS[number];

const STATUS_FILTER_MAP: Record<Filter, string | null> = {
  All: null, Live: "SUCCESS", Building: "BUILDING", Failed: "FAILED",
};

export default function ProjectsPage() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<Filter>("All");

  const filtered = DEMO_PROJECTS.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const filterStatus = STATUS_FILTER_MAP[activeFilter];
    const matchFilter = filterStatus ? p.status === filterStatus : true;
    return matchSearch && matchFilter;
  });

  return (
    <div className="flex min-h-screen page-bg">
      <Sidebar />

      <div className="flex-1 ml-56 flex flex-col min-h-screen">
        <Topbar title="Projects" />

        <main className="flex-1 p-6 dot-grid overflow-y-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center justify-between mb-8"
          >
            <div>
              <h1 className="text-3xl font-bold text-gradient mb-1">Projects</h1>
              <p className="text-sm text-slate-500">
                {DEMO_PROJECTS.filter(p => p.status === "SUCCESS").length} live ·{" "}
                {DEMO_PROJECTS.length} total repositories
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.97 }}
              className="btn-glow flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold"
            >
              <Plus className="w-4 h-4" />
              New Project
            </motion.button>
          </motion.div>

          {/* Search + Filter */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="flex items-center gap-4 mb-6"
          >
            {/* Search */}
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search projects..."
                className="w-full pl-10 pr-4 py-2.5 glass rounded-xl text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-violet-500/50 transition-all focus:box-shadow-[0_0_0_1px_rgba(139,92,246,0.3)]"
              />
            </div>

            {/* Filter pills */}
            <LayoutGroup>
              <div className="flex items-center gap-1 glass rounded-xl p-1">
                {FILTERS.map((f) => {
                  const isActive = activeFilter === f;
                  return (
                    <motion.button
                      key={f}
                      onClick={() => setActiveFilter(f)}
                      className="relative px-4 py-1.5 rounded-lg text-sm font-medium z-10 transition-colors"
                      style={{ color: isActive ? "#fff" : "#94a3b8" }}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="active-filter-bg"
                          className="absolute inset-0 rounded-lg bg-white/[0.08] border border-white/[0.1]"
                          style={{ zIndex: -1 }}
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                      {f}
                    </motion.button>
                  );
                })}
              </div>
            </LayoutGroup>

            <motion.button
              whileHover={{ bg: "rgba(255,255,255,0.05)" }}
              className="p-2.5 glass rounded-xl text-slate-500 hover:text-slate-300 transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </motion.button>
          </motion.div>

          {/* Grid */}
          <AnimatePresence mode="popLayout">
            {filtered.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center justify-center py-32 text-center"
              >
                <div className="w-16 h-16 rounded-2xl glass flex items-center justify-center mb-4">
                  <FolderOpen className="w-8 h-8 text-slate-600" />
                </div>
                <p className="text-base font-semibold text-slate-300">No projects found</p>
                <p className="text-sm text-slate-500 mt-1 max-w-sm">
                  We couldn't find any projects matching your search and filter criteria.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="grid"
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
              >
                <AnimatePresence>
                  {filtered.map((project, i) => (
                    <motion.div
                      key={project.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: -10 }}
                      transition={{ 
                        opacity: { duration: 0.2 },
                        layout: { type: "spring", bounce: 0.3, duration: 0.6 }
                      }}
                    >
                      <ProjectCard {...project} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
