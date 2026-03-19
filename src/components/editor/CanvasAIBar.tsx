import { useState, useRef } from "react";
import {
  Sparkles, Send, Wand2, Palette, Type,
  Smartphone, Shuffle, Moon, X, Maximize2, Star, AlignLeft, Layers, Eye, Minus,
} from "lucide-react";
import { CanvasElement } from "@/contexts/CanvasContext";

interface Props {
  selectedElement: CanvasElement;
  onSendPrompt: (prompt: string) => void;
  onOpenChat?: () => void;
}

// Contextual quick actions by element type
const ACTIONS_BY_TYPE: Record<string, { icon: React.ElementType; label: string; prompt: string }[]> = {
  text: [
    { icon: Wand2, label: "Restyle", prompt: "Restyle this text with premium typography" },
    { icon: Type, label: "Scale up", prompt: "Scale up the font size for better hierarchy" },
    { icon: AlignLeft, label: "Improve copy", prompt: "Improve the copy text to be more compelling" },
    { icon: Palette, label: "Color", prompt: "Suggest a better color for this text element" },
  ],
  rectangle: [
    { icon: Wand2, label: "Restyle", prompt: "Apply a premium visual style to this element" },
    { icon: Palette, label: "Gradient", prompt: "Apply a beautiful gradient fill to this element" },
    { icon: Maximize2, label: "Shadow", prompt: "Add a soft drop shadow for depth" },
    { icon: Shuffle, label: "Variations", prompt: "Generate 3 style variations for this element" },
  ],
  ellipse: [
    { icon: Wand2, label: "Restyle", prompt: "Apply a premium visual style to this circle" },
    { icon: Palette, label: "Gradient", prompt: "Apply a circular gradient to this element" },
    { icon: Maximize2, label: "Glow", prompt: "Add a glow effect to this element" },
    { icon: Star, label: "Accent", prompt: "Turn this into a decorative accent shape" },
  ],
  frame: [
    { icon: Layers, label: "Layout", prompt: "Restructure the layout inside this frame" },
    { icon: Smartphone, label: "Responsive", prompt: "Make this frame responsive for mobile" },
    { icon: Moon, label: "Dark mode", prompt: "Generate a dark mode variant of this frame" },
    { icon: Shuffle, label: "Variations", prompt: "Generate 3 layout variations for this frame" },
  ],
  image: [
    { icon: Wand2, label: "Enhance", prompt: "Enhance this image placeholder's styling" },
    { icon: Palette, label: "Overlay", prompt: "Add a gradient overlay to this image" },
    { icon: Maximize2, label: "Shadow", prompt: "Add a premium shadow to this image" },
  ],
  line: [
    { icon: Palette, label: "Style", prompt: "Style this line with a gradient stroke" },
    { icon: Wand2, label: "Animate", prompt: "Add an animated line motion hint" },
  ],
  default: [
    { icon: Wand2, label: "Restyle", prompt: "Apply a premium visual style" },
    { icon: Palette, label: "Color", prompt: "Improve the color scheme" },
    { icon: Shuffle, label: "Variations", prompt: "Generate design variations" },
    { icon: Eye, label: "Preview", prompt: "Preview design improvements" },
  ],
};

const TYPE_ICON_MAP: Record<string, React.ElementType> = {
  text: Type, rectangle: Maximize2, ellipse: Star, frame: Layers, image: Eye, line: Minus,
};

export default function CanvasAIBar({ selectedElement, onSendPrompt, onOpenChat }: Props) {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const actions = ACTIONS_BY_TYPE[selectedElement.type] ?? ACTIONS_BY_TYPE.default;
  const TypeIcon = TYPE_ICON_MAP[selectedElement.type] ?? Layers;

  const handleSend = () => {
    if (!input.trim()) return;
    onSendPrompt(input.trim());
    onOpenChat?.();
    setInput("");
  };

  const handleChip = (prompt: string) => {
    onSendPrompt(prompt);
    onOpenChat?.();
  };

  return (
    <div className="absolute bottom-14 left-1/2 -translate-x-1/2 z-30 animate-fade-in w-[420px]">
      <div className="bg-card rounded-2xl shadow-xl border border-border overflow-hidden">
        {/* Element context + quick actions */}
        <div className="px-3.5 pt-3 pb-2.5">
          {/* Element indicator */}
          <div className="flex items-center gap-2 mb-2.5">
            <div className="w-5 h-5 rounded-md bg-primary/10 flex items-center justify-center">
              <TypeIcon className="w-3 h-3 text-primary" />
            </div>
            <span className="text-[11px] font-medium text-foreground truncate max-w-[140px]">
              {selectedElement.name}
            </span>
            <span className="text-[9px] text-muted-foreground font-mono capitalize">
              {selectedElement.type}
            </span>
            <div className="ml-auto flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-[9px] text-primary font-medium">AI</span>
            </div>
          </div>

          {/* Quick action chips */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {actions.map((action) => (
              <button
                key={action.label}
                onClick={() => handleChip(action.prompt)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-secondary border border-border text-[10px] text-foreground/70 hover:text-foreground hover:border-primary/40 hover:bg-primary/10 transition-all active:scale-95"
              >
                <action.icon className="w-3 h-3 text-primary/70" />
                {action.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input row */}
        <div className="flex items-center gap-2.5 px-3.5 py-2.5 border-t border-border">
          <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Sparkles className="w-3 h-3 text-primary" />
          </div>

          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend();
            }}
            placeholder={`Edit "${selectedElement.name}" with AI…`}
            className="flex-1 bg-transparent text-[12px] text-foreground outline-none placeholder:text-muted-foreground"
          />

          {input.trim() && (
            <button
              onClick={handleSend}
              className="shrink-0 w-7 h-7 rounded-lg bg-primary flex items-center justify-center hover:opacity-90 transition-all active:scale-95"
            >
              <Send className="w-3.5 h-3.5 text-primary-foreground" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
