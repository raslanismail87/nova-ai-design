import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sparkles, Plus, Search, Clock, FileText, Users, Wand2, FolderOpen,
  Star, Settings, ChevronDown, MoreHorizontal, Trash2, Edit3,
  Copy, ExternalLink, X, Layers,
} from "lucide-react";
import AIGenerationModal from "@/components/editor/AIGenerationModal";

interface Project {
  id: string;
  name: string;
  thumbnail: string;
  updatedAt: string;
  collaborators: string[];
  screens: number;
  aiGenerated: boolean;
  starred: boolean;
}

const defaultProjects: Project[] = [
  { id: "1", name: "Fintech Mobile App",        thumbnail: "fintech",      updatedAt: "2h ago",  collaborators: ["A","M","S"],       screens: 12, aiGenerated: false, starred: true  },
  { id: "2", name: "AI Assistant Dashboard",    thumbnail: "ai-dashboard", updatedAt: "5h ago",  collaborators: ["J","K"],           screens:  8, aiGenerated: true,  starred: false },
  { id: "3", name: "Creator Marketplace",       thumbnail: "marketplace",  updatedAt: "1d ago",  collaborators: ["A","R","T","N"],   screens: 15, aiGenerated: false, starred: false },
  { id: "4", name: "Analytics Redesign",        thumbnail: "analytics",    updatedAt: "2d ago",  collaborators: ["M"],               screens:  6, aiGenerated: true,  starred: false },
  { id: "5", name: "E-commerce Checkout Flow",  thumbnail: "ecommerce",    updatedAt: "3d ago",  collaborators: ["A","S"],           screens:  9, aiGenerated: false, starred: false },
];

// Thumbnail accent gradients — used as top-border color strip
const THUMB_ACCENT: Record<string, string> = {
  fintech:      "from-emerald-500 to-teal-400",
  "ai-dashboard": "from-violet-500 to-indigo-400",
  marketplace:  "from-orange-500 to-rose-400",
  analytics:    "from-blue-500 to-cyan-400",
  ecommerce:    "from-amber-400 to-orange-400",
};

// Wireframe block colour per project — used inside the thumbnail preview
const THUMB_COLOR: Record<string, string> = {
  fintech:      "#10B981",
  "ai-dashboard": "#8B5CF6",
  marketplace:  "#F97316",
  analytics:    "#3B82F6",
  ecommerce:    "#F59E0B",
};

const navItems = [
  { icon: Clock,      label: "Recent",        id: "recent"  },
  { icon: Star,       label: "Starred",       id: "starred" },
  { icon: FileText,   label: "Drafts",        id: "drafts"  },
  { icon: Wand2,      label: "AI Generations",id: "ai"      },
  { icon: Users,      label: "Team Library",  id: "team"    },
  { icon: FolderOpen, label: "All Projects",  id: "all"     },
];

// ─── Project thumbnail — wireframe preview ───────────────────────────────────

