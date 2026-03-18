import { useState } from "react";
import { Sparkles, Send, Wand2, Layout, Palette, Type, Smartphone, Zap } from "lucide-react";

interface Props {
  selectedLayer: string | null;
  onSendPrompt: (prompt: string) => void;
}

const inlineActions = [
  { icon: Wand2, label: "Restyle" },
  { icon: Layout, label: "Improve layout" },
  { icon: Palette, label: "Refine colors" },
  { icon: Type, label: "Fix typography" },
  { icon: Smartphone, label: "Make responsive" },
  { icon: Zap, label: "Simplify" },
];

const CanvasAIBar = ({ selectedLayer, onSendPrompt }: Props) => {
  const [input, setInput] = useState("");
  const [expanded, setExpanded] = useState(false);

  const handleSend = () => {
    if (!input.trim()) return;
    onSendPrompt(input);
    setInput("");
    setExpanded(false);
  };

  return (
    <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-30 animate-fade-in">
      <div className={`nova-glass rounded-2xl shadow-2xl shadow-black/30 transition-all duration-300 ${expanded ? "w-[480px]" : "w-[360px]"}`}>
        {/* Expanded quick actions */}
        {expanded && (
          <div className="px-4 pt-3 pb-2 border-b border-border/30">
            <div className="flex flex-wrap gap-1.5">
              {inlineActions.map((action) => (
                <button
                  key={action.label}
                  onClick={() => onSendPrompt(action.label)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-secondary/30 border border-border/30 text-[10px] text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-primary/5 transition-all"
                >
                  <action.icon className="w-3 h-3 text-primary" />
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input bar */}
        <div className="flex items-center gap-2 px-4 py-3">
          <button
            onClick={() => setExpanded(!expanded)}
            className={`p-1.5 rounded-lg transition-colors shrink-0 ${expanded ? "bg-primary/20 text-primary" : "text-primary/60 hover:text-primary hover:bg-primary/10"}`}
          >
            <Sparkles className="w-4 h-4" />
          </button>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onFocus={() => setExpanded(true)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={selectedLayer ? `Edit "${selectedLayer.replace(/-/g, " ")}" with AI...` : "Ask Nova to edit your design..."}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="p-2 rounded-xl nova-gradient text-primary-foreground disabled:opacity-30 transition-all hover:shadow-lg hover:shadow-primary/20"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Context indicator */}
        {selectedLayer && (
          <div className="px-4 pb-2.5 flex items-center gap-1.5">
            <div className="w-1 h-1 rounded-full bg-primary" />
            <span className="text-[9px] text-muted-foreground">
              Targeting: <span className="text-primary">{selectedLayer.replace(/-/g, " ")}</span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default CanvasAIBar;
