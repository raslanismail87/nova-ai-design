import { useState, useRef, useEffect, useCallback } from "react";
import {
  X, Sparkles, Send, Check, RotateCcw, Wand2, Layout, Lightbulb,
  Palette, Type, Smartphone, Shuffle, ArrowLeftRight, Zap, Moon,
  Star, GitBranch, ChevronRight, Copy, SlidersHorizontal,
} from "lucide-react";
import { useCanvas, CanvasElement } from "@/contexts/CanvasContext";
import { toast } from "sonner";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Change {
  elementId: string;
  elementName: string;
  property: string;
  before: string;
  after: string;
}

interface Variation {
  id: string;
  label: string;
  desc: string;
  palette: string[];
  tag: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  status: "thinking" | "streaming" | "done";
  applied?: boolean;
  rejected?: boolean;
  canApply?: boolean;
  changes?: Change[];
  variations?: Variation[];
}

// ─── AI Response Bank ─────────────────────────────────────────────────────────

const VARIATIONS: Variation[] = [
  {
    id: "v1",
    label: "Minimal Ink",
    desc: "Clean white canvas, sharp type hierarchy, ink-black accents",
    palette: ["#FAFAFA", "#F0F0F5", "#1A1A2E", "#8B5CF6"],
    tag: "Minimal",
  },
  {
    id: "v2",
    label: "Glass Premium",
    desc: "Frosted dark panels, violet-to-cyan gradients, elevated depth",
    palette: ["#0D0D1A", "#7C3AED", "#06B6D4", "rgba(255,255,255,0.06)"],
    tag: "Premium",
  },
  {
    id: "v3",
    label: "Neon Brutalist",
    desc: "Bold contrast, vibrant accents, strong geometric structure",
    palette: ["#050505", "#FF3366", "#FFD93D", "#00FFCC"],
    tag: "Bold",
  },
];

