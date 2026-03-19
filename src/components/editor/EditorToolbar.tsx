import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Sparkles, Undo2, Redo2, Share2, Play, Search,
  MousePointer2, Frame, Square, Circle, Minus, PenTool, Type, Image, MessageSquare, Hand,
  ChevronDown, Monitor, Smartphone, Tablet, Command,
} from "lucide-react";
import { useCanvas } from "@/contexts/CanvasContext";
import { toast } from "sonner";

const toolIcons: Record<string, any> = {
  move: MousePointer2, frame: Frame, rectangle: Square, ellipse: Circle,
  line: Minus, pen: PenTool, text: Type, image: Image, comment: MessageSquare, hand: Hand,
};

const tools = [
  { id: "move", shortcut: "V" }, { id: "frame", shortcut: "F" },
  { id: "rectangle", shortcut: "R" }, { id: "ellipse", shortcut: "O" },
  { id: "line", shortcut: "L" }, { id: "pen", shortcut: "P" },
  { id: "text", shortcut: "T" }, { id: "image", shortcut: "I" },
  { id: "comment", shortcut: "C" }, { id: "hand", shortcut: "H" },
];

const artboardPresets = [
  { label: "Desktop", icon: Monitor, width: 1280, height: 900 },
  { label: "Mobile", icon: Smartphone, width: 390, height: 844 },
  { label: "Tablet", icon: Tablet, width: 768, height: 1024 },
  { label: "HD", icon: Monitor, width: 1920, height: 1080 },
  { label: "4K", icon: Monitor, width: 3840, height: 2160 },
];

interface Props {
  showAI: boolean;
  onToggleAI: () => void;
  onOpenCommandPalette?: () => void;
  onOpenGenModal?: () => void;
  projectName?: string;
  pageName?: string;
}

