import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Sparkles, Send, Check, RotateCcw, ArrowLeftRight, Undo2 } from "lucide-react";
import { sampleChatMessages, aiSuggestions } from "@/data/mockData";

interface Props {
  onClose: () => void;
}

const AIChatPanel = ({ onClose }: Props) => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState(sampleChatMessages);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = {
      id: String(messages.length + 1),
      role: "user" as const,
      content: input,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages([...messages, userMsg]);
    setInput("");
    setIsGenerating(true);

    setTimeout(() => {
      const aiMsg = {
        id: String(messages.length + 2),
        role: "assistant" as const,
        content: `I've analyzed your request and applied the changes:\n\n• **Layout** — Refined spacing and alignment\n• **Visual** — Updated color system and depth\n• **Typography** — Improved hierarchy and scale\n\nThe changes are applied to your current selection.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        applied: true,
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <aside className="w-80 border-l border-border bg-card flex flex-col shrink-0 animate-slide-in-right">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg nova-gradient flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-primary-foreground" />
          </div>
          <div>
            <span className="text-sm font-medium">Nova AI</span>
            <p className="text-[10px] text-muted-foreground">Context: Frame "Landing Page"</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
          <X className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`${msg.role === "user" ? "flex justify-end" : ""}`}>
            <div
              className={`max-w-[95%] rounded-xl px-3.5 py-2.5 text-xs leading-relaxed ${
                msg.role === "user"
                  ? "bg-primary/20 text-foreground ml-4"
                  : "bg-secondary/50 text-foreground"
              }`}
            >
              {msg.role === "assistant" ? (
                <div className="space-y-2">
                  {msg.content.split("\n").map((line, i) => {
                    if (line.startsWith("• **")) {
                      const [, bold, rest] = line.match(/• \*\*(.*?)\*\* — (.*)/) || [];
                      return (
                        <p key={i}>
                          • <strong className="text-foreground">{bold}</strong> — {rest}
                        </p>
                      );
                    }
                    return line ? <p key={i}>{line}</p> : null;
                  })}
                  {"applied" in msg && msg.applied && (
                    <div className="flex items-center gap-1.5 mt-3 pt-2.5 border-t border-border">
                      <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2 text-green-400 hover:text-green-300">
                        <Check className="w-3 h-3 mr-1" /> Accept
                      </Button>
                      <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2">
                        <Undo2 className="w-3 h-3 mr-1" /> Revert
                      </Button>
                      <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2">
                        <RotateCcw className="w-3 h-3 mr-1" /> Redo
                      </Button>
                      <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2">
                        <ArrowLeftRight className="w-3 h-3 mr-1" /> Diff
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                msg.content
              )}
            </div>
            <div className={`text-[9px] text-muted-foreground mt-1 ${msg.role === "user" ? "text-right" : ""}`}>
              {msg.timestamp}
            </div>
          </div>
        ))}

        {isGenerating && (
          <div className="flex items-center gap-2">
            <div className="h-0.5 flex-1 rounded-full overflow-hidden bg-secondary">
              <div className="h-full w-1/2 nova-gradient animate-shimmer rounded-full" style={{ backgroundSize: "200% 100%" }} />
            </div>
          </div>
        )}
      </div>

      {/* Suggestion pills */}
      <div className="px-4 pb-2">
        <div className="flex flex-wrap gap-1.5">
          {aiSuggestions.slice(0, 4).map((s) => (
            <button
              key={s}
              onClick={() => setInput(s)}
              className="px-2.5 py-1 rounded-full bg-secondary/50 border border-border text-[10px] text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="p-3 border-t border-border">
        <div className="flex items-center gap-2 rounded-xl bg-secondary/30 border border-border px-3 py-2 focus-within:border-primary/50 transition-colors">
          <Sparkles className="w-3.5 h-3.5 text-primary shrink-0" />
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Command Nova..."
            className="flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="p-1 rounded-md hover:bg-primary/20 text-primary disabled:opacity-30 transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default AIChatPanel;
