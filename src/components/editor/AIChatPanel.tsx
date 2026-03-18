import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  X, Sparkles, Send, Check, RotateCcw, ArrowLeftRight, Undo2,
  Layers, MousePointer2, Frame, Wand2, Copy, SlidersHorizontal,
  ChevronDown, Lightbulb, Palette, Layout, Accessibility, Smartphone,
  Moon, Minimize2, Grid3X3, FileText
} from "lucide-react";
import { sampleChatMessages, aiSuggestions } from "@/data/mockData";

interface Props {
  onClose: () => void;
  selectedLayer: string | null;
}

type ViewMode = "chat" | "variations" | "compare";

const quickActions = [
  { icon: Wand2, label: "Restyle", desc: "Transform visual style" },
  { icon: Layout, label: "Generate Section", desc: "Add new content block" },
  { icon: Lightbulb, label: "Improve UX", desc: "Enhance usability" },
  { icon: FileText, label: "Rewrite Copy", desc: "Refine text content" },
  { icon: Copy, label: "Create Variations", desc: "Generate 3 options" },
  { icon: Smartphone, label: "Make Responsive", desc: "Adapt to all screens" },
  { icon: Accessibility, label: "Accessibility", desc: "Improve a11y" },
  { icon: Moon, label: "Dark Mode", desc: "Generate dark variant" },
  { icon: Minimize2, label: "Simplify", desc: "Reduce complexity" },
  { icon: Grid3X3, label: "Design System", desc: "Extract tokens" },
];

const contextTargets = [
  { icon: MousePointer2, label: "Selected Layer", active: true },
  { icon: Frame, label: "Current Frame" },
  { icon: Layers, label: "Entire Page" },
];

