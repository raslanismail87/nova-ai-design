import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Sparkles, Undo2, Redo2, Share2, Play, Search,
  MousePointer2, Frame, Square, Circle, Minus, PenTool, Type, Image, MessageSquare, Hand
} from "lucide-react";

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
  activeTool: string;
  onToolChange: (tool: string) => void;
  showAI: boolean;
  onToggleAI: () => void;
  zoom: number;
}

const EditorToolbar = ({ activeTool, onToolChange, showAI, onToggleAI, zoom }: Props) => {
  const navigate = useNavigate();

  return (
    <div className="h-12 border-b border-border bg-card/80 backdrop-blur-sm flex items-center px-3 gap-2 shrink-0">
      {/* Left: Logo + project name */}
      <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 mr-2 hover:opacity-80 transition-opacity">
        <div className="w-6 h-6 rounded-md nova-gradient flex items-center justify-center">
          <Sparkles className="w-3 h-3 text-primary-foreground" />
        </div>
      </button>
      <span className="text-sm font-medium mr-1">Fintech Mobile App</span>
      <span className="text-xs text-muted-foreground mr-4">/</span>
      <span className="text-xs text-muted-foreground mr-4">Landing Page</span>

      {/* Undo/Redo */}
      <div className="flex items-center gap-0.5 mr-2">
        <Button variant="ghost" size="icon" className="h-8 w-8"><Undo2 className="w-3.5 h-3.5" /></Button>
        <Button variant="ghost" size="icon" className="h-8 w-8"><Redo2 className="w-3.5 h-3.5" /></Button>
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
              onClick={() => onToolChange(tool.id)}
              className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors ${
                activeTool === tool.id
                  ? "bg-primary/20 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              }`}
              title={`${tool.id} (${tool.shortcut})`}
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
        <span className="text-xs text-muted-foreground font-mono mr-2">{zoom}%</span>

        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Search className="w-3.5 h-3.5" />
        </Button>

        <Button
          variant={showAI ? "default" : "ghost"}
          size="sm"
          onClick={onToggleAI}
          className={showAI ? "nova-gradient border-0 text-primary-foreground h-8" : "h-8"}
        >
          <Sparkles className="w-3.5 h-3.5 mr-1" />
          AI
        </Button>

        <div className="w-px h-5 bg-border mx-1" />

        {/* Collaborator avatars */}
        <div className="flex -space-x-1 mr-2">
          {["A", "M"].map((letter, i) => (
            <div key={i} className="w-6 h-6 rounded-full bg-secondary border-2 border-card flex items-center justify-center text-[9px] font-medium">
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
};

export default EditorToolbar;