function ProjectThumbnail({ project }: { project: Project }) {
  const accent = THUMB_COLOR[project.thumbnail] ?? "#8B5CF6";
  const gradient = THUMB_ACCENT[project.thumbnail] ?? "from-violet-500 to-cyan-400";

  return (
    <div className="relative h-[148px] bg-secondary/20 overflow-hidden rounded-t-[10px]">
      {/* Top gradient accent strip */}
      <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${gradient}`} />

      {/* Dot grid */}
      <div className="absolute inset-0 nova-dot-grid opacity-60" />

      {/* Wireframe mockup — centered */}
      <div className="absolute inset-0 flex flex-col items-stretch justify-start p-5 pt-6 gap-2 opacity-80">
        {/* Navbar row */}
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-[3px]" style={{ background: accent, opacity: 0.9 }} />
          <div className="h-1.5 rounded-full bg-foreground/15 flex-1" />
          <div className="h-1.5 rounded-full bg-foreground/8 w-10" />
          <div className="h-5 rounded-[4px] w-10" style={{ background: accent, opacity: 0.35 }} />
        </div>

        {/* Hero row */}
        <div className="flex gap-2 mt-0.5">
          <div className="flex-1 space-y-1.5">
            <div className="h-2.5 rounded-full bg-foreground/22 w-[75%]" />
            <div className="h-1.5 rounded-full bg-foreground/12 w-[60%]" />
            <div className="h-1.5 rounded-full bg-foreground/10 w-[50%]" />
            <div className="flex gap-1.5 mt-2">
              <div className="h-5 rounded-[4px] w-14" style={{ background: accent, opacity: 0.5 }} />
              <div className="h-5 rounded-[4px] w-14 bg-foreground/8 border border-foreground/10" />
            </div>
          </div>
          <div className="w-16 h-16 rounded-lg bg-foreground/6 border border-foreground/8 shrink-0 flex items-center justify-center">
            <div className="w-8 h-8 rounded-md bg-foreground/10" style={{ background: accent, opacity: 0.2 }} />
          </div>
        </div>

        {/* Card row */}
        <div className="flex gap-1.5 mt-auto">
          {[0.9, 0.6, 0.4].map((op, i) => (
            <div
              key={i}
              className="flex-1 h-7 rounded-[5px] bg-foreground/5 border border-foreground/8"
              style={{ opacity: op }}
            />
          ))}
        </div>
      </div>

      {/* AI badge */}
      {project.aiGenerated && (
        <div className="absolute top-3 right-3 flex items-center gap-1 px-1.5 py-0.5 rounded-full nova-gradient shadow-sm">
          <Sparkles className="w-2 h-2 text-white" />
          <span className="text-[9px] font-semibold text-white leading-none">AI</span>
        </div>
      )}

      {/* Star */}
      {project.starred && (
        <div className="absolute top-3 left-3">
          <Star className="w-3 h-3 text-amber-400 fill-amber-400 drop-shadow-sm" />
        </div>
      )}
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const saved = localStorage.getItem("nova-projects");
      return saved ? JSON.parse(saved) : defaultProjects;
    } catch {
      return defaultProjects;
    }
  });

  const [searchQuery,    setSearchQuery]    = useState("");
  const [showGenModal,   setShowGenModal]   = useState(false);
  const [showNewModal,   setShowNewModal]   = useState(false);
  const [newName,        setNewName]        = useState("");
  const [activeNav,      setActiveNav]      = useState("recent");
  const [contextMenu,    setContextMenu]    = useState<{ id: string; x: number; y: number } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem("nova-projects", JSON.stringify(projects));
  }, [projects]);

  // Close context menu on click-outside
  useEffect(() => {
    const handler = () => setContextMenu(null);
    window.addEventListener("click", handler);
    return () => window.removeEventListener("click", handler);
  }, []);

  const filtered = projects.filter((p) => {
    const q = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeNav === "starred") return q && p.starred;
    if (activeNav === "ai")      return q && p.aiGenerated;
    return q;
  });

  const createProject = (name: string, aiGenerated = false) => {
    const id = String(Date.now());
    const thumbs = ["fintech", "ai-dashboard", "marketplace", "analytics", "ecommerce"];
    const p: Project = {
      id,
      name: name || "Untitled Design",
      thumbnail: thumbs[Math.floor(Math.random() * thumbs.length)],
      updatedAt: "Just now",
      collaborators: ["Y"],
      screens: 1,
      aiGenerated,
      starred: false,
    };
    setProjects((prev) => [p, ...prev]);
    return id;
  };

  const openProject = (p: Project) =>
    navigate(`/editor?name=${encodeURIComponent(p.name)}&id=${p.id}`);

  return (
    <div className="min-h-screen bg-background flex" onClick={() => setContextMenu(null)}>

      {/* ── Sidebar ─────────────────────────────────────────────── */}
      <aside className="w-56 border-r border-border/50 bg-card/80 flex flex-col shrink-0 select-none">
        {/* Logo */}
        <div className="px-4 pt-4 pb-3 flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-[7px] nova-gradient flex items-center justify-center shadow-md shadow-primary/20 shrink-0">
            <Sparkles className="w-3 h-3 text-white" />
          </div>
          <span className="font-semibold text-sm tracking-tight">Nova Studio</span>
        </div>

        {/* Workspace switcher */}
        <div className="px-2 mb-1.5">
          <button className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-[6px] hover:bg-white/[0.04] text-sm transition-all duration-150">
            <div className="w-4 h-4 rounded-[4px] bg-primary/15 flex items-center justify-center text-[9px] font-bold text-primary shrink-0">A</div>
            <span className="flex-1 text-left text-[13px] text-foreground/80">Acme Studio</span>
            <ChevronDown className="w-3 h-3 text-muted-foreground/50" />
          </button>
        </div>

        {/* Nav */}
        <nav className="px-2 flex-1 space-y-px">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveNav(item.id)}
              className={`w-full flex items-center gap-2.5 px-2.5 py-[7px] rounded-[6px] text-[13px] transition-all duration-150 ${
                activeNav === item.id
                  ? "bg-white/[0.06] text-foreground font-medium shadow-sm shadow-black/10"
                  : "text-muted-foreground hover:text-foreground/80 hover:bg-white/[0.03]"
              }`}
            >
              <item.icon
                className={`w-3.5 h-3.5 shrink-0 transition-colors duration-150 ${
                  activeNav === item.id ? "text-primary" : "text-muted-foreground/60"
                }`}
              />
              <span className="flex-1 text-left">{item.label}</span>
              {item.id === "starred" && projects.filter((p) => p.starred).length > 0 && (
                <span className="text-[10px] font-mono text-muted-foreground/40 tabular-nums">
                  {projects.filter((p) => p.starred).length}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Bottom */}
        <div className="p-2 border-t border-border/40">
          <button className="w-full flex items-center gap-2.5 px-2.5 py-[7px] rounded-[6px] text-[13px] text-muted-foreground hover:text-foreground/80 hover:bg-white/[0.03] transition-all duration-150">
            <Settings className="w-3.5 h-3.5 text-muted-foreground/50" />
            Settings
          </button>
        </div>
      </aside>

      {/* ── Main ────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-auto min-w-0" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <header className="sticky top-0 z-10 nav-frosted px-8 py-3 flex items-center gap-4">
          {/* Search */}
          <div className="relative w-72">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/40" />
            <input
              type="search"
              placeholder="Search projects…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-8 pl-8 pr-3 rounded-lg bg-secondary/20 border border-border/50 text-[13px] text-foreground placeholder:text-muted-foreground/40 focus:border-primary/30 focus:bg-secondary/30 focus:shadow-[0_0_0_3px_hsl(263_70%_58%/0.06)] transition-all duration-200"
            />
          </div>

          <div className="flex-1" />

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowNewModal(true)}
              className="flex items-center gap-1.5 h-8 px-3.5 rounded-lg border border-border/60 bg-secondary/15 text-[13px] text-foreground/80 hover:text-foreground hover:bg-secondary/35 hover:border-border/80 transition-all duration-150 press-scale"
            >
              <Plus className="w-3.5 h-3.5" />
              New file
            </button>
            <button
              onClick={() => setShowGenModal(true)}
              className="flex items-center gap-1.5 h-8 px-3.5 rounded-lg nova-gradient text-[13px] font-medium text-white hover:opacity-90 shadow-md shadow-primary/20 transition-all duration-150 press-scale"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Start with AI
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="p-8 space-y-6 animate-fade-in">
          {/* Section header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-[15px] font-semibold tracking-tight">
                {navItems.find((n) => n.id === activeNav)?.label ?? "Recent"}
              </h2>
              <span className="text-[11px] text-muted-foreground/60 font-mono">
                {filtered.length}
              </span>
            </div>
            <button className="flex items-center gap-1 text-[11px] text-muted-foreground/60 hover:text-muted-foreground transition-colors">
              <Layers className="w-3 h-3" />
              Grid
            </button>
          </div>

          {/* Empty state */}
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-28 text-center animate-fade-in">
              <div className="w-14 h-14 rounded-2xl bg-secondary/20 flex items-center justify-center mb-5 border border-border/40">
                <FolderOpen className="w-6 h-6 text-muted-foreground/40" />
              </div>
              <p className="text-sm font-medium text-foreground/60 mb-1.5">
                {searchQuery ? `No results for "${searchQuery}"` : "No projects yet"}
              </p>
              <p className="text-xs text-muted-foreground/40 mb-6 max-w-[240px]">
                {searchQuery ? "Try a different search term" : "Create your first project to get started"}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => setShowNewModal(true)}
                  className="flex items-center gap-1.5 h-9 px-4 rounded-xl nova-gradient text-[13px] font-medium text-white hover:opacity-90 shadow-lg shadow-primary/20 press-scale"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Create project
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {/* New project card */}
              <button
                onClick={() => setShowNewModal(true)}
                className="group flex flex-col items-center justify-center min-h-[220px] rounded-[10px] border border-dashed border-border/40 hover:border-primary/25 hover:bg-primary/[0.02] transition-all duration-250"
              >
                <div className="w-9 h-9 rounded-xl border border-dashed border-border/50 group-hover:border-primary/35 group-hover:bg-primary/5 flex items-center justify-center transition-all duration-250 mb-2.5">
                  <Plus className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary transition-colors duration-250" />
                </div>
                <span className="text-[12px] text-muted-foreground/40 group-hover:text-muted-foreground/70 transition-colors duration-250">
                  New design
                </span>
              </button>

              {/* Project cards */}
              {filtered.map((project) => (
                <div
                  key={project.id}
                  className="group relative rounded-[10px] border border-border/50 bg-card hover:border-border/80 hover:shadow-xl hover:shadow-black/25 hover-lift transition-all duration-250"
                >
                  {/* More button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setContextMenu({ id: project.id, x: e.clientX, y: e.clientY });
                    }}
                    className="absolute top-3 left-3 z-10 w-6 h-6 flex items-center justify-center rounded-md bg-card/90 backdrop-blur-sm border border-border/60 opacity-0 group-hover:opacity-100 hover:bg-secondary/80 hover:border-border transition-all duration-100"
                  >
                    <MoreHorizontal className="w-3 h-3 text-muted-foreground" />
                  </button>

                  {/* Thumbnail */}
                  <button className="w-full block" onClick={() => openProject(project)}>
                    <ProjectThumbnail project={project} />
                  </button>

                  {/* Card info */}
                  <button
                    className="w-full text-left px-3.5 py-3 space-y-2 hover:bg-white/2 transition-colors duration-100 rounded-b-[10px]"
                    onClick={() => openProject(project)}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[13px] font-medium text-foreground/90 truncate">{project.name}</p>
                      <span className="text-[10px] text-muted-foreground/45 font-mono shrink-0">
                        {project.screens}s
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex -space-x-1">
                        {project.collaborators.slice(0, 4).map((c, i) => (
                          <div
                            key={i}
                            className="w-4.5 h-4.5 rounded-full bg-secondary/80 border border-card flex items-center justify-center text-[8px] font-medium text-muted-foreground/70"
                            style={{ width: 18, height: 18 }}
                          >
                            {c}
                          </div>
                        ))}
                      </div>
                      <span className="text-[11px] text-muted-foreground/40">{project.updatedAt}</span>
                    </div>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* ── Context Menu (Raycast-style) ─────────────────────────── */}
      {contextMenu && (
        <div
          className="fixed z-50 py-1 min-w-[168px] animate-scale-in"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="nova-glass rounded-[10px] overflow-hidden">
            {[
              { icon: ExternalLink, label: "Open",      action: () => { const p = projects.find(p => p.id === contextMenu.id); if (p) openProject(p); setContextMenu(null); } },
              { icon: Edit3,        label: "Rename",     action: () => setContextMenu(null) },
              { icon: Copy,         label: "Duplicate",  action: () => { const p = projects.find(p => p.id === contextMenu.id); if (p) { setProjects(prev => [{ ...p, id: String(Date.now()), name: `${p.name} (Copy)`, updatedAt: "Just now" }, ...prev]); } setContextMenu(null); } },
              { icon: Star,         label: projects.find(p => p.id === contextMenu.id)?.starred ? "Unstar" : "Star", action: () => { setProjects(prev => prev.map(p => p.id === contextMenu.id ? { ...p, starred: !p.starred } : p)); setContextMenu(null); } },
            ].map(({ icon: Icon, label, action }) => (
              <button
                key={label}
                onClick={action}
                className="w-full flex items-center gap-2.5 px-3 py-1.5 text-[13px] text-foreground/80 hover:bg-white/6 hover:text-foreground transition-colors duration-75"
              >
                <Icon className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
                {label}
              </button>
            ))}
            <div className="h-px bg-border/50 mx-2 my-1" />
            <button
              onClick={() => { setProjects(prev => prev.filter(p => p.id !== contextMenu.id)); setContextMenu(null); }}
              className="w-full flex items-center gap-2.5 px-3 py-1.5 text-[13px] text-destructive/90 hover:bg-destructive/8 hover:text-destructive transition-colors duration-75"
            >
              <Trash2 className="w-3.5 h-3.5 shrink-0" />
              Delete
            </button>
          </div>
        </div>
      )}

      {/* ── New Project Modal ────────────────────────────────────── */}
      {showNewModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md"
          onClick={() => setShowNewModal(false)}
        >
          <div
            className="bg-card border border-border/50 rounded-2xl p-5 w-[360px] shadow-2xl shadow-black/50 animate-scale-in border-shine noise-overlay"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-[14px] font-semibold tracking-tight">New design</p>
              <button
                onClick={() => setShowNewModal(false)}
                className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-secondary/50 text-muted-foreground transition-colors duration-100"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] text-muted-foreground/70 uppercase tracking-wider font-medium block mb-1.5">
                  Name
                </label>
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Untitled Design"
                  autoFocus
                  className="w-full h-8 px-3 rounded-lg bg-secondary/20 border border-border/60 text-[13px] text-foreground placeholder:text-muted-foreground/40 focus:border-primary/40 focus:bg-secondary/30 transition-all duration-150"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const id = createProject(newName);
                      setShowNewModal(false);
                      setNewName("");
                      navigate(`/editor?name=${encodeURIComponent(newName || "Untitled Design")}&id=${id}`);
                    }
                  }}
                />
              </div>

              <div>
                <label className="text-[11px] text-muted-foreground/70 uppercase tracking-wider font-medium block mb-1.5">
                  Start from
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {["Blank", "Landing", "Dashboard", "Mobile", "Slides", "Email"].map((t) => (
                    <button
                      key={t}
                      onClick={() => setNewName(t)}
                      className={`py-2 rounded-[7px] border text-[12px] transition-all duration-100 ${
                        newName === t
                          ? "border-primary/40 bg-primary/8 text-primary"
                          : "border-border/50 bg-secondary/15 text-muted-foreground/70 hover:text-foreground/80 hover:bg-secondary/25 hover:border-border/70"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-5">
              <button
                onClick={() => setShowNewModal(false)}
                className="flex-1 h-9 rounded-xl border border-border/50 text-[13px] text-muted-foreground/70 hover:text-foreground hover:border-border/80 hover:bg-secondary/20 transition-all duration-150 press-scale"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const id = createProject(newName);
                  setShowNewModal(false);
                  setNewName("");
                  navigate(`/editor?name=${encodeURIComponent(newName || "Untitled Design")}&id=${id}`);
                }}
                className="flex-1 h-9 rounded-xl nova-gradient text-[13px] font-medium text-white hover:opacity-90 shadow-lg shadow-primary/15 transition-all duration-150 press-scale"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Generation Modal */}
      <AIGenerationModal
        open={showGenModal}
        onClose={() => setShowGenModal(false)}
        onGenerate={(prompt) => {
          const id = createProject(prompt || "AI Generated Design", true);
          setShowGenModal(false);
          navigate(`/editor?name=${encodeURIComponent(prompt || "AI Generated Design")}&id=${id}`);
        }}
      />
    </div>
  );
}
