"use client";
import { useState } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { Sidebar, Topbar } from "../components/Navigation";
import { ProjectCard } from "../components/ProjectCard";
import { Plus, Search, FolderOpen, SlidersHorizontal } from "lucide-react";

const DEMO_PROJECTS = [
  {
    id: "1", name: "my-portfolio",    subdomain: "portfolio",
    repoUrl: "https://github.com/vishesh/my-portfolio",
    status: "SUCCESS" as const,
    commitMsg: "feat: add hero section with GSAP scroll animations",
    commitHash: "a1b2c3d", updatedAt: new Date(Date.now()-600_000).toISOString(),
  },
  {
    id: "2", name: "api-gateway",     subdomain: "api",
    repoUrl: "https://github.com/vishesh/api-gateway",
    status: "BUILDING" as const,
    commitMsg: "fix: resolve race condition in queue consumer",
    commitHash: "f7e8d9c", updatedAt: new Date(Date.now()-120_000).toISOString(),
  },
  {
    id: "3", name: "redis-dashboard", subdomain: "redis-ui",
    repoUrl: "https://github.com/vishesh/redis-dashboard",
    status: "FAILED" as const,
    commitMsg: "chore: bump all dependencies to latest",
    commitHash: "b3a4c5e", updatedAt: new Date(Date.now()-1_800_000).toISOString(),
  },
  {
    id: "4", name: "auth-service",    subdomain: "auth",
    repoUrl: "https://github.com/vishesh/auth-service",
    status: "SUCCESS" as const,
    commitMsg: "feat: implement JWT refresh token rotation",
    commitHash: "c9d1e2f", updatedAt: new Date(Date.now()-7_200_000).toISOString(),
  },
  {
    id: "5", name: "notification-svc",subdomain: "notif",
    repoUrl: "https://github.com/vishesh/notification-svc",
    status: "QUEUED" as const,
    commitMsg: "feat: add Slack + Discord webhook integrations",
    commitHash: "d4e5f6a", updatedAt: new Date(Date.now()-300_000).toISOString(),
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
    <div className="flex h-screen overflow-hidden noise">
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <Sidebar />

      <main className="relative flex-1 ml-[220px] flex flex-col overflow-hidden z-10">
        <Topbar title="Projects" />

        <div className="flex-1 overflow-y-auto p-6 grid-bg">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="flex items-center justify-between mb-6"
          >
            <div>
              <h1 className="text-2xl font-bold gradient-text">Projects</h1>
              <p className="text-xs text-slate-600 mt-1">
                {DEMO_PROJECTS.filter(p => p.status === "SUCCESS").length} live ·{" "}
                {DEMO_PROJECTS.length} total
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="btn-primary flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold"
            >
              <Plus className="w-4 h-4" />
              New Project
            </motion.button>
          </motion.div>

          {/* Search + Filter */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-3 mb-6"
          >
            {/* Search */}
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search projects..."
                className="w-full pl-9 pr-4 py-2.5 glass rounded-xl text-sm text-slate-300 placeholder-slate-700 outline-none focus:border-blue-500/30 transition-all border border-white/[0.06] hover:border-white/[0.10]"
              />
            </div>

            {/* Filter pills */}
            <LayoutGroup>
              <div className="flex items-center gap-1.5 glass rounded-xl p-1 border border-white/[0.06]">
                {FILTERS.map((f) => (
                  <motion.button
                    key={f}
                    onClick={() => setActiveFilter(f)}
                    className="relative px-3 py-1.5 rounded-lg text-xs font-medium transition-colors z-10"
                    style={{ color: activeFilter === f ? "#fff" : "#64748b" }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {activeFilter === f && (
                      <motion.div
                        layoutId="filter-bg"
                        className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-600/80 to-violet-600/80"
                        style={{ zIndex: -1 }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    {f}
                  </motion.button>
                ))}
              </div>
            </LayoutGroup>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2.5 glass rounded-xl border border-white/[0.06] text-slate-600 hover:text-slate-400 transition-colors"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
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
                <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-4">
                  <FolderOpen className="w-6 h-6 text-slate-700" />
                </div>
                <p className="text-sm font-medium text-slate-500">No projects found</p>
                <p className="text-xs text-slate-700 mt-1">Try a different search or filter</p>
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
                      initial={{ opacity: 0, scale: 0.92, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.92, y: -10 }}
                      transition={{ delay: i * 0.07, type: "spring", stiffness: 250, damping: 22 }}
                    >
                      <ProjectCard {...project} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
