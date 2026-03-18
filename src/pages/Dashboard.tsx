import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sparkles, Plus, Search, Clock, FileText, Users, Wand2, FolderOpen,
  LayoutGrid, Star, Settings, ChevronDown, MoreHorizontal
} from "lucide-react";
import { sampleProjects } from "@/data/mockData";

const navItems = [
  { icon: Clock, label: "Recent", active: true },
  { icon: FileText, label: "Drafts" },
  { icon: Star, label: "Starred" },
  { icon: Users, label: "Team Library" },
  { icon: Wand2, label: "AI Generations" },
  { icon: FolderOpen, label: "All Projects" },
];

const thumbnailColors: Record<string, string> = {
  fintech: "from-emerald-500/20 to-cyan-500/20",
  "ai-dashboard": "from-violet-500/20 to-blue-500/20",
  marketplace: "from-orange-500/20 to-rose-500/20",
  analytics: "from-blue-500/20 to-indigo-500/20",
  ecommerce: "from-amber-500/20 to-pink-500/20",
};

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-60 border-r border-border bg-card flex flex-col shrink-0">
        <div className="p-4 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg nova-gradient flex items-center justify-center">
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
              key={item.label}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                item.active
                  ? "bg-secondary text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
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
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="border-b border-border px-8 py-4 flex items-center justify-between">
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
            <Button variant="outline" size="sm" className="border-border">
              <Plus className="w-4 h-4 mr-1.5" />
              New File
            </Button>
            <Button size="sm" className="nova-gradient border-0 text-primary-foreground hover:opacity-90">
              <Sparkles className="w-4 h-4 mr-1.5" />
              Start with AI
            </Button>
          </div>
        </header>

        <div className="p-8 space-y-8 animate-fade-in">
          {/* Section: Recent Projects */}
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold">Recent Projects</h2>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <LayoutGrid className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sampleProjects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => navigate("/editor")}
                  className="group text-left rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200"
                >
                  {/* Thumbnail */}
                  <div className={`h-40 rounded-t-xl bg-gradient-to-br ${thumbnailColors[project.thumbnail]} nova-dot-grid relative overflow-hidden`}>
                    {/* Mock artboard */}
                    <div className="absolute inset-6 rounded-lg bg-card/80 backdrop-blur-sm border border-border/50 flex flex-col items-center justify-center gap-2 p-4">
                      <div className="w-16 h-2 rounded bg-foreground/15" />
                      <div className="w-12 h-1.5 rounded bg-foreground/10" />
                      <div className="w-10 h-4 rounded nova-gradient mt-1 opacity-60" />
                    </div>
                    {project.aiGenerated && (
                      <div className="absolute top-3 right-3 w-5 h-5 rounded-full nova-gradient flex items-center justify-center shadow-lg shadow-primary/30">
                        <Sparkles className="w-2.5 h-2.5 text-primary-foreground" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 rounded-lg bg-card/80 backdrop-blur-sm border border-border hover:bg-card">
                        <MoreHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium truncate">{project.name}</h3>
                      <span className="text-[11px] text-muted-foreground">{project.screens} screens</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex -space-x-1.5">
                        {project.collaborators.map((c, i) => (
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
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
