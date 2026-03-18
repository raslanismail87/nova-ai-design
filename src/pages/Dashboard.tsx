import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sparkles, Plus, Search, Clock, FileText, Users, Wand2, FolderOpen,
  LayoutGrid, Star, Settings, ChevronDown, MoreHorizontal, Trash2, Edit3,
  Copy, ExternalLink, X,
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
  { id: "1", name: "Fintech Mobile App", thumbnail: "fintech", updatedAt: "2 hours ago", collaborators: ["A", "M", "S"], screens: 12, aiGenerated: false, starred: true },
  { id: "2", name: "AI Assistant Dashboard", thumbnail: "ai-dashboard", updatedAt: "5 hours ago", collaborators: ["J", "K"], screens: 8, aiGenerated: true, starred: false },
  { id: "3", name: "Creator Marketplace", thumbnail: "marketplace", updatedAt: "1 day ago", collaborators: ["A", "R", "T", "N"], screens: 15, aiGenerated: false, starred: false },
  { id: "4", name: "Analytics Redesign", thumbnail: "analytics", updatedAt: "2 days ago", collaborators: ["M"], screens: 6, aiGenerated: true, starred: false },
  { id: "5", name: "E-commerce Checkout Flow", thumbnail: "ecommerce", updatedAt: "3 days ago", collaborators: ["A", "S"], screens: 9, aiGenerated: false, starred: false },
];

const thumbnailColors: Record<string, string> = {
  fintech: "from-emerald-500/20 to-cyan-500/20",
  "ai-dashboard": "from-violet-500/20 to-blue-500/20",
  marketplace: "from-orange-500/20 to-rose-500/20",
  analytics: "from-blue-500/20 to-indigo-500/20",
  ecommerce: "from-amber-500/20 to-pink-500/20",
};

const thumbnailAccent: Record<string, string> = {
  fintech: "bg-emerald-500/40",
  "ai-dashboard": "nova-gradient",
  marketplace: "bg-orange-500/40",
  analytics: "bg-blue-500/40",
  ecommerce: "bg-amber-500/40",
};

