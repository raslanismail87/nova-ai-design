import { useState, useRef, useEffect } from "react";
import {
  Sparkles, Send, Wand2, Layout, Palette, Type,
  Smartphone, Zap, Shuffle, Moon, X, ArrowRight,
} from "lucide-react";

interface Props {
  selectedLayer: string | null;
  onSendPrompt: (prompt: string) => void;
  onOpenChat?: () => void;
}

const SUGGESTIONS: Record<string, string[]> = {
  text: [
    "Make this text larger and bolder",
    "Improve the copy to be more compelling",
    "Change font to something premium",
    "Increase letter spacing for elegance",
  ],
  rectangle: [
    "Apply a gradient fill",
    "Add a soft drop shadow",
    "Restyle with glass effect",
    "Make corners more rounded",
  ],
  frame: [
    "Restructure the layout",
    "Improve spacing and padding",
    "Generate dark mode variant",
    "Make responsive for mobile",
  ],
  default: [
    "Restyle with premium look",
    "Generate design variations",
    "Improve visual hierarchy",
    "Apply glass morphism effect",
  ],
};

const quickChips = [
  { icon: Wand2, label: "Restyle" },
  { icon: Shuffle, label: "Variations" },
  { icon: Palette, label: "Color" },
  { icon: Moon, label: "Dark mode" },
  { icon: Smartphone, label: "Responsive" },
  { icon: Zap, label: "Enhance" },
];

export default function CanvasAIBar({ selectedLayer, onSendPrompt, onOpenChat }: Props) {
  const [input, setInput] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selectedLayer) {
      const type = selectedLayer.includes("text")
        ? "text"
        : selectedLayer.includes("frame")
        ? "frame"
        : selectedLayer.includes("rect")
        ? "rectangle"
        : "default";
      setSuggestions(SUGGESTIONS[type] ?? SUGGESTIONS.default);
    } else {
      setSuggestions(SUGGESTIONS.default);
    }
  }, [selectedLayer]);

  const handleSend = () => {
    if (!input.trim()) return;
    onSendPrompt(input.trim());
    if (onOpenChat) onOpenChat();
    setInput("");
    setExpanded(false);
    setShowSuggestions(false);
  };

  const handleChip = (label: string) => {
    const promptMap: Record<string, string> = {
      Restyle: selectedLayer ? `Restyle "${selectedLayer}" with a premium look` : "Restyle the design with a premium aesthetic",
      Variations: "Generate 3 design variations",
      Color: "Refine the color palette",
      "Dark mode": "Create a dark mode variant",
      Responsive: "Make this responsive for mobile",
      Enhance: selectedLayer ? `Enhance "${selectedLayer}"` : "Enhance the overall design quality",
    };
    onSendPrompt(promptMap[label] ?? label);
    if (onOpenChat) onOpenChat();
    setExpanded(false);
  };

  return (
    <div className="absolute bottom-14 left-1/2 -translate-x-1/2 z-30 animate-fade-in">
      <div
        className={`nova-glass rounded-2xl shadow-2xl shadow-black/40 transition-all duration-300 ease-out ${
          expanded ? "w-[520px]" : "w-[380px]"
        }`}
      >
        {/* Suggestion pills (shown when focused and has suggestions) */}
        {expanded && showSuggestions && suggestions.length > 0 && (
          <div className="px-4 pt-3 pb-2 border-b border-border animate-fade-in">
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider mb-2 font-medium">
              {selectedLayer ? `Suggestions for "${selectedLayer}"` : "Try asking"}
            </p>
            <div className="space-y-1">
              {suggestions.slice(0, 3).map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setInput(s);
                    setShowSuggestions(false);
                    inputRef.current?.focus();
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-primary/10 text-left group transition-colors"
                >
                  <ArrowRight className="w-2.5 h-2.5 text-primary/50 group-hover:text-primary transition-colors shrink-0" />
                  <span className="text-[10px] text-muted-foreground group-hover:text-foreground transition-colors">{s}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quick chips row */}
        {expanded && (
          <div className="px-4 pt-3 pb-2 border-b border-border animate-fade-in">
            <div className="flex items-center gap-1.5 flex-wrap">
              {quickChips.map((chip) => (
                <button
                  key={chip.label}
                  onClick={() => handleChip(chip.label)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-secondary border border-border text-[10px] text-foreground/70 hover:text-foreground hover:border-primary/40 hover:bg-primary/10 transition-all active:scale-95"
                >
                  <chip.icon className="w-3 h-3 text-primary/70" />
                  {chip.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Main input row */}
        <div className="flex items-center gap-2.5 px-4 py-3">
          {/* Nova sparkle toggle */}
          <button
            onClick={() => {
              setExpanded(!expanded);
              if (!expanded) {
                setTimeout(() => {
                  inputRef.current?.focus();
                  setShowSuggestions(true);
                }, 50);
              }
            }}
            className={`shrink-0 transition-all duration-200 ${
              expanded
                ? "w-7 h-7 rounded-xl nova-gradient flex items-center justify-center shadow-md shadow-primary/25"
                : "p-1.5 rounded-lg text-primary/70 hover:text-primary hover:bg-primary/10"
            }`}
          >
            <Sparkles className={expanded ? "w-3.5 h-3.5 text-primary-foreground" : "w-4 h-4"} />
          </button>

          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onFocus={() => {
              setExpanded(true);
              setShowSuggestions(true);
            }}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend();
              if (e.key === "Escape") {
                setExpanded(false);
                setShowSuggestions(false);
                inputRef.current?.blur();
              }
            }}
            placeholder={
              selectedLayer
                ? `Edit "${selectedLayer.replace(/-/g, " ")}" with AI…`
                : "Ask Nova to edit your design…"
            }
            className="flex-1 bg-transparent text-[12px] text-foreground outline-none placeholder:text-muted-foreground"
          />

          {input.trim() ? (
            <button
              onClick={handleSend}
              className="shrink-0 w-8 h-8 rounded-xl nova-gradient flex items-center justify-center shadow-lg shadow-primary/25 hover:opacity-90 transition-all active:scale-95"
            >
              <Send className="w-3.5 h-3.5 text-primary-foreground" />
            </button>
          ) : (
            expanded && (
              <button
                onClick={() => { setExpanded(false); setShowSuggestions(false); }}
                className="shrink-0 p-1.5 rounded-lg text-muted-foreground/50 hover:text-muted-foreground transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )
          )}
        </div>

        {/* Context indicator */}
        {selectedLayer && (
          <div className="px-4 pb-2.5 flex items-center gap-1.5">
            <div className="w-1 h-1 rounded-full bg-primary animate-pulse" />
            <span className="text-[9px] text-muted-foreground/60">
              Targeting{" "}
              <span className="text-primary font-medium">{selectedLayer.replace(/-/g, " ")}</span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
