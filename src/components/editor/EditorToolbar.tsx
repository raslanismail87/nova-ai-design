import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Sparkles, Undo2, Redo2, Share2, Play, Search,
  MousePointer2, Frame, Square, Circle, Minus, PenTool, Type, Image, MessageSquare, Hand,
  ChevronDown,
} from "lucide-react";
import { useCanvas } from "@/contexts/CanvasContext";

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

interface Props {
  showAI: boolean;
  onToggleAI: () => void;
  projectName?: string;
  pageName?: string;
}

export default function EditorToolbar({ showAI, onToggleAI, projectName = "Fintech Mobile App", pageName = "Landing Page" }: Props) {
  const navigate = useNavigate();
  const { state, dispatch, undo, redo, canUndo, canRedo } = useCanvas();
  const { activeTool, zoom } = state;

  return (
    <div className="h-12 border-b border-border bg-card/80 backdrop-blur-sm flex items-center px-3 gap-2 shrink-0 z-30">
      {/* Left: Logo + project name */}
      <button
        onClick={() => navigate("/dashboard")}
        className="flex items-center gap-2 mr-2 hover:opacity-80 transition-opacity"
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
      <button className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
        {pageName}
        <ChevronDown className="w-3 h-3" />
      </button>

      {/* Undo/Redo */}
      <div className="flex items-center gap-0.5 ml-2">
        <Button
          variant="ghost"
          size="icon"
          className={`h-8 w-8 ${!canUndo ? "opacity-40 cursor-not-allowed" : ""}`}
          onClick={undo}
          disabled={!canUndo}
          title="Undo (⌘Z)"
        >
          <Undo2 className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={`h-8 w-8 ${!canRedo ? "opacity-40 cursor-not-allowed" : ""}`}
          onClick={redo}
          disabled={!canRedo}
          title="Redo (⌘⇧Z)"
        >
          <Redo2 className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Separator */}
      <div className="w-px h-5 bg-border mx-1" />

      {/* Tools */}
      <div className="flex items-center gap-0.5">
        {tools.map((tool) => {
          const Icon = toolIcons[tool.id];
          return (
            <button
              key={tool.id}
              onClick={() => dispatch({ type: "SET_TOOL", tool: tool.id })}
              className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors ${
                activeTool === tool.id
                  ? "bg-primary/20 text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
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
          >
            −
          </button>
          <button
            onClick={() => dispatch({ type: "SET_ZOOM", zoom: 100 })}
            className="text-xs text-muted-foreground font-mono hover:text-foreground min-w-[3.5rem] text-center"
          >
            {zoom}%
          </button>
          <button
            onClick={() => dispatch({ type: "SET_ZOOM", zoom: zoom + 10 })}
            className="h-7 px-1.5 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
          >
            +
          </button>
        </div>

        <div className="w-px h-5 bg-border mx-0.5" />

        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Search className="w-3.5 h-3.5" />
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
            >
              {letter}
            </div>
          ))}
          <div className="w-6 h-6 rounded-full bg-green-500/20 border-2 border-card flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-green-500" />
          </div>
        </div>

        <Button variant="outline" size="sm" className="h-8 border-border">
          <Share2 className="w-3.5 h-3.5 mr-1" />
          Share
        </Button>
        <Button size="sm" className="h-8 nova-gradient border-0 text-primary-foreground hover:opacity-90">
          <Play className="w-3.5 h-3.5 mr-1" />
          Present
        </Button>
      </div>
    </div>
  );
}
