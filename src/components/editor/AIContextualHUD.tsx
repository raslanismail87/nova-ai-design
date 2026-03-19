import { useState, useEffect } from "react";
import {
  Wand2, Type, Palette, Layers, Smartphone, Moon,
  AlignLeft, Maximize2, Minus, Sparkles, ChevronUp,
  Shuffle, Eye, Zap, Star,
} from "lucide-react";
import { CanvasElement } from "@/contexts/CanvasContext";

interface Props {
  element: CanvasElement | null;
  onSendPrompt: (prompt: string) => void;
  onOpenChat: () => void;
}

// Smart action sets by element type
const ACTIONS_BY_TYPE: Record<string, { icon: React.ElementType; label: string; prompt: string; color?: string }[]> = {
  text: [
    { icon: Wand2, label: "Restyle", prompt: "Restyle this text with premium typography", color: "text-violet-400" },
    { icon: Type, label: "Scale up", prompt: "Scale up the font size for better hierarchy" },
    { icon: AlignLeft, label: "Improve copy", prompt: "Improve the copy text to be more compelling" },
    { icon: Palette, label: "Color", prompt: "Suggest a better color for this text element" },
  ],
  rectangle: [
    { icon: Wand2, label: "Restyle", prompt: "Apply a premium visual style to this element", color: "text-violet-400" },
    { icon: Palette, label: "Gradient", prompt: "Apply a beautiful gradient fill to this element" },
    { icon: Maximize2, label: "Add shadow", prompt: "Add a soft drop shadow for depth" },
    { icon: Shuffle, label: "Variations", prompt: "Generate 3 style variations for this element" },
  ],
  ellipse: [
    { icon: Wand2, label: "Restyle", prompt: "Apply a premium visual style to this circle", color: "text-violet-400" },
    { icon: Palette, label: "Gradient", prompt: "Apply a circular gradient to this element" },
    { icon: Maximize2, label: "Glow", prompt: "Add a glow effect to this element" },
    { icon: Star, label: "Accent", prompt: "Turn this into a decorative accent shape" },
  ],
  frame: [
    { icon: Layers, label: "Restructure", prompt: "Restructure the layout inside this frame", color: "text-cyan-400" },
    { icon: Smartphone, label: "Responsive", prompt: "Make this frame responsive for mobile" },
    { icon: Moon, label: "Dark mode", prompt: "Generate a dark mode variant of this frame" },
    { icon: Shuffle, label: "Variations", prompt: "Generate 3 layout variations for this frame" },
  ],
  image: [
    { icon: Wand2, label: "Enhance", prompt: "Enhance this image placeholder's styling", color: "text-violet-400" },
    { icon: Palette, label: "Overlay", prompt: "Add a gradient overlay to this image" },
    { icon: Maximize2, label: "Shadow", prompt: "Add a premium shadow to this image" },
    { icon: AlignLeft, label: "Caption", prompt: "Add a caption text below this image" },
  ],
  line: [
    { icon: Palette, label: "Style", prompt: "Style this line with a gradient stroke", color: "text-violet-400" },
    { icon: Wand2, label: "Animate", prompt: "Add an animated line motion hint" },
  ],
  default: [
    { icon: Wand2, label: "Restyle", prompt: "Apply a premium visual style", color: "text-violet-400" },
    { icon: Palette, label: "Color", prompt: "Improve the color scheme" },
    { icon: Shuffle, label: "Variations", prompt: "Generate design variations" },
    { icon: Eye, label: "Preview", prompt: "Preview design improvements" },
  ],
};

// Element type icon
const TYPE_ICON_MAP: Record<string, React.ElementType> = {
  text: Type,
  rectangle: Maximize2,
  ellipse: Zap,
  frame: Layers,
  image: Eye,
  line: Minus,
};

export default function AIContextualHUD({ element, onSendPrompt, onOpenChat }: Props) {
  const [visible, setVisible] = useState(false);
  const [minimized, setMinimized] = useState(false);

  // Animate in/out when element changes
  useEffect(() => {
    if (element) {
      setVisible(false);
      const t = setTimeout(() => setVisible(true), 80);
      return () => clearTimeout(t);
    } else {
      setVisible(false);
    }
  }, [element?.id]);

  if (!element || !visible) return null;

  const actions = ACTIONS_BY_TYPE[element.type] ?? ACTIONS_BY_TYPE.default;
  const TypeIcon = TYPE_ICON_MAP[element.type] ?? Layers;

  return (
    <div
      className={`absolute bottom-20 left-1/2 -translate-x-1/2 z-30 transition-all duration-300 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      }`}
    >
      <div className="nova-glass rounded-2xl shadow-2xl shadow-black/40 overflow-hidden">
        {/* Header row */}
        <div className="flex items-center gap-2.5 px-3.5 pt-3 pb-2">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-md bg-primary/15 flex items-center justify-center">
              <TypeIcon className="w-3 h-3 text-primary" />
            </div>
            <span className="text-[11px] font-medium text-foreground/90 max-w-[120px] truncate">
              {element.name}
            </span>
            <span className="text-[9px] text-muted-foreground/60 font-mono capitalize">{element.type}</span>
          </div>

          {/* Nova badge */}
          <div className="ml-auto flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-[9px] text-primary font-medium">AI</span>
          </div>

          <button
            onClick={() => setMinimized(!minimized)}
            className="p-1 rounded-md hover:bg-white/5 text-muted-foreground transition-colors"
          >
            <ChevronUp className={`w-3 h-3 transition-transform ${minimized ? "rotate-180" : ""}`} />
          </button>
        </div>

        {/* Actions row */}
        {!minimized && (
          <div className="px-3.5 pb-3 space-y-2">
            {/* Quick action chips */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {actions.map((action) => (
                <button
                  key={action.label}
                  onClick={() => {
                    onSendPrompt(action.prompt);
                    onOpenChat();
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-secondary/20 border border-border/30 text-[10px] text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-primary/5 transition-all active:scale-95"
                >
                  <action.icon className={`w-3 h-3 ${action.color ?? "text-primary/70"}`} />
                  {action.label}
                </button>
              ))}
            </div>

            {/* Ask Nova freeform */}
            <button
              onClick={onOpenChat}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-primary/8 border border-primary/15 hover:bg-primary/12 hover:border-primary/25 transition-all group"
            >
              <div className="w-5 h-5 rounded-lg nova-gradient flex items-center justify-center shadow-sm shadow-primary/20 group-hover:shadow-primary/30 transition-shadow">
                <Sparkles className="w-2.5 h-2.5 text-primary-foreground" />
              </div>
              <span className="text-[10px] text-muted-foreground group-hover:text-foreground transition-colors">
                Ask Nova about this element…
              </span>
              <span className="ml-auto text-[9px] text-muted-foreground/40 font-mono">⌘I</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