const AIChatPanel = ({ onClose, selectedLayer }: Props) => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState(sampleChatMessages);
  const [isGenerating, setIsGenerating] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("chat");
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [activeTarget, setActiveTarget] = useState(0);
  const [compareMode, setCompareMode] = useState(false);
  const [compareSlider, setCompareSlider] = useState(50);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const contextLabel = selectedLayer
    ? `Layer "${selectedLayer.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}"`
    : "Landing Page";

  const handleSend = (text?: string) => {
    const content = text || input;
    if (!content.trim()) return;
    const userMsg = {
      id: String(messages.length + 1),
      role: "user" as const,
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages([...messages, userMsg]);
    setInput("");
    setIsGenerating(true);
    setShowQuickActions(false);

    setTimeout(() => {
      const aiMsg = {
        id: String(messages.length + 2),
        role: "assistant" as const,
        content: `I've applied the changes to your design:\n\n• **Layout** — Refined grid structure and spacing rhythm\n• **Typography** — Improved scale and weight hierarchy\n• **Colors** — Enhanced contrast and accent system\n• **Depth** — Added sophisticated layering with blur effects\n\n3 variations are available for comparison.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        applied: true,
        hasVariations: true,
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsGenerating(false);
    }, 2500);
  };

  return (
    <aside className="w-[340px] border-l border-border bg-card flex flex-col shrink-0 animate-slide-in-right relative">
      {/* Glowing top accent */}
      <div className="absolute top-0 left-0 right-0 h-px nova-gradient opacity-60" />

      {/* Header */}
      <div className="px-4 py-3 border-b border-border">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg nova-gradient flex items-center justify-center shadow-lg shadow-primary/20">
              <Sparkles className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <div>
              <span className="text-sm font-semibold">Nova AI</span>
              <div className="flex items-center gap-1 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-glow-pulse" />
                <span className="text-[10px] text-muted-foreground">Active</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant={viewMode === "chat" ? "secondary" : "ghost"}
              size="icon"
              className="h-7 w-7"
              onClick={() => setViewMode("chat")}
              title="Chat"
            >
              <Sparkles className="w-3 h-3" />
            </Button>
            <Button
              variant={viewMode === "variations" ? "secondary" : "ghost"}
              size="icon"
              className="h-7 w-7"
              onClick={() => setViewMode("variations")}
              title="Variations"
            >
              <Copy className="w-3 h-3" />
            </Button>
            <Button
              variant={viewMode === "compare" ? "secondary" : "ghost"}
              size="icon"
              className="h-7 w-7"
              onClick={() => setViewMode("compare")}
              title="Compare"
            >
              <ArrowLeftRight className="w-3 h-3" />
            </Button>
            <div className="w-px h-4 bg-border mx-0.5" />
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
              <X className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* Context targeting */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-secondary/30">
          {contextTargets.map((target, i) => (
            <button
              key={target.label}
              onClick={() => setActiveTarget(i)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[10px] font-medium transition-all ${
                activeTarget === i
                  ? "bg-primary/15 text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <target.icon className="w-3 h-3" />
              {target.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content area */}
      {viewMode === "chat" && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-auto p-4 space-y-4">
            {/* Context badge */}
            <div className="flex justify-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/15 text-[10px] text-primary">
                <Frame className="w-3 h-3" />
                Context: {contextLabel}
              </div>
            </div>

            {messages.map((msg) => (
              <div key={msg.id} className={`${msg.role === "user" ? "flex justify-end" : ""} animate-fade-in`}>
                <div
                  className={`max-w-[92%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                    msg.role === "user"
                      ? "bg-primary/15 text-foreground ml-4 rounded-br-sm"
                      : "bg-secondary/40 border border-border/50 text-foreground rounded-bl-sm"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <div className="space-y-2">
                      {msg.content.split("\n").map((line, i) => {
                        if (line.startsWith("• **")) {
                          const match = line.match(/• \*\*(.*?)\*\* — (.*)/);
                          if (match) {
                            return (
                              <p key={i} className="flex items-start gap-1.5">
                                <span className="w-1 h-1 rounded-full bg-primary mt-1.5 shrink-0" />
                                <span><strong className="text-foreground">{match[1]}</strong> <span className="text-muted-foreground">— {match[2]}</span></span>
                              </p>
                            );
                          }
                        }
                        return line.trim() ? <p key={i}>{line}</p> : null;
                      })}

                      {"applied" in msg && msg.applied && (
                        <div className="mt-3 pt-3 border-t border-border/50 space-y-2">
                          {/* Action buttons */}
                          <div className="flex items-center gap-1.5">
                            <Button size="sm" className="h-6 text-[10px] px-2.5 nova-gradient border-0 text-primary-foreground">
                              <Check className="w-3 h-3 mr-1" /> Accept
                            </Button>
                            <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2">
                              <Undo2 className="w-3 h-3 mr-1" /> Revert
                            </Button>
                            <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2">
                              <RotateCcw className="w-3 h-3 mr-1" /> Retry
                            </Button>
                          </div>

                          {/* Variation / Compare shortcuts */}
                          {"hasVariations" in msg && msg.hasVariations && (
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => setViewMode("variations")}
                                className="flex items-center gap-1 px-2 py-1 rounded-md bg-primary/10 text-[10px] text-primary hover:bg-primary/15 transition-colors"
                              >
                                <Copy className="w-3 h-3" /> View 3 variations
                              </button>
                              <button
                                onClick={() => setViewMode("compare")}
                                className="flex items-center gap-1 px-2 py-1 rounded-md bg-secondary/50 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                              >
                                <ArrowLeftRight className="w-3 h-3" /> Before / After
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    msg.content
                  )}
                </div>
                <div className={`text-[9px] text-muted-foreground mt-1 px-1 ${msg.role === "user" ? "text-right" : ""}`}>
                  {msg.timestamp}
                </div>
              </div>
            ))}

            {isGenerating && (
              <div className="space-y-2 animate-fade-in">
                <div className="flex items-center gap-2 text-[10px] text-primary">
                  <Sparkles className="w-3 h-3 animate-glow-pulse" />
                  Nova is thinking...
                </div>
                <div className="h-1 rounded-full overflow-hidden bg-secondary">
                  <div
                    className="h-full nova-gradient animate-shimmer rounded-full"
                    style={{ backgroundSize: "200% 100%", width: "60%" }}
                  />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick actions panel */}
          {showQuickActions && (
            <div className="border-t border-border bg-card/95 backdrop-blur-sm p-3 animate-fade-in">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Quick Actions</span>
                <button onClick={() => setShowQuickActions(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-3 h-3" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {quickActions.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => handleSend(action.label)}
                    className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-secondary/30 border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all text-left group"
                  >
                    <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors shrink-0">
                      <action.icon className="w-3 h-3 text-primary" />
                    </div>
                    <div>
                      <div className="text-[10px] font-medium text-foreground">{action.label}</div>
                      <div className="text-[9px] text-muted-foreground">{action.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Suggestion pills */}
          {!showQuickActions && (
            <div className="px-4 pb-2">
              <div className="flex flex-wrap gap-1.5">
                {aiSuggestions.slice(0, 4).map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSend(s)}
                    className="px-2.5 py-1.5 rounded-full bg-secondary/40 border border-border/50 text-[10px] text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-primary/5 transition-all"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-3 border-t border-border">
            <div className="flex items-center gap-2 rounded-xl bg-secondary/20 border border-border/50 px-3 py-2.5 focus-within:border-primary/40 focus-within:shadow-[0_0_0_3px_hsl(263_70%_58%/0.08)] transition-all">
              <button
                onClick={() => setShowQuickActions(!showQuickActions)}
                className={`p-1 rounded-md transition-colors shrink-0 ${showQuickActions ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-primary hover:bg-primary/10"}`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
              </button>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                placeholder="Command Nova..."
                className="flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground"
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim()}
                className="p-1.5 rounded-lg nova-gradient text-primary-foreground disabled:opacity-30 transition-all hover:shadow-md hover:shadow-primary/20 disabled:bg-none disabled:text-muted-foreground"
              >
                <Send className="w-3 h-3" />
              </button>
            </div>
            <div className="flex items-center justify-center gap-3 mt-2">
              <span className="text-[9px] text-muted-foreground">⌘K Command</span>
              <span className="text-[9px] text-muted-foreground">⌘⇧A Quick Actions</span>
            </div>
          </div>
        </>
      )}

      {/* Variations view */}
      {viewMode === "variations" && (
        <div className="flex-1 overflow-auto p-4 space-y-3 animate-fade-in">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium">3 Variations Generated</span>
            <button onClick={() => setViewMode("chat")} className="text-[10px] text-primary hover:underline">
              Back to chat
            </button>
          </div>
          {[
            { label: "Minimal Clean", desc: "Reduced visual weight, more whitespace, refined typography" },
            { label: "Bold & Vibrant", desc: "Stronger contrast, saturated accents, bolder hierarchy" },
            { label: "Soft Premium", desc: "Glass effects, subtle gradients, elegant depth layers" },
          ].map((variation, i) => (
            <div
              key={i}
              className={`rounded-xl border transition-all cursor-pointer group ${
                i === 0
                  ? "border-primary/40 bg-primary/5 shadow-lg shadow-primary/5"
                  : "border-border/50 bg-secondary/20 hover:border-primary/20 hover:bg-primary/5"
              }`}
            >
              {/* Mock preview */}
              <div className="h-32 rounded-t-xl nova-dot-grid relative overflow-hidden m-1.5 mb-0 rounded-b-none">
                <div className="absolute inset-3 rounded-lg bg-card/80 backdrop-blur-sm border border-border/50 flex flex-col items-center justify-center gap-1.5">
                  <div className={`w-20 h-2.5 rounded ${i === 0 ? "bg-foreground/15" : i === 1 ? "bg-primary/30" : "bg-foreground/10"}`} />
                  <div className={`w-14 h-1.5 rounded ${i === 0 ? "bg-foreground/10" : i === 1 ? "bg-primary/20" : "bg-foreground/8"}`} />
                  <div className={`w-12 h-5 rounded-md mt-1 ${i === 0 ? "bg-foreground/15" : i === 1 ? "nova-gradient" : "bg-primary/20"}`} />
                </div>
                {i === 0 && (
                  <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md bg-primary/20 text-[8px] text-primary font-medium">
                    Selected
                  </div>
                )}
              </div>
              <div className="p-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium">{variation.label}</span>
                  <span className="text-[10px] text-muted-foreground">Variation {i + 1}</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5">{variation.desc}</p>
                <div className="flex items-center gap-1.5 mt-2">
                  <Button size="sm" className={`h-6 text-[10px] px-2.5 ${i === 0 ? "nova-gradient border-0 text-primary-foreground" : ""}`} variant={i === 0 ? "default" : "outline"}>
                    {i === 0 ? <><Check className="w-3 h-3 mr-1" /> Apply</> : "Select"}
                  </Button>
                  <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2">
                    <RotateCcw className="w-3 h-3 mr-1" /> Regenerate
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Compare / Before-After view */}
      {viewMode === "compare" && (
        <div className="flex-1 overflow-auto p-4 space-y-4 animate-fade-in">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium">Before / After</span>
            <button onClick={() => setViewMode("chat")} className="text-[10px] text-primary hover:underline">
              Back to chat
            </button>
          </div>

          {/* Compare slider */}
          <div className="rounded-xl border border-border overflow-hidden relative h-64">
            {/* "Before" side */}
            <div className="absolute inset-0 nova-dot-grid">
              <div className="absolute inset-4 rounded-lg bg-card/60 border border-border/30 flex flex-col items-center justify-center gap-2">
                <div className="w-24 h-3 rounded bg-foreground/10" />
                <div className="w-16 h-2 rounded bg-foreground/8" />
                <div className="w-14 h-6 rounded bg-muted/50 mt-1" />
                <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[8px] bg-secondary text-muted-foreground">Before</div>
              </div>
            </div>

            {/* "After" side (clipped) */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ clipPath: `inset(0 ${100 - compareSlider}% 0 0)` }}
            >
              <div className="absolute inset-0 nova-dot-grid">
                <div className="absolute inset-4 rounded-lg bg-card/80 backdrop-blur-sm border border-primary/20 flex flex-col items-center justify-center gap-2 shadow-lg shadow-primary/5">
                  <div className="w-28 h-4 rounded bg-foreground/20" />
                  <div className="w-20 h-2 rounded bg-foreground/12" />
                  <div className="w-16 h-7 rounded-lg nova-gradient mt-1" />
                  <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[8px] bg-primary/20 text-primary font-medium">After</div>
                </div>
              </div>
            </div>

            {/* Slider handle */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-primary z-10 cursor-col-resize"
              style={{ left: `${compareSlider}%` }}
            >
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-primary border-2 border-primary-foreground shadow-lg flex items-center justify-center">
                <ArrowLeftRight className="w-3 h-3 text-primary-foreground" />
              </div>
            </div>

            {/* Invisible slider input */}
            <input
              type="range"
              min={0}
              max={100}
              value={compareSlider}
              onChange={(e) => setCompareSlider(Number(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-col-resize z-20"
            />
          </div>

          {/* Changes summary */}
          <div className="rounded-xl border border-border bg-secondary/20 p-3 space-y-2">
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Changes Applied</span>
            {[
              { prop: "Heading size", from: "32px", to: "48px" },
              { prop: "Spacing", from: "16px", to: "24px" },
              { prop: "Button radius", from: "4px", to: "12px" },
              { prop: "Shadow depth", from: "none", to: "lg" },
              { prop: "Color accent", from: "#666", to: "violet-500" },
            ].map((change) => (
              <div key={change.prop} className="flex items-center justify-between text-[10px]">
                <span className="text-muted-foreground">{change.prop}</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-muted-foreground/60 line-through font-mono">{change.from}</span>
                  <span className="text-foreground">→</span>
                  <span className="text-primary font-mono">{change.to}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" className="flex-1 h-8 nova-gradient border-0 text-primary-foreground text-xs">
              <Check className="w-3.5 h-3.5 mr-1.5" /> Accept Changes
            </Button>
            <Button variant="outline" size="sm" className="h-8 text-xs border-border">
              <Undo2 className="w-3.5 h-3.5 mr-1.5" /> Revert
            </Button>
          </div>
        </div>
      )}
    </aside>
  );
};

export default AIChatPanel;
