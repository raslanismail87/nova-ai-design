import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import EditorToolbar from "@/components/editor/EditorToolbar";
import EditorLeftSidebar from "@/components/editor/EditorLeftSidebar";
import EditorCanvas from "@/components/editor/EditorCanvas";
import EditorRightSidebar from "@/components/editor/EditorRightSidebar";
import AIChatPanel from "@/components/editor/AIChatPanel";
import AIGenerationModal from "@/components/editor/AIGenerationModal";
import { CanvasProvider, useCanvas } from "@/contexts/CanvasContext";
import { toast } from "sonner";
import { Sparkles, PanelRight } from "lucide-react";

// ─── Command Palette ──────────────────────────────────────────────────────────

interface CommandItem {
  id: string;
  label: string;
  shortcut?: string;
  action: () => void;
  group?: string;
}

function CommandPalette({ onClose, commands }: { onClose: () => void; commands: CommandItem[] }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const filtered = query
    ? commands.filter(
        (c) =>
          c.label.toLowerCase().includes(query.toLowerCase()) ||
          (c.group && c.group.toLowerCase().includes(query.toLowerCase()))
      )
    : commands;

  const grouped = filtered.reduce<Record<string, CommandItem[]>>((acc, cmd) => {
    const g = cmd.group || "Actions";
    if (!acc[g]) acc[g] = [];
    acc[g].push(cmd);
    return acc;
  }, {});

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[18vh] bg-foreground/30 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="w-[520px] rounded-2xl bg-card border border-border/60 shadow-2xl shadow-foreground/10 overflow-hidden animate-slide-down border-shine noise-overlay"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border/50">
          <div className="w-5 h-5 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
            <span className="text-primary text-[11px] font-mono font-medium">⌘</span>
          </div>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search commands…"
            className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/50"
            onKeyDown={(e) => {
              if (e.key === "Escape") onClose();
              if (e.key === "Enter" && filtered.length > 0) {
                filtered[0].action();
                onClose();
              }
            }}
          />
          <kbd className="kbd">Esc</kbd>
        </div>

        <div className="max-h-[360px] overflow-auto py-1.5">
          {Object.keys(grouped).length === 0 ? (
            <div className="px-4 py-12 text-center">
              <p className="text-sm text-muted-foreground/60">No commands found</p>
              <p className="text-xs text-muted-foreground/30 mt-1">Try a different search</p>
            </div>
          ) : (
            Object.entries(grouped).map(([group, items]) => (
              <div key={group}>
                <p className="px-4 py-1.5 text-[10px] font-medium text-muted-foreground/50 uppercase tracking-wider">{group}</p>
                {items.map((cmd) => (
                  <button
                    key={cmd.id}
                    onClick={() => { cmd.action(); onClose(); }}
                    className="w-full flex items-center justify-between px-4 py-2 text-[13px] text-foreground/80 hover:bg-primary/8 hover:text-primary transition-colors duration-100 text-left"
                  >
                    <span>{cmd.label}</span>
                    {cmd.shortcut && (
                      <kbd className="kbd">
                        {cmd.shortcut}
                      </kbd>
                    )}
                  </button>
                ))}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}


// ─── Editor Inner ─────────────────────────────────────────────────────────────

const EditorInner = () => {
  const [showAI, setShowAI] = useState(false);
  const [rightTab, setRightTab] = useState<"design" | "prototype" | "inspect">("design");
  const [showGenModal, setShowGenModal] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const projectName = searchParams.get("name") || "Fintech Mobile App";
  const pageName = searchParams.get("page") || "Landing Page";

  const { dispatch, deleteSelected, undo, redo, copySelected, paste, duplicateSelected, state, selectedElements } = useCanvas();

  const commands: CommandItem[] = [
    { id: "undo", label: "Undo", shortcut: "⌘Z", group: "Edit", action: undo },
    { id: "redo", label: "Redo", shortcut: "⌘⇧Z", group: "Edit", action: redo },
    { id: "copy", label: "Copy", shortcut: "⌘C", group: "Edit", action: copySelected },
    { id: "paste", label: "Paste", shortcut: "⌘V", group: "Edit", action: paste },
    { id: "duplicate", label: "Duplicate", shortcut: "⌘D", group: "Edit", action: duplicateSelected },
    { id: "delete", label: "Delete Selection", shortcut: "⌫", group: "Edit", action: deleteSelected },
    { id: "select-all", label: "Select All", shortcut: "⌘A", group: "Edit", action: () => dispatch({ type: "SELECT", ids: state.elements.map(e => e.id) }) },
    { id: "toggle-ai", label: "Toggle AI Panel", shortcut: "⌘I", group: "View", action: () => setShowAI(p => !p) },
    { id: "ask-nova-restyle", label: "Ask Nova: Restyle selection", group: "AI", action: () => { setShowAI(true); } },
    { id: "ask-nova-variations", label: "Ask Nova: Generate variations", group: "AI", action: () => { setShowAI(true); } },
    { id: "ask-nova-darkmode", label: "Ask Nova: Dark mode variant", group: "AI", action: () => { setShowAI(true); } },
    { id: "toggle-grid", label: "Toggle Grid", shortcut: "⌘'", group: "View", action: () => dispatch({ type: "TOGGLE_GRID" }) },
    { id: "zoom-100", label: "Zoom to 100%", shortcut: "⌘0", group: "View", action: () => dispatch({ type: "SET_ZOOM", zoom: 100 }) },
    { id: "zoom-50", label: "Zoom to 50%", group: "View", action: () => dispatch({ type: "SET_ZOOM", zoom: 50 }) },
    { id: "zoom-200", label: "Zoom to 200%", group: "View", action: () => dispatch({ type: "SET_ZOOM", zoom: 200 }) },
    { id: "tool-move", label: "Move Tool", shortcut: "V", group: "Tools", action: () => dispatch({ type: "SET_TOOL", tool: "move" }) },
    { id: "tool-rect", label: "Rectangle Tool", shortcut: "R", group: "Tools", action: () => dispatch({ type: "SET_TOOL", tool: "rectangle" }) },
    { id: "tool-ellipse", label: "Ellipse Tool", shortcut: "O", group: "Tools", action: () => dispatch({ type: "SET_TOOL", tool: "ellipse" }) },
    { id: "tool-text", label: "Text Tool", shortcut: "T", group: "Tools", action: () => dispatch({ type: "SET_TOOL", tool: "text" }) },
    { id: "tool-frame", label: "Frame Tool", shortcut: "F", group: "Tools", action: () => dispatch({ type: "SET_TOOL", tool: "frame" }) },
    { id: "tool-line", label: "Line Tool", shortcut: "L", group: "Tools", action: () => dispatch({ type: "SET_TOOL", tool: "line" }) },
    { id: "size-desktop", label: "Resize to Desktop (1280×900)", group: "Canvas", action: () => { dispatch({ type: "SET_ARTBOARD_SIZE", width: 1280, height: 900 }); toast.success("Canvas resized to 1280×900"); } },
    { id: "size-mobile", label: "Resize to Mobile (390×844)", group: "Canvas", action: () => { dispatch({ type: "SET_ARTBOARD_SIZE", width: 390, height: 844 }); toast.success("Canvas resized to 390×844"); } },
    { id: "size-tablet", label: "Resize to Tablet (768×1024)", group: "Canvas", action: () => { dispatch({ type: "SET_ARTBOARD_SIZE", width: 768, height: 1024 }); toast.success("Canvas resized to 768×1024"); } },
    { id: "gen-modal", label: "Generate new design with AI", group: "AI", action: () => setShowGenModal(true) },
    { id: "dashboard", label: "Back to Dashboard", group: "Navigate", action: () => navigate("/dashboard") },
  ];

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName.toLowerCase();
      const isInput = tag === "input" || tag === "textarea" || tag === "select";

      if (!isInput && !e.metaKey && !e.ctrlKey) {
        const toolMap: Record<string, string> = {
          v: "move", f: "frame", r: "rectangle", o: "ellipse",
          l: "line", p: "pen", t: "text", i: "image", c: "comment", h: "hand",
        };
        if (toolMap[e.key.toLowerCase()]) {
          dispatch({ type: "SET_TOOL", tool: toolMap[e.key.toLowerCase()] });
          return;
        }
        if ((e.key === "Delete" || e.key === "Backspace") && !isInput) {
          deleteSelected();
          return;
        }
        if (e.key === "Escape") {
          dispatch({ type: "SET_TOOL", tool: "move" });
          dispatch({ type: "SELECT", ids: [] });
          setShowCommandPalette(false);
          return;
        }
      }

      if (e.metaKey || e.ctrlKey) {
        switch (e.key.toLowerCase()) {
          case "z":
            e.preventDefault();
            if (e.shiftKey) redo(); else undo();
            return;
          case "y":
            e.preventDefault();
            redo();
            return;
          case "i":
            e.preventDefault();
            setShowAI((p) => !p);
            return;
          case "k":
            e.preventDefault();
            setShowCommandPalette((p) => !p);
            return;
          case "c":
            if (!isInput) { e.preventDefault(); copySelected(); toast.success("Copied to clipboard"); }
            return;
          case "v":
            if (!isInput) { e.preventDefault(); paste(); }
            return;
          case "d":
            e.preventDefault();
            duplicateSelected();
            return;
          case "a":
            if (!isInput) {
              e.preventDefault();
              dispatch({ type: "SELECT", ids: state.elements.map(e => e.id) });
            }
            return;
          case "'":
            e.preventDefault();
            dispatch({ type: "TOGGLE_GRID" });
            return;
          case "=":
          case "+":
            e.preventDefault();
            dispatch({ type: "SET_ZOOM", zoom: state.zoom + 10 });
            return;
          case "-":
            e.preventDefault();
            dispatch({ type: "SET_ZOOM", zoom: state.zoom - 10 });
            return;
          case "0":
            e.preventDefault();
            dispatch({ type: "SET_ZOOM", zoom: 100 });
            return;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dispatch, deleteSelected, undo, redo, copySelected, paste, duplicateSelected, state.elements, state.zoom]);

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <EditorToolbar
        showAI={showAI}
        onToggleAI={() => setShowAI(!showAI)}
        onOpenCommandPalette={() => setShowCommandPalette(true)}
        onOpenGenModal={() => setShowGenModal(true)}
        projectName={projectName}
        pageName={pageName}
      />

      <div className="flex-1 flex overflow-hidden relative">
        <EditorLeftSidebar />

        {/* Canvas fills remaining space */}
        <EditorCanvas onOpenAI={() => setShowAI(true)} />

        {/* Right panel: AI chat OR properties — seamless transition */}
        <div
          className={`shrink-0 flex transition-all duration-300 ease-out ${showAI ? "w-80" : "w-72"}`}
        >
          {showAI ? (
            <AIChatPanel onClose={() => setShowAI(false)} />
          ) : (
            <EditorRightSidebar
              activeTab={rightTab}
              onTabChange={setRightTab}
            />
          )}
        </div>

        {/* AI invite pill — shown when AI panel is closed */}
        {!showAI && (
          <AIInvitePill onClick={() => setShowAI(true)} />
        )}
      </div>

      {/* AI Generation Modal */}
      <AIGenerationModal
        open={showGenModal}
        onClose={() => setShowGenModal(false)}
        onGenerate={() => setShowGenModal(false)}
      />

      {/* Command Palette */}
      {showCommandPalette && (
        <CommandPalette
          commands={commands}
          onClose={() => setShowCommandPalette(false)}
        />
      )}
    </div>
  );
};

// ─── Page Wrapper ─────────────────────────────────────────────────────────────

const Editor = () => {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("id") || searchParams.get("name") || "default";

  return (
    <CanvasProvider projectKey={projectId}>
      <EditorInner />
    </CanvasProvider>
  );
};

export default Editor;