const RESPONSES: Record<string, {
  content: string;
  canApply?: boolean;
  variations?: Variation[];
  applyFn?: (elements: CanvasElement[]) => { id: string; updates: Partial<CanvasElement> }[];
}> = {
  restyle: {
    content: "I've crafted a premium restyle for the selected elements:\n\n**Visual changes applied:**\n• Gradient fill — violet → cyan sweep\n• Elevated shadow — 20px blur, 8px Y offset\n• Softened radius — 12px for approachable depth\n• Subtle glass overlay — 95% opacity with tint\n\nThe update follows the 8px spacing system and passes WCAG AA contrast.",
    canApply: true,
    applyFn: (els) =>
      els.map((el) => ({
        id: el.id,
        updates: {
          fill: "linear-gradient(135deg, #8B5CF6, #06B6D4)",
          shadowColor: "rgba(139, 92, 246, 0.35)",
          shadowBlur: 20,
          shadowY: 8,
          shadowX: 0,
          cornerRadius: el.type !== "ellipse" && el.type !== "text" ? 12 : el.cornerRadius,
        },
      })),
  },
  "dark mode": {
    content: "Dark mode variant generated across all layers:\n\n**Transformation summary:**\n• Backgrounds — Deep navy `#0F0F1A` and `#1A1A2E`\n• Text — White at 95% opacity for warm contrast\n• Cards — Subtle border glow `rgba(255,255,255,0.06)`\n• Accents — Brand violet preserved, luminance adjusted\n\nAll 12 elements maintain WCAG AA. The system is token-based — easy to switch.",
    canApply: true,
    applyFn: (els) =>
      els.map((el) => ({
        id: el.id,
        updates:
          el.type === "text"
            ? { fill: "#F5F5FF" }
            : { fill: "linear-gradient(135deg, #0F0F1A, #1A1A2E)", stroke: "rgba(255,255,255,0.06)", strokeWidth: 1 },
      })),
  },
  improve: {
    content: "I found several UX opportunities and applied them:\n\n**Typography refined:**\n• Scale increased by 10% — clearer hierarchy\n• Line height → 1.5 — improved readability\n• Letter spacing → −0.02em — tighter, more premium feel\n\n**Spacing fixed:**\n• Padding increased by 8px on all elements\n• Grid-aligned to 8px system\n\nContrast ratio now 7.1:1 on all text layers.",
    canApply: true,
    applyFn: (els) =>
      els
        .filter((el) => el.type === "text")
        .map((el) => ({
          id: el.id,
          updates: {
            fontSize: Math.round((el.fontSize || 16) * 1.1),
            lineHeight: 1.5,
            letterSpacing: -0.02,
          },
        })),
  },
  variations: {
    content: "I've generated **3 design directions** based on your current layout. Each explores a different aesthetic while preserving your content structure:",
    canApply: false,
    variations: VARIATIONS,
  },
  hero: {
    content: "Hero section added with full structure:\n\n**Components placed:**\n• Headline — 56px, ExtraBold, tight tracking\n• Subheadline — 18px, muted, 60% opacity\n• Primary CTA — Gradient button, 48px tall\n• Secondary CTA — Ghost style, consistent height\n• Hero visual placeholder — 640×480 frame\n\nAll elements use the design system tokens.",
    canApply: true,
    applyFn: (els) => [],
  },
  layout: {
    content: "Layout restructured for better visual flow:\n\n**Changes made:**\n• Implemented F-pattern reading order\n• Introduced visual hierarchy via size contrast\n• Added 24px baseline grid alignment\n• Removed competing focal points\n\nConversion-optimized structure based on Nielsen Norman Group research.",
    canApply: true,
    applyFn: (els) => [],
  },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function matchResponse(prompt: string) {
  const p = prompt.toLowerCase();
  if (p.includes("restyle") || p.includes("premium") || p.includes("style")) return RESPONSES.restyle;
  if (p.includes("dark") || p.includes("night")) return RESPONSES["dark mode"];
  if (p.includes("improv") || p.includes("ux") || p.includes("usability") || p.includes("fix")) return RESPONSES.improve;
  if (p.includes("variat") || p.includes("option") || p.includes("alternativ")) return RESPONSES.variations;
  if (p.includes("hero") || p.includes("section") || p.includes("add")) return RESPONSES.hero;
  if (p.includes("layout") || p.includes("restructur") || p.includes("reorder")) return RESPONSES.layout;
  return RESPONSES.restyle;
}

function formatContent(content: string) {
  const parts = content.split("\n").map((line, i) => {
    if (!line.trim()) return <div key={i} className="h-2" />;
    if (line.startsWith("**") && line.endsWith("**")) {
      return (
        <p key={i} className="text-xs font-semibold text-foreground/90 mt-3 mb-1">
          {line.slice(2, -2)}
        </p>
      );
    }
    if (line.startsWith("• ")) {
      const text = line.slice(2);
      const boldMatch = text.match(/^([^—]+)—\s*(.*)/);
      return (
        <div key={i} className="flex items-start gap-2 pl-1">
          <span className="text-primary mt-0.5 shrink-0 text-[10px]">◆</span>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            {boldMatch ? (
              <>
                <span className="text-foreground/80 font-medium">{boldMatch[1].trim()}</span>
                {" — "}
                <span>{boldMatch[2]}</span>
              </>
            ) : (
              text
            )}
          </p>
        </div>
      );
    }
    // Inline bold
    const parts2: (string | React.ReactElement)[] = [];
    const boldRe = /\*\*([^*]+)\*\*/g;
    let last = 0;
    let m: RegExpExecArray | null;
    while ((m = boldRe.exec(line)) !== null) {
      if (m.index > last) parts2.push(line.slice(last, m.index));
      parts2.push(<strong key={m.index} className="text-foreground/90 font-semibold">{m[1]}</strong>);
      last = m.index + m[0].length;
    }
    if (last < line.length) parts2.push(line.slice(last));
    return (
      <p key={i} className="text-[11px] text-muted-foreground leading-relaxed">
        {parts2}
      </p>
    );
  });
  return parts;
}

// ─── Sub-Components ───────────────────────────────────────────────────────────

const ThinkingDots = () => (
  <div className="flex items-center gap-1 py-1">
    {[0, 1, 2].map((i) => (
      <div
        key={i}
        className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-thinking-dot"
        style={{ animationDelay: `${i * 0.18}s` }}
      />
    ))}
    <span className="text-[10px] text-muted-foreground ml-1.5">Nova is thinking…</span>
  </div>
);

const VariationCard = ({
  v,
  onApply,
  applied,
}: {
  v: Variation;
  onApply: () => void;
  applied: boolean;
}) => (
  <div
    className={`rounded-xl border transition-all duration-300 overflow-hidden group ${
      applied
        ? "border-primary/40 shadow-lg shadow-primary/10"
        : "border-border/50 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5"
    }`}
  >
    {/* Palette preview */}
    <div className="h-16 flex">
      {v.palette.map((c, i) => (
        <div key={i} className="flex-1" style={{ background: c }} />
      ))}
    </div>
    {/* Info */}
    <div className="p-2.5 space-y-1.5">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold text-foreground">{v.label}</p>
        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{v.tag}</span>
      </div>
      <p className="text-[10px] text-muted-foreground leading-snug">{v.desc}</p>
      <button
        onClick={onApply}
        className={`w-full py-1.5 rounded-lg text-[10px] font-medium transition-all ${
          applied
            ? "bg-primary text-primary-foreground"
            : "bg-secondary/40 text-muted-foreground hover:bg-primary/15 hover:text-primary"
        }`}
      >
        {applied ? (
          <span className="flex items-center justify-center gap-1">
            <Check className="w-3 h-3" />
            Applied
          </span>
        ) : (
          "Apply style"
        )}
      </button>
    </div>
  </div>
);

const ChangePreview = ({ changes }: { changes: Change[] }) => {
  const [expanded, setExpanded] = useState(false);
  if (!changes.length) return null;
  const shown = expanded ? changes : changes.slice(0, 3);
  return (
    <div className="mt-3 rounded-xl overflow-hidden border border-border/50">
      <div
        className="px-3 py-2 flex items-center justify-between cursor-pointer bg-secondary/20 hover:bg-secondary/30 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-1.5">
          <SlidersHorizontal className="w-3 h-3 text-primary" />
          <span className="text-[10px] font-medium text-foreground/80">
            {changes.length} property change{changes.length !== 1 ? "s" : ""}
          </span>
        </div>
        <ChevronRight className={`w-3 h-3 text-muted-foreground transition-transform ${expanded ? "rotate-90" : ""}`} />
      </div>
      {expanded && (
        <div className="divide-y divide-border/30">
          {shown.map((c, i) => (
            <div key={i} className="px-3 py-2 flex items-center gap-2">
              <span className="text-[9px] text-muted-foreground/70 font-mono w-16 shrink-0 truncate">{c.elementName}</span>
              <span className="text-[9px] text-primary/70 font-mono flex-1 truncate">{c.property}</span>
              <div className="flex items-center gap-1.5">
                <div
                  className="w-3 h-3 rounded-sm border border-border"
                  style={{ background: c.before.startsWith("#") || c.before.startsWith("rgb") || c.before.startsWith("linear") ? c.before : undefined }}
                  title={c.before}
                />
                <ArrowLeftRight className="w-2.5 h-2.5 text-muted-foreground/50" />
                <div
                  className="w-3 h-3 rounded-sm border border-primary/30"
                  style={{ background: c.after.startsWith("#") || c.after.startsWith("rgb") || c.after.startsWith("linear") ? c.after : undefined }}
                  title={c.after}
                />
              </div>
            </div>
          ))}
          {!expanded && changes.length > 3 && (
            <p className="px-3 py-2 text-[9px] text-muted-foreground">+{changes.length - 3} more…</p>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Quick Actions ────────────────────────────────────────────────────────────

const quickActions = [
  { icon: Wand2, label: "Restyle", prompt: "Restyle selected with a premium look" },
  { icon: Shuffle, label: "Variations", prompt: "Generate 3 design variations" },
  { icon: Moon, label: "Dark mode", prompt: "Create a dark mode variant" },
  { icon: Layout, label: "Fix layout", prompt: "Improve the layout and spacing" },
  { icon: Type, label: "Typography", prompt: "Improve typography and scale" },
  { icon: Lightbulb, label: "Improve UX", prompt: "Improve usability and UX" },
  { icon: Palette, label: "Color", prompt: "Refine the color palette" },
  { icon: Smartphone, label: "Responsive", prompt: "Make it responsive for mobile" },
];

// ─── Main Component ───────────────────────────────────────────────────────────

interface Props {
  onClose: () => void;
}

export default function AIChatPanel({ onClose }: Props) {
  const { state, updateElement, selectedElements } = useCanvas();

  const selectedEl = selectedElements[0] ?? null;
  const contextName = selectedEl?.name ?? null;

  const [mode, setMode] = useState<"chat" | "variations">("chat");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! I'm **Nova**, your AI design partner.\n\nSelect any element on the canvas and ask me to restyle, restructure, or refine it. I can also generate entire sections, suggest variations, and adapt your design to different contexts.\n\nWhat would you like to create?",
      timestamp: formatTime(),
      status: "done",
    },
  ]);
  const [input, setInput] = useState("");
  const [appliedVariations, setAppliedVariations] = useState<Set<string>>(new Set());
  const [showQuickActions, setShowQuickActions] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function formatTime() {
    const now = new Date();
    return now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  }

  const buildChanges = useCallback(
    (applyFn: (els: CanvasElement[]) => { id: string; updates: Partial<CanvasElement> }[]): Change[] => {
      if (!applyFn) return [];
      const targets = selectedElements.length > 0 ? selectedElements : state.elements;
      const diffs = applyFn(targets);
      return diffs.flatMap(({ id, updates }) => {
        const el = state.elements.find((e) => e.id === id);
        if (!el) return [];
        return Object.entries(updates).map(([prop, val]) => ({
          elementId: id,
          elementName: el.name,
          property: prop,
          before: String((el as any)[prop] ?? "—"),
          after: String(val),
        }));
      });
    },
    [selectedElements, state.elements]
  );

  const applyChanges = useCallback(
    (applyFn: (els: CanvasElement[]) => { id: string; updates: Partial<CanvasElement> }[]) => {
      const targets = selectedElements.length > 0 ? selectedElements : state.elements;
      if (!targets.length) {
        toast.error("No elements to update — select something first");
        return false;
      }
      const diffs = applyFn(targets);
      diffs.forEach(({ id, updates }) => updateElement(id, updates));
      return true;
    },
    [selectedElements, state.elements, updateElement]
  );

  const streamMessage = useCallback((id: string, content: string) => {
    let i = 0;
    const len = content.length;
    const interval = setInterval(() => {
      i += Math.floor(Math.random() * 4) + 3;
      setMessages((prev) =>
        prev.map((m) =>
          m.id === id
            ? { ...m, content: content.slice(0, Math.min(i, len)), status: i >= len ? "done" : "streaming" }
            : m
        )
      );
      if (i >= len) clearInterval(interval);
    }, 16);
  }, []);

  const handleSend = useCallback(
    (promptOverride?: string) => {
      const text = (promptOverride ?? input).trim();
      if (!text) return;

      setInput("");
      setShowQuickActions(false);

      const userMsg: Message = {
        id: String(Date.now()),
        role: "user",
        content: text,
        timestamp: formatTime(),
        status: "done",
      };

      const thinkId = String(Date.now() + 1);
      const thinkMsg: Message = {
        id: thinkId,
        role: "assistant",
        content: "",
        timestamp: formatTime(),
        status: "thinking",
      };

      setMessages((prev) => [...prev, userMsg, thinkMsg]);

      const delay = 800 + Math.random() * 700;
      setTimeout(() => {
        const resp = matchResponse(text);
        const changes = resp.applyFn ? buildChanges(resp.applyFn) : [];

        const assistMsg: Message = {
          id: thinkId,
          role: "assistant",
          content: "",
          timestamp: formatTime(),
          status: "streaming",
          canApply: resp.canApply ?? false,
          changes,
          variations: resp.variations,
        };

        setMessages((prev) => prev.map((m) => (m.id === thinkId ? assistMsg : m)));
        streamMessage(thinkId, resp.content);
      }, delay);
    },
    [input, buildChanges, streamMessage]
  );

  const handleApply = useCallback(
    (msgId: string) => {
      const msg = messages.find((m) => m.id === msgId);
      if (!msg?.canApply) return;
      const resp = matchResponse(
        messages.find((m) => m.id === String(Number(msgId) - 1))?.content ?? ""
      );
      if (resp.applyFn) {
        const ok = applyChanges(resp.applyFn);
        if (ok) {
          setMessages((prev) => prev.map((m) => (m.id === msgId ? { ...m, applied: true } : m)));
          toast.success("Changes applied to canvas", { description: `${msg.changes?.length ?? 0} properties updated` });
        }
      } else {
        setMessages((prev) => prev.map((m) => (m.id === msgId ? { ...m, applied: true } : m)));
        toast.success("Design updated");
      }
    },
    [messages, applyChanges]
  );

  const handleReject = useCallback((msgId: string) => {
    setMessages((prev) => prev.map((m) => (m.id === msgId ? { ...m, rejected: true } : m)));
    toast("Discarded", { description: "Changes not applied" });
  }, []);

  const handleApplyVariation = useCallback(
    (v: Variation) => {
      setAppliedVariations((prev) => {
        const next = new Set(prev);
        next.add(v.id);
        return next;
      });

      const targets = selectedElements.length > 0 ? selectedElements : state.elements;
      const fillMap: Record<string, string> = {
        v1: "#1A1A2E",
        v2: "linear-gradient(135deg, #7C3AED, #06B6D4)",
        v3: "#050505",
      };
      targets.forEach((el) => updateElement(el.id, { fill: fillMap[v.id] ?? v.palette[1] }));
      toast.success(`Applied "${v.label}" style`);
    },
    [selectedElements, state.elements, updateElement]
  );

  return (
    <aside className="w-80 flex flex-col shrink-0 border-l border-border bg-card relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full bg-primary/6 blur-[60px] pointer-events-none" />

      {/* ── Header ────────────────────────────────────────────── */}
      <div className="relative shrink-0 px-4 pt-4 pb-3 border-b border-border/50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            {/* AI orb */}
            <div className="relative">
              <div className="w-7 h-7 rounded-xl nova-gradient flex items-center justify-center shadow-lg shadow-primary/25 animate-ai-orb">
                <Sparkles className="w-3.5 h-3.5 text-primary-foreground" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border-2 border-card" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold nova-glow-text">Nova AI</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">claude-3.5</span>
              </div>
              <p className="text-[9px] text-muted-foreground">Design intelligence</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Context badge */}
        {contextName && (
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-primary/8 border border-primary/15 mb-3">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] text-muted-foreground">Targeting</span>
            <span className="text-[10px] text-primary font-medium truncate max-w-[120px]">{contextName}</span>
            <div className="ml-auto text-[9px] text-muted-foreground/60 font-mono uppercase">{selectedEl?.type}</div>
          </div>
        )}

        {/* Mode tabs */}
        <div className="flex rounded-lg bg-secondary/30 p-0.5">
          {(["chat", "variations"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-[11px] font-medium transition-all ${
                mode === m
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {m === "chat" ? <Sparkles className="w-3 h-3" /> : <GitBranch className="w-3 h-3" />}
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* ── Chat mode ────────────────────────────────────────── */}
      {mode === "chat" && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
                {msg.role === "user" ? (
                  /* User bubble */
                  <div className="max-w-[85%] px-3.5 py-2.5 rounded-2xl rounded-tr-sm bg-primary/15 border border-primary/20">
                    <p className="text-[12px] text-foreground/90 leading-relaxed">{msg.content}</p>
                    <p className="text-[9px] text-muted-foreground/50 mt-1 text-right">{msg.timestamp}</p>
                  </div>
                ) : (
                  /* Assistant card */
                  <div className="w-full">
                    {msg.status === "thinking" ? (
                      <div className="px-3.5 py-3 rounded-2xl rounded-tl-sm bg-secondary/20 border border-border/40">
                        <ThinkingDots />
                      </div>
                    ) : (
                      <div
                        className={`rounded-2xl rounded-tl-sm border transition-all duration-300 overflow-hidden ${
                          msg.applied
                            ? "border-emerald-500/20 bg-emerald-500/5"
                            : msg.rejected
                            ? "border-border/30 bg-secondary/10 opacity-60"
                            : "border-border/40 bg-secondary/20"
                        }`}
                      >
                        <div className="px-3.5 pt-3 pb-2 space-y-1">
                          {formatContent(msg.content)}
                        </div>

                        {/* Variations grid */}
                        {msg.variations && msg.status === "done" && (
                          <div className="px-3.5 pb-3 grid grid-cols-3 gap-2 mt-2">
                            {msg.variations.map((v) => (
                              <VariationCard
                                key={v.id}
                                v={v}
                                applied={appliedVariations.has(v.id)}
                                onApply={() => handleApplyVariation(v)}
                              />
                            ))}
                          </div>
                        )}

                        {/* Change diff */}
                        {msg.changes && msg.changes.length > 0 && msg.status === "done" && !msg.applied && !msg.rejected && (
                          <div className="px-3.5 pb-2">
                            <ChangePreview changes={msg.changes} />
                          </div>
                        )}

                        {/* Apply / Reject actions */}
                        {msg.canApply && msg.status === "done" && !msg.applied && !msg.rejected && (
                          <div className="px-3.5 pb-3 pt-1 flex items-center gap-2">
                            <button
                              onClick={() => handleApply(msg.id)}
                              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl nova-gradient text-[11px] font-semibold text-primary-foreground hover:opacity-90 transition-all shadow-lg shadow-primary/20 press-scale"
                            >
                              <Check className="w-3.5 h-3.5" />
                              Apply to Canvas
                            </button>
                            <button
                              onClick={() => handleReject(msg.id)}
                              className="px-3 py-2 rounded-xl bg-secondary/30 border border-border/50 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}

                        {/* Applied state */}
                        {msg.applied && (
                          <div className="px-3.5 pb-3 pt-1 flex items-center gap-1.5 text-emerald-400">
                            <Check className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-medium">Applied to canvas</span>
                          </div>
                        )}

                        {/* Timestamp */}
                        <div className="px-3.5 pb-2">
                          <p className="text-[9px] text-muted-foreground/40">{msg.timestamp}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* ── Input area ──────────────────────────────────── */}
          <div className="shrink-0 px-3 pt-2 pb-3 border-t border-border/50 space-y-2">
            {/* Quick actions */}
            {showQuickActions && (
              <div className="flex gap-1.5 flex-wrap">
                {quickActions.slice(0, 4).map((a) => (
                  <button
                    key={a.label}
                    onClick={() => handleSend(a.prompt)}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg bg-secondary/30 border border-border/40 text-[10px] text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-primary/5 transition-all"
                  >
                    <a.icon className="w-2.5 h-2.5 text-primary" />
                    {a.label}
                  </button>
                ))}
                <button
                  onClick={() => setShowQuickActions(false)}
                  className="text-[9px] text-muted-foreground/40 hover:text-muted-foreground transition-colors ml-auto"
                >
                  ×
                </button>
              </div>
            )}

            {/* Text input */}
            <div className="relative rounded-xl bg-secondary/20 border border-border/50 focus-within:border-primary/40 focus-within:shadow-[0_0_0_3px_hsl(263_70%_58%/0.08)] transition-all">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={
                  contextName
                    ? `Ask Nova about "${contextName}"…`
                    : "Ask Nova to edit your design…"
                }
                rows={2}
                className="w-full px-3.5 pt-3 pb-2 bg-transparent text-[12px] text-foreground placeholder:text-muted-foreground/50 outline-none resize-none"
              />
              <div className="flex items-center justify-between px-3 pb-2.5">
                <div className="flex items-center gap-2">
                  {quickActions.slice(4).map((a) => (
                    <button
                      key={a.label}
                      onClick={() => setInput(a.prompt)}
                      className="text-[9px] text-muted-foreground/60 hover:text-primary transition-colors"
                      title={a.label}
                    >
                      <a.icon className="w-3 h-3" />
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] text-muted-foreground/40 font-mono">⏎ send</span>
                  <button
                    onClick={() => handleSend()}
                    disabled={!input.trim()}
                    className="w-7 h-7 rounded-lg nova-gradient flex items-center justify-center disabled:opacity-30 hover:opacity-90 transition-all shadow-md shadow-primary/20"
                  >
                    <Send className="w-3 h-3 text-primary-foreground" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Variations mode ──────────────────────────────────── */}
      {mode === "variations" && (
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-foreground">Design Directions</p>
            <p className="text-[10px] text-muted-foreground">
              {contextName
                ? `3 variations for "${contextName}"`
                : "3 complete style directions for your design"}
            </p>
          </div>

          {VARIATIONS.map((v) => (
            <div
              key={v.id}
              className={`rounded-xl border overflow-hidden transition-all duration-300 ${
                appliedVariations.has(v.id)
                  ? "border-primary/40 shadow-lg shadow-primary/10"
                  : "border-border/50 hover:border-primary/25"
              }`}
            >
              {/* Large palette swatch */}
              <div className="h-24 flex">
                {v.palette.map((c, i) => (
                  <div key={i} className="flex-1" style={{ background: c }} />
                ))}
              </div>
              <div className="p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-foreground">{v.label}</p>
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{v.tag}</span>
                </div>
                <p className="text-[10px] text-muted-foreground">{v.desc}</p>
                {/* Hex chips */}
                <div className="flex items-center gap-1 flex-wrap">
                  {v.palette.slice(0, 3).map((c, i) => (
                    <div key={i} className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-secondary/30 border border-border/40">
                      <div className="w-2 h-2 rounded-sm" style={{ background: c }} />
                      <span className="text-[8px] font-mono text-muted-foreground">{c.startsWith("#") ? c.toUpperCase() : "Gradient"}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => handleApplyVariation(v)}
                  className={`w-full py-2 rounded-lg text-[11px] font-medium transition-all flex items-center justify-center gap-1.5 ${
                    appliedVariations.has(v.id)
                      ? "bg-primary/20 text-primary border border-primary/30"
                      : "nova-gradient text-primary-foreground hover:opacity-90 shadow-md shadow-primary/15"
                  }`}
                >
                  {appliedVariations.has(v.id) ? (
                    <><Check className="w-3.5 h-3.5" />Applied</>
                  ) : (
                    <><Zap className="w-3.5 h-3.5" />Apply Direction</>
                  )}
                </button>
              </div>
            </div>
          ))}

          {/* Generate custom */}
          <div className="rounded-xl border border-dashed border-border/50 p-4 text-center space-y-2">
            <div className="w-8 h-8 rounded-xl bg-secondary/40 mx-auto flex items-center justify-center">
              <Star className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-[11px] text-muted-foreground">Generate a custom direction</p>
            <button
              onClick={() => {
                setMode("chat");
                setTimeout(() => {
                  setInput("Generate 3 design variations with different color directions");
                  inputRef.current?.focus();
                }, 100);
              }}
              className="text-[10px] text-primary hover:underline font-medium"
            >
              Describe your aesthetic →
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