const navItems = [
  { icon: Clock, label: "Recent", id: "recent" },
  { icon: Star, label: "Starred", id: "starred" },
  { icon: FileText, label: "Drafts", id: "drafts" },
  { icon: Wand2, label: "AI Generations", id: "ai" },
  { icon: Users, label: "Team Library", id: "team" },
  { icon: FolderOpen, label: "All Projects", id: "all" },
];

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const saved = localStorage.getItem("nova-projects");
      return saved ? JSON.parse(saved) : defaultProjects;
    } catch {
      return defaultProjects;
    }
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [showGenModal, setShowGenModal] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [activeNav, setActiveNav] = useState("recent");
  const [contextMenu, setContextMenu] = useState<{ id: string; x: number; y: number } | null>(null);
  const navigate = useNavigate();

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem("nova-projects", JSON.stringify(projects));
  }, [projects]);

  const filtered = projects.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeNav === "starred") return matchSearch && p.starred;
    if (activeNav === "ai") return matchSearch && p.aiGenerated;
    return matchSearch;
  });

  const createProject = (name: string, aiGenerated = false) => {
    const id = String(Date.now());
    const thumbnails = ["fintech", "ai-dashboard", "marketplace", "analytics", "ecommerce"];
    const newProject: Project = {
      id,
      name: name || "Untitled Design",
      thumbnail: thumbnails[Math.floor(Math.random() * thumbnails.length)],
      updatedAt: "Just now",
      collaborators: ["Y"],
      screens: 1,
      aiGenerated,
      starred: false,
    };
    setProjects((prev) => [newProject, ...prev]);
    return id;
  };

  const deleteProject = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    setContextMenu(null);
  };

  const duplicateProject = (id: string) => {
    const project = projects.find((p) => p.id === id);
    if (!project) return;
    const newId = String(Date.now());
    setProjects((prev) => [
      { ...project, id: newId, name: `${project.name} (Copy)`, updatedAt: "Just now" },
      ...prev,
    ]);
    setContextMenu(null);
  };

  const toggleStar = (id: string) => {
    setProjects((prev) => prev.map((p) => p.id === id ? { ...p, starred: !p.starred } : p));
    setContextMenu(null);
  };

  const handleOpenProject = (project: Project) => {
    navigate(`/editor?name=${encodeURIComponent(project.name)}&id=${project.id}`);
  };

  return (
    <div className="min-h-screen bg-background flex" onClick={() => setContextMenu(null)}>
      {/* Sidebar */}
      <aside className="w-60 border-r border-border bg-card flex flex-col shrink-0">
        <div className="p-4 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg nova-gradient flex items-center justify-center shadow-md shadow-primary/20">
            <Sparkles className="w-3.5 h-3.5 text-primary-foreground" />
          </div>
          <span className="font-semibold text-sm">Nova Studio</span>
        </div>

        {/* Workspace switcher */}
        <div className="px-3 mb-2">
          <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-secondary/50 text-sm transition-colors">
            <div className="w-5 h-5 rounded bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">A</div>
            <span className="flex-1 text-left text-sm">Acme Studio</span>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </div>

        <nav className="px-3 space-y-0.5 flex-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveNav(item.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                activeNav === item.id
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
              {item.id === "starred" && (
                <span className="ml-auto text-[10px] bg-secondary rounded-full px-1.5 py-0.5">
                  {projects.filter((p) => p.starred).length}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-border">
          <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors">
            <Settings className="w-4 h-4" />
            Settings
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto" onClick={() => setContextMenu(null)}>
        {/* Header */}
        <header className="border-b border-border px-8 py-4 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-sm z-10">
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 bg-secondary/30 border-border"
            />
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="border-border" onClick={() => setShowNewModal(true)}>
              <Plus className="w-4 h-4 mr-1.5" />
              New File
            </Button>
            <Button
              size="sm"
              className="nova-gradient border-0 text-primary-foreground hover:opacity-90"
              onClick={() => setShowGenModal(true)}
            >
              <Sparkles className="w-4 h-4 mr-1.5" />
              Start with AI
            </Button>
          </div>
        </header>

        <div className="p-8 space-y-8 animate-fade-in">
          {/* Section heading */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold capitalize">
              {navItems.find((n) => n.id === activeNav)?.label || "Recent Projects"}
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{filtered.length} projects</span>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <LayoutGrid className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-2xl bg-secondary/50 flex items-center justify-center mb-4">
                <FolderOpen className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-sm font-medium mb-1">
                {searchQuery ? `No results for "${searchQuery}"` : "No projects yet"}
              </h3>
              <p className="text-xs text-muted-foreground mb-4">
                {searchQuery ? "Try a different search term" : "Create your first project to get started"}
              </p>
              {!searchQuery && (
                <Button size="sm" className="nova-gradient border-0 text-primary-foreground" onClick={() => setShowNewModal(true)}>
                  <Plus className="w-4 h-4 mr-1.5" /> Create Project
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {/* New project card */}
              <button
                onClick={() => setShowNewModal(true)}
                className="group text-left rounded-xl border-2 border-dashed border-border/50 bg-transparent hover:border-primary/30 hover:bg-primary/3 transition-all duration-300 flex flex-col items-center justify-center min-h-[220px] gap-3"
              >
                <div className="w-10 h-10 rounded-xl border-2 border-dashed border-border/60 group-hover:border-primary/40 flex items-center justify-center transition-colors">
                  <Plus className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">New Design</span>
              </button>

              {filtered.map((project) => (
                <div
                  key={project.id}
                  className="group text-left rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 relative"
                >
                  {/* Thumbnail */}
                  <button
                    className="w-full"
                    onClick={() => handleOpenProject(project)}
                  >
                    <div className={`h-40 rounded-t-xl bg-gradient-to-br ${thumbnailColors[project.thumbnail] || "from-violet-500/20 to-blue-500/20"} nova-dot-grid relative overflow-hidden`}>
                      <div className="absolute inset-6 rounded-lg bg-card/80 backdrop-blur-sm border border-border/50 flex flex-col items-center justify-center gap-2 p-4 group-hover:scale-[1.02] transition-transform duration-300">
                        <div className="w-16 h-2 rounded bg-foreground/15" />
                        <div className="w-12 h-1.5 rounded bg-foreground/10" />
                        <div className={`w-10 h-4 rounded mt-1 opacity-70 ${thumbnailAccent[project.thumbnail] || "nova-gradient"}`} />
                        <div className="flex gap-1 mt-1">
                          <div className="w-8 h-8 rounded bg-foreground/5 border border-border/30" />
                          <div className="w-8 h-8 rounded bg-foreground/5 border border-border/30" />
                          <div className="w-8 h-8 rounded bg-foreground/5 border border-border/30" />
                        </div>
                      </div>
                      {project.aiGenerated && (
                        <div className="absolute top-3 right-3 w-5 h-5 rounded-full nova-gradient flex items-center justify-center shadow-lg shadow-primary/30">
                          <Sparkles className="w-2.5 h-2.5 text-primary-foreground" />
                        </div>
                      )}
                      {project.starred && (
                        <div className="absolute top-3 left-10 text-amber-400">
                          <Star className="w-3.5 h-3.5 fill-current" />
                        </div>
                      )}
                    </div>
                  </button>

                  {/* Context menu button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setContextMenu({ id: project.id, x: e.clientX, y: e.clientY });
                    }}
                    className="absolute top-3 left-3 p-1.5 rounded-lg bg-card/80 backdrop-blur-sm border border-border opacity-0 group-hover:opacity-100 transition-opacity hover:bg-card"
                  >
                    <MoreHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>

                  {/* Info */}
                  <button className="w-full text-left p-4 space-y-2.5" onClick={() => handleOpenProject(project)}>
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium truncate">{project.name}</h3>
                      <span className="text-[11px] text-muted-foreground shrink-0 ml-2">{project.screens}s</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex -space-x-1.5">
                        {project.collaborators.slice(0, 4).map((c, i) => (
                          <div
                            key={i}
                            className="w-5 h-5 rounded-full bg-secondary border-2 border-card flex items-center justify-center text-[9px] font-medium text-muted-foreground"
                          >
                            {c}
                          </div>
                        ))}
                      </div>
                      <span className="text-[11px] text-muted-foreground">{project.updatedAt}</span>
                    </div>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed z-50 bg-card border border-border rounded-xl shadow-xl shadow-black/20 py-1 min-w-[160px] animate-fade-in"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => { const p = projects.find((p) => p.id === contextMenu.id); if (p) handleOpenProject(p); setContextMenu(null); }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-foreground hover:bg-secondary/50 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" /> Open
          </button>
          <button
            onClick={() => { const p = projects.find((p) => p.id === contextMenu.id); if (p) navigate(`/editor?name=${encodeURIComponent(p.name + ' (Copy)')}&id=${p.id}`); setContextMenu(null); }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-foreground hover:bg-secondary/50 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5 text-muted-foreground" /> Rename
          </button>
          <button
            onClick={() => duplicateProject(contextMenu.id)}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-foreground hover:bg-secondary/50 transition-colors"
          >
            <Copy className="w-3.5 h-3.5 text-muted-foreground" /> Duplicate
          </button>
          <button
            onClick={() => toggleStar(contextMenu.id)}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-foreground hover:bg-secondary/50 transition-colors"
          >
            <Star className="w-3.5 h-3.5 text-muted-foreground" />
            {projects.find((p) => p.id === contextMenu.id)?.starred ? "Unstar" : "Star"}
          </button>
          <div className="h-px bg-border my-1" />
          <button
            onClick={() => deleteProject(contextMenu.id)}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-destructive hover:bg-destructive/10 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </button>
        </div>
      )}

      {/* New Project Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl p-6 w-[380px] shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold">New Design</h3>
              <button onClick={() => setShowNewModal(false)} className="p-1 rounded-md hover:bg-secondary/50 text-muted-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground block mb-1.5">Project name</label>
                <Input
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="Untitled Design"
                  className="bg-secondary/30 border-border"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const id = createProject(newProjectName);
                      setNewProjectName("");
                      setShowNewModal(false);
                      navigate(`/editor?name=${encodeURIComponent(newProjectName || "Untitled Design")}&id=${id}`);
                    }
                  }}
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                {["Blank Canvas", "Landing Page", "Dashboard", "Mobile App", "Presentation", "Email"].map((tmpl) => (
                  <button
                    key={tmpl}
                    className="p-3 rounded-xl border border-border bg-secondary/20 hover:border-primary/30 hover:bg-primary/5 text-xs text-muted-foreground hover:text-foreground transition-all text-center"
                  >
                    {tmpl}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2 mt-5">
              <Button variant="outline" className="flex-1 border-border" onClick={() => setShowNewModal(false)}>Cancel</Button>
              <Button
                className="flex-1 nova-gradient border-0 text-primary-foreground"
                onClick={() => {
                  const id = createProject(newProjectName);
                  setNewProjectName("");
                  setShowNewModal(false);
                  navigate(`/editor?name=${encodeURIComponent(newProjectName || "Untitled Design")}&id=${id}`);
                }}
              >
                Create
              </Button>
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