export default function EditorToolbar({
  showAI,
  onToggleAI,
  onOpenCommandPalette,
  onOpenGenModal,
  projectName = "Fintech Mobile App",
  pageName = "Landing Page",
}: Props) {
  const navigate = useNavigate();
  const { state, dispatch, undo, redo, canUndo, canRedo } = useCanvas();
  const { activeTool, zoom, artboardWidth, artboardHeight } = state;
  const [showPresets, setShowPresets] = useState(false);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard");
  };

  return (
    <div className="h-11 border-b border-border/50 bg-card/90 backdrop-blur-md flex items-center px-3 gap-2 shrink-0 z-30 relative">
      {/* Left: Logo + project name */}
      <button
        onClick={() => navigate("/dashboard")}
        className="flex items-center gap-2 mr-2 hover:opacity-80 transition-opacity"
        title="Back to Dashboard"
      >
        <div className="w-6 h-6 rounded-md nova-gradient flex items-center justify-center">
          <Sparkles className="w-3 h-3 text-primary-foreground" />
        </div>
      </button>

      <button className="flex items-center gap-1 hover:text-foreground text-foreground text-sm font-medium">
        {projectName}
        <ChevronDown className="w-3 h-3 text-muted-foreground ml-0.5" />
      </button>
      <span className="text-xs text-muted-foreground">/</span>
      <div className="relative">
        <button
          onClick={() => setShowPresets(!showPresets)}
          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 group"
          title="Change canvas size"
        >
          {pageName}
          <span className="text-[9px] text-muted-foreground/50 font-mono ml-1">{artboardWidth}×{artboardHeight}</span>
          <ChevronDown className="w-3 h-3" />
        </button>
        {showPresets && (
          <div
            className="absolute top-full left-0 mt-1 z-50 rounded-xl bg-card border border-border shadow-xl shadow-black/40 py-1 w-48 animate-fade-in"
            onMouseLeave={() => setShowPresets(false)}
          >
            <p className="px-3 py-1.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Canvas Size</p>
            {artboardPresets.map((preset) => {
              const Icon = preset.icon;
              return (
                <button
                  key={preset.label}
                  onClick={() => {
                    dispatch({ type: "SET_ARTBOARD_SIZE", width: preset.width, height: preset.height });
                    toast.success(`Canvas resized to ${preset.width}×${preset.height}`);
                    setShowPresets(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs transition-colors ${
                    artboardWidth === preset.width && artboardHeight === preset.height
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="flex-1 text-left">{preset.label}</span>
                  <span className="text-[10px] font-mono text-muted-foreground/50">{preset.width}×{preset.height}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Undo/Redo */}
      <div className="flex items-center gap-px ml-1">
        <button
          onClick={undo}
          disabled={!canUndo}
          title="Undo (⌘Z)"
          className={`h-7 w-7 rounded-[6px] flex items-center justify-center transition-all duration-100 ${canUndo ? "text-muted-foreground/60 hover:text-foreground/80 hover:bg-foreground/[0.05] active:bg-foreground/[0.08]" : "text-muted-foreground/20 cursor-not-allowed"}`}
        >
          <Undo2 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={redo}
          disabled={!canRedo}
          title="Redo (⌘⇧Z)"
          className={`h-7 w-7 rounded-[6px] flex items-center justify-center transition-all duration-100 ${canRedo ? "text-muted-foreground/60 hover:text-foreground/80 hover:bg-foreground/[0.05] active:bg-foreground/[0.08]" : "text-muted-foreground/20 cursor-not-allowed"}`}
        >
          <Redo2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Separator */}
      <div className="w-px h-4 bg-border/60 mx-1" />

      {/* Tools */}
      <div className="flex items-center gap-px">
        {tools.map((tool) => {
          const Icon = toolIcons[tool.id];
          return (
            <button
              key={tool.id}
              onClick={() => dispatch({ type: "SET_TOOL", tool: tool.id })}
              className={`h-7 w-7 rounded-[6px] flex items-center justify-center transition-all duration-100 ${
                activeTool === tool.id
                  ? "bg-primary/12 text-primary shadow-sm shadow-primary/5"
                  : "text-muted-foreground/50 hover:text-foreground/80 hover:bg-white/[0.05] active:bg-white/[0.08]"
              }`}
              title={`${tool.id.charAt(0).toUpperCase() + tool.id.slice(1)} (${tool.shortcut})`}
            >
              <Icon className="w-3.5 h-3.5" />
            </button>
          );
        })}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right actions */}
      <div className="flex items-center gap-1.5">
        {/* Zoom display */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => dispatch({ type: "SET_ZOOM", zoom: zoom - 10 })}
            className="h-7 px-1.5 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
            title="Zoom out"
          >
            −
          </button>
          <button
            onClick={() => dispatch({ type: "SET_ZOOM", zoom: 100 })}
            className="text-xs text-muted-foreground font-mono hover:text-foreground min-w-[3.5rem] text-center"
            title="Reset zoom"
          >
            {zoom}%
          </button>
          <button
            onClick={() => dispatch({ type: "SET_ZOOM", zoom: zoom + 10 })}
            className="h-7 px-1.5 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
            title="Zoom in"
          >
            +
          </button>
        </div>

        <div className="w-px h-5 bg-border mx-0.5" />

        {/* Command Palette */}
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 text-muted-foreground hover:text-foreground"
          onClick={onOpenCommandPalette}
          title="Command Palette (⌘K)"
        >
          <Command className="w-3.5 h-3.5" />
          <kbd className="hidden sm:inline-block px-1 py-0.5 rounded bg-secondary text-[9px] text-muted-foreground">⌘K</kbd>
        </Button>

        <Button
          variant={showAI ? "default" : "ghost"}
          size="sm"
          onClick={onToggleAI}
          className={showAI ? "nova-gradient border-0 text-primary-foreground h-8" : "h-8"}
          title="Toggle AI Panel (⌘I)"
        >
          <Sparkles className="w-3.5 h-3.5 mr-1" />
          AI
        </Button>

        <div className="w-px h-5 bg-border mx-1" />

        {/* Collaborator avatars */}
        <div className="flex -space-x-1 mr-1">
          {["A", "M"].map((letter, i) => (
            <div
              key={i}
              className="w-6 h-6 rounded-full bg-secondary border-2 border-card flex items-center justify-center text-[9px] font-medium"
              title={`Collaborator ${letter}`}
            >
              {letter}
            </div>
          ))}
          <div className="w-6 h-6 rounded-full bg-green-500/20 border-2 border-card flex items-center justify-center" title="You (active)">
            <div className="w-2 h-2 rounded-full bg-green-500" />
          </div>
        </div>

        <Button variant="outline" size="sm" className="h-8 border-border/60 hover:border-border press-scale" onClick={handleShare}>
          <Share2 className="w-3.5 h-3.5 mr-1" />
          Share
        </Button>
        <Button
          size="sm"
          className="h-8 nova-gradient border-0 text-primary-foreground hover:opacity-90 shadow-md shadow-primary/15 press-scale"
          title="Present / Preview"
        >
          <Play className="w-3.5 h-3.5 mr-1" />
          Present
        </Button>
      </div>
    </div>
  );
}
