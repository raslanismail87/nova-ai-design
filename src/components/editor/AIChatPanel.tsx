import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  X, Sparkles, Send, Check, RotateCcw, ArrowLeftRight, Undo2,
  Layers, MousePointer2, Frame, Wand2, Copy, SlidersHorizontal,
  Lightbulb, Layout, Accessibility, Smartphone,
  Moon, Minimize2, Grid3X3, FileText, ChevronRight,
} from "lucide-react";
import { useCanvas, CanvasElement } from "@/contexts/CanvasContext";
import { aiSuggestions } from "@/data/mockData";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  applied?: boolean;
  hasVariations?: boolean;
  actions?: Array<{ label: string; run: () => void }>;
}

const quickActions = [
  { icon: Wand2, label: "Restyle", desc: "Transform visual style", prompt: "Restyle the selected element with a more premium look" },
  { icon: Layout, label: "Add Section", desc: "Generate content block", prompt: "Add a new section to the design" },
  { icon: Lightbulb, label: "Improve UX", desc: "Enhance usability", prompt: "Improve the UX and usability of this design" },
  { icon: FileText, label: "Add Text", desc: "Add a text element", prompt: "Add a heading text element" },
  { icon: Copy, label: "Duplicate", desc: "Duplicate selected", prompt: "Duplicate the selected element" },
  { icon: Smartphone, label: "Add Button", desc: "Add a CTA button", prompt: "Add a call-to-action button" },
  { icon: Accessibility, label: "Add Card", desc: "Add a card component", prompt: "Add a feature card" },
  { icon: Moon, label: "Dark BG", desc: "Dark background section", prompt: "Add a dark background section" },
  { icon: Minimize2, label: "Add Frame", desc: "Add a frame container", prompt: "Add a frame to contain elements" },
  { icon: Grid3X3, label: "3-Col Grid", desc: "Add 3-column grid", prompt: "Add a 3-column grid layout with cards" },
];

const contextTargets = [
  { icon: MousePointer2, label: "Selected" },
  { icon: Frame, label: "Frame" },
  { icon: Layers, label: "Page" },
];

// AI command processor — interprets prompts and modifies canvas
function processAICommand(
  prompt: string,
  selectedElements: CanvasElement[],
  addElement: (el: any) => void,
  addElements: (els: any[]) => void,
  updateElement: (id: string, updates: any) => void,
  deleteSelected: () => void,
  nextId: () => string,
): { response: string; applied: boolean; hasVariations?: boolean } {
  const p = prompt.toLowerCase();

  // Adding elements
  if (p.includes("add") || p.includes("create") || p.includes("generate") || p.includes("insert")) {
    if (p.includes("button") || p.includes("cta")) {
      addElement({
        type: "rectangle",
        x: 64 + Math.random() * 200, y: 400 + Math.random() * 100,
        width: 160, height: 48,
        rotation: 0, fill: "linear-gradient(135deg, #8B5CF6, #06B6D4)", stroke: "", strokeWidth: 0,
        opacity: 1, cornerRadius: 12,
        name: "CTA Button", visible: true, locked: false,
      });
      return {
        response: "Added a gradient CTA button to the canvas.\n\n• **Style** — Primary gradient (violet → cyan)\n• **Size** — 160 × 48px\n• **Radius** — 12px corner radius\n\nYou can move and customize it in the properties panel.",
        applied: true,
      };
    }

    if (p.includes("card") || p.includes("feature")) {
      const baseX = 48 + Math.floor(Math.random() * 3) * 200;
      addElement({
        type: "rectangle",
        x: baseX, y: 620,
        width: 180, height: 140,
        rotation: 0, fill: "rgba(30,30,40,0.8)", stroke: "rgba(255,255,255,0.07)", strokeWidth: 1,
        opacity: 1, cornerRadius: 16,
        name: "Feature Card", visible: true, locked: false,
      });
      return {
        response: "Added a feature card component.\n\n• **Background** — Dark surface (30,30,40)\n• **Border** — Subtle white 7% opacity\n• **Radius** — 16px for premium feel\n\nStack multiple cards for a grid layout.",
        applied: true,
      };
    }

    if (p.includes("text") || p.includes("heading") || p.includes("title")) {
      addElement({
        type: "text",
        x: 64, y: 120 + Math.random() * 100,
        width: 400, height: 60,
        rotation: 0, fill: "#F2F2F2", stroke: "", strokeWidth: 0,
        opacity: 1, cornerRadius: 0,
        name: "Heading",
        textContent: p.includes("sub") ? "Supporting subheadline text" : "Your headline goes here",
        fontSize: p.includes("sub") ? 18 : 48,
        fontWeight: p.includes("sub") ? "400" : "700",
        fontFamily: "Inter",
        textAlign: "left", lineHeight: 1.2, letterSpacing: -0.02,
        visible: true, locked: false,
      });
      return {
        response: `Added a ${p.includes("sub") ? "subheadline" : "heading"} text element.\n\n• **Font** — Inter ${p.includes("sub") ? "18px Regular" : "48px Bold"}\n• **Color** — #F2F2F2 (light)\n• **Letter spacing** — −0.02em for premium feel\n\nDouble-click in the canvas to edit the text directly.`,
        applied: true,
      };
    }

    if (p.includes("section") || p.includes("hero")) {
      addElements([
        {
          type: "frame",
          isFrame: true,
          x: 0, y: 200, width: 1280, height: 400,
          rotation: 0, fill: "rgba(12,12,18,1)", stroke: "", strokeWidth: 0,
          opacity: 1, cornerRadius: 0,
          name: "New Section", visible: true, locked: false,
        },
        {
          type: "text",
          x: 64, y: 280, width: 500, height: 80,
          rotation: 0, fill: "#F2F2F2", stroke: "", strokeWidth: 0,
          opacity: 1, cornerRadius: 0,
          name: "Section Heading",
          textContent: "Section Title",
          fontSize: 40, fontWeight: "700", fontFamily: "Inter",
          textAlign: "left", lineHeight: 1.2, letterSpacing: -0.02,
          visible: true, locked: false,
        },
        {
          type: "text",
          x: 64, y: 380, width: 440, height: 50,
          rotation: 0, fill: "#888", stroke: "", strokeWidth: 0,
          opacity: 1, cornerRadius: 0,
          name: "Section Subtitle",
          textContent: "Supporting description for the section",
          fontSize: 16, fontWeight: "400", fontFamily: "Inter",
          textAlign: "left", lineHeight: 1.5, letterSpacing: 0,
          visible: true, locked: false,
        },
      ]);
      return {
        response: "Added a new content section with heading and subtitle.\n\n• **Frame** — 1280 × 400px dark surface\n• **Heading** — 40px Bold Inter\n• **Subtitle** — 16px Regular muted\n\nCustomize the content and position to fit your design flow.",
        applied: true,
      };
    }

    if (p.includes("3") || p.includes("three") || p.includes("grid") || p.includes("col")) {
      addElements([
        { type: "rectangle", x: 48, y: 620, width: 368, height: 180, rotation: 0, fill: "rgba(30,30,40,0.8)", stroke: "rgba(255,255,255,0.07)", strokeWidth: 1, opacity: 1, cornerRadius: 16, name: "Card 1", visible: true, locked: false },
        { type: "rectangle", x: 456, y: 620, width: 368, height: 180, rotation: 0, fill: "rgba(30,30,40,0.8)", stroke: "rgba(255,255,255,0.07)", strokeWidth: 1, opacity: 1, cornerRadius: 16, name: "Card 2", visible: true, locked: false },
        { type: "rectangle", x: 864, y: 620, width: 368, height: 180, rotation: 0, fill: "rgba(30,30,40,0.8)", stroke: "rgba(255,255,255,0.07)", strokeWidth: 1, opacity: 1, cornerRadius: 16, name: "Card 3", visible: true, locked: false },
      ]);
      return {
        response: "Added a 3-column card grid.\n\n• **Layout** — Equal-width columns with 40px gaps\n• **Cards** — 368 × 180px each\n• **Style** — Dark surface with subtle border\n\nPerfect for features, testimonials, or pricing tiers.",
        applied: true,
        hasVariations: true,
      };
    }

    if (p.includes("frame") || p.includes("container") || p.includes("artboard")) {
      addElement({
        type: "frame",
        isFrame: true,
        x: 100, y: 100, width: 400, height: 300,
        rotation: 0, fill: "rgba(20,20,28,0.6)", stroke: "rgba(255,255,255,0.1)", strokeWidth: 1,
        opacity: 1, cornerRadius: 16,
        name: "Frame", visible: true, locked: false,
      });
      return {
        response: "Added a frame container.\n\n• **Size** — 400 × 300px\n• **Background** — Translucent dark\n• **Border** — Subtle white 10%\n\nUse frames to group and organize your design elements.",
        applied: true,
      };
    }

    if (p.includes("circle") || p.includes("ellipse") || p.includes("oval")) {
      addElement({
        type: "ellipse",
        x: 100, y: 100, width: 100, height: 100,
        rotation: 0, fill: "rgba(139,92,246,0.2)", stroke: "rgba(139,92,246,0.5)", strokeWidth: 1.5,
        opacity: 1, cornerRadius: 0,
        name: "Ellipse", visible: true, locked: false,
      });
      return { response: "Added a circle/ellipse element. You can resize and recolor it in the properties panel.", applied: true };
    }
  }

  // Restyle / color changes on selected element
  if ((p.includes("restyle") || p.includes("style") || p.includes("color") || p.includes("premium")) && selectedElements.length > 0) {
    const el = selectedElements[0];
    const fills = [
      "linear-gradient(135deg, #8B5CF6, #06B6D4)",
      "rgba(139,92,246,0.25)",
      "rgba(6,182,212,0.2)",
      "rgba(20,20,30,0.9)",
    ];
    const newFill = fills[Math.floor(Math.random() * fills.length)];
    updateElement(el.id, { fill: newFill, cornerRadius: Math.max(el.cornerRadius, 12) });
    return {
      response: `Restyled "${el.name}" with a more premium aesthetic.\n\n• **Fill** — ${newFill.startsWith("linear") ? "Violet-to-cyan gradient" : "Refined translucent tone"}\n• **Radius** — Increased to ${Math.max(el.cornerRadius, 12)}px\n\nCheck the right panel to fine-tune further.`,
      applied: true,
      hasVariations: true,
    };
  }

  // Duplicate selected
  if ((p.includes("duplicate") || p.includes("copy")) && selectedElements.length > 0) {
    const el = selectedElements[0];
    addElement({ ...el, x: el.x + 24, y: el.y + 24, name: `${el.name} Copy` });
    return {
      response: `Duplicated "${el.name}" with a 24px offset.\n\nThe copy is now selected in the layers panel.`,
      applied: true,
    };
  }

  // Delete
  if ((p.includes("delete") || p.includes("remove")) && selectedElements.length > 0) {
    const names = selectedElements.map((e) => e.name).join(", ");
    deleteSelected();
    return {
      response: `Deleted ${selectedElements.length > 1 ? `${selectedElements.length} elements` : `"${names}"`} from the canvas.\n\nUse ⌘Z to undo if needed.`,
      applied: true,
    };
  }

  // Responsive / mobile
  if (p.includes("mobile") || p.includes("responsive")) {
    addElements([
      {
        type: "frame",
        isFrame: true,
        x: 900, y: 50, width: 390, height: 844,
        rotation: 0, fill: "#0a0a0f", stroke: "rgba(255,255,255,0.1)", strokeWidth: 1,
        opacity: 1, cornerRadius: 44,
        name: "Mobile Frame (390×844)", visible: true, locked: false,
      },
    ]);
    return {
      response: "Added a mobile frame (iPhone 14 — 390×844).\n\n• **Notch radius** — 44px to match real device\n• **Position** — Next to your existing desktop design\n\nYou can now design the mobile variant alongside desktop.",
      applied: true,
    };
  }

  // Dark mode
  if (p.includes("dark")) {
    addElement({
      type: "frame",
      isFrame: true,
      x: 0, y: 950, width: 1280, height: 900,
      rotation: 0, fill: "#050508", stroke: "", strokeWidth: 0,
      opacity: 1, cornerRadius: 0,
      name: "Dark Mode Variant", visible: true, locked: false,
    });
    return {
      response: "Added a dark mode frame below your current design.\n\n• **Background** — Deep #050508\n• **Size** — Matches your artboard (1280×900)\n\nDuplicate your elements into this frame and swap colors for a true dark variant.",
      applied: true,
    };
  }

  // Generic responses for other prompts
  const responses = [
    {
      r: "I've analyzed the design and applied improvements:\n\n• **Spacing** — Refined 8px grid rhythm throughout\n• **Typography** — Improved scale and weight contrast\n• **Depth** — Enhanced layering with softer shadows\n• **Alignment** — Elements snapped to optical grid\n\nUse ⌘Z to revert.",
      applied: true,
      hasVariations: true,
    },
    {
      r: "Here's what I improved based on your request:\n\n• **Hierarchy** — Strengthened visual flow from headline to CTA\n• **Color balance** — Adjusted accent usage for more focus\n• **Whitespace** — Increased breathing room between sections\n\n3 style variations are ready to compare.",
      applied: true,
      hasVariations: true,
    },
    {
      r: "I understand what you're going for. To apply this change:\n\n1. Select the element you want to modify\n2. Use the right panel to adjust specific properties\n3. Or tell me exactly which element to change\n\nFor best results, try: \"Make the hero heading larger\" or \"Change the card color to violet\".",
      applied: false,
    },
  ];
  const r = responses[Math.floor(Math.random() * responses.length)];
  return { response: r.r, applied: r.applied, hasVariations: r.hasVariations };
}

interface Props {
  onClose: () => void;
}

type ViewMode = "chat" | "variations" | "compare";

export default function AIChatPanel({ onClose }: Props) {
  const { state, addElement, addElements, updateElement, deleteSelected, selectedElements, nextId } = useCanvas();

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "user",
      content: "Make this landing page look more premium and modern",
      timestamp: "2:34 PM",
    },
    {
      id: "2",
      role: "assistant",
      content: "I've refined the landing page with several improvements:\n\n• **Typography** — Increased heading scale, tighter letter-spacing\n• **Spacing** — 8px grid system with generous padding\n• **Colors** — Violet-to-cyan gradient accent system\n• **Depth** — Layered panel shadows and glass effects\n• **Buttons** — Primary gradient with ghost secondary",
      timestamp: "2:34 PM",
      applied: true,
    },
  ]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("chat");
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [activeTarget, setActiveTarget] = useState(0);
  const [compareSlider, setCompareSlider] = useState(50);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isGenerating]);

  const contextLabel =
    selectedElements.length > 0
      ? `"${selectedElements[0].name}"`
      : "Landing Page";

  // Typewriter effect for AI response
  const addTypingMessage = useCallback((fullContent: string, applied: boolean, hasVariations?: boolean, extraActions?: Array<{ label: string; run: () => void }>) => {
    const msgId = String(Date.now());
    setMessages((prev) => [
      ...prev,
      {
        id: msgId,
        role: "assistant",
        content: "",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        applied,
        hasVariations,
        actions: extraActions,
      },
    ]);

    let i = 0;
    const timer = setInterval(() => {
      i++;
      setMessages((prev) =>
        prev.map((m) =>
          m.id === msgId ? { ...m, content: fullContent.slice(0, i * 3) } : m
        )
      );
      if (i * 3 >= fullContent.length) {
        clearInterval(timer);
        setMessages((prev) =>
          prev.map((m) => (m.id === msgId ? { ...m, content: fullContent } : m))
        );
        setIsGenerating(false);
      }
    }, 20);
  }, []);

  const handleSend = useCallback((text?: string) => {
    const content = (text || input).trim();
    if (!content) return;

    const userMsg: Message = {
      id: String(Date.now()),
      role: "user",
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsGenerating(true);
    setShowQuickActions(false);

    // Simulate AI thinking delay, then process
    setTimeout(() => {
      const { response, applied, hasVariations } = processAICommand(
        content,
        selectedElements,
        addElement,
        addElements,
        updateElement,
        deleteSelected,
        nextId,
      );
      addTypingMessage(response, applied, hasVariations);
    }, 900 + Math.random() * 600);
  }, [input, selectedElements, addElement, addElements, updateElement, deleteSelected, nextId, addTypingMessage]);

  return (
    <aside className="w-[340px] border-l border-border bg-card flex flex-col shrink-0 animate-slide-in-right relative z-20">
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
                <span className="text-[10px] text-muted-foreground">Active · {state.elements.length} elements</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant={viewMode === "chat" ? "secondary" : "ghost"} size="icon" className="h-7 w-7" onClick={() => setViewMode("chat")} title="Chat">
              <Sparkles className="w-3 h-3" />
            </Button>
            <Button variant={viewMode === "variations" ? "secondary" : "ghost"} size="icon" className="h-7 w-7" onClick={() => setViewMode("variations")} title="Variations">
              <Copy className="w-3 h-3" />
            </Button>
            <Button variant={viewMode === "compare" ? "secondary" : "ghost"} size="icon" className="h-7 w-7" onClick={() => setViewMode("compare")} title="Compare">
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
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[10px] font-medium transition-all flex-1 justify-center ${
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

        {/* Context badge */}
        <div className="flex items-center gap-1.5 mt-2 px-2 py-1.5 rounded-lg bg-secondary/20 border border-border/50">
          <Frame className="w-3 h-3 text-primary" />
          <span className="text-[10px] text-muted-foreground">Context:</span>
          <span className="text-[10px] text-primary font-medium truncate">{contextLabel}</span>
          {selectedElements.length > 0 && (
            <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">
              {selectedElements[0].type}
            </span>
          )}
        </div>
      </div>

      {/* Content area */}
      {viewMode === "chat" && (
        <>
          <div className="flex-1 overflow-auto p-4 space-y-4">
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
                        if (!line.trim()) return null;
                        const match = line.match(/^• \*\*(.*?)\*\* — (.*)/);
                        if (match) {
                          return (
                            <p key={i} className="flex items-start gap-1.5">
                              <span className="w-1 h-1 rounded-full bg-primary mt-1.5 shrink-0" />
                              <span>
                                <strong className="text-foreground">{match[1]}</strong>{" "}
                                <span className="text-muted-foreground">— {match[2]}</span>
                              </span>
                            </p>
                          );
                        }
                        if (line.match(/^\d+\./)) {
                          return <p key={i} className="text-muted-foreground">{line}</p>;
                        }
                        return <p key={i}>{line}</p>;
                      })}

                      {msg.applied && (
                        <div className="mt-3 pt-3 border-t border-border/50 space-y-2">
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
                          {msg.hasVariations && (
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
                  <div className="h-full nova-gradient animate-shimmer rounded-full" style={{ backgroundSize: "200% 100%", width: "70%" }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick actions */}
          {showQuickActions && (
            <div className="border-t border-border bg-card/95 p-3 animate-fade-in">
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
                    onClick={() => { setShowQuickActions(false); handleSend(action.prompt); }}
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
                disabled={!input.trim() || isGenerating}
                className="p-1.5 rounded-lg nova-gradient text-primary-foreground disabled:opacity-30 transition-all hover:shadow-md hover:shadow-primary/20 disabled:bg-none disabled:text-muted-foreground disabled:nova-gradient-none"
              >
                <Send className="w-3 h-3" />
              </button>
            </div>
            <div className="flex items-center justify-center gap-3 mt-2">
              <span className="text-[9px] text-muted-foreground">⌘K Command</span>
              <span className="text-[9px] text-muted-foreground">Tab Quick actions</span>
            </div>
          </div>
        </>
      )}

      {/* Variations view */}
      {viewMode === "variations" && (
        <div className="flex-1 overflow-auto p-4 space-y-3 animate-fade-in">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium">3 Variations Generated</span>
            <button onClick={() => setViewMode("chat")} className="text-[10px] text-primary hover:underline flex items-center gap-1">
              <ChevronRight className="w-3 h-3" /> Back to chat
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
              <div className="h-28 rounded-t-xl nova-dot-grid relative overflow-hidden m-1.5 mb-0 rounded-b-none">
                <div className="absolute inset-3 rounded-lg bg-card/80 backdrop-blur-sm border border-border/50 flex flex-col items-center justify-center gap-1.5">
                  <div className={`w-20 h-2.5 rounded ${i === 0 ? "bg-foreground/15" : i === 1 ? "bg-primary/30" : "bg-foreground/10"}`} />
                  <div className={`w-14 h-1.5 rounded ${i === 0 ? "bg-foreground/10" : i === 1 ? "bg-primary/20" : "bg-foreground/8"}`} />
                  <div className={`w-12 h-5 rounded-md mt-1 ${i === 0 ? "bg-foreground/15" : i === 1 ? "nova-gradient" : "bg-primary/20"}`} />
                </div>
                {i === 0 && <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md bg-primary/20 text-[8px] text-primary font-medium">Selected</div>}
              </div>
              <div className="p-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium">{variation.label}</span>
                  <span className="text-[10px] text-muted-foreground">V{i + 1}</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5">{variation.desc}</p>
                <div className="flex items-center gap-1.5 mt-2">
                  <Button size="sm" className={`h-6 text-[10px] px-2.5 ${i === 0 ? "nova-gradient border-0 text-primary-foreground" : ""}`} variant={i === 0 ? "default" : "outline"}>
                    {i === 0 ? <><Check className="w-3 h-3 mr-1" /> Apply</> : "Select"}
                  </Button>
                  <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2">
                    <RotateCcw className="w-3 h-3 mr-1" /> Regen
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Compare view */}
      {viewMode === "compare" && (
        <div className="flex-1 overflow-auto p-4 space-y-4 animate-fade-in">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium">Before / After</span>
            <button onClick={() => setViewMode("chat")} className="text-[10px] text-primary hover:underline flex items-center gap-1">
              <ChevronRight className="w-3 h-3" /> Back
            </button>
          </div>

          <div className="rounded-xl border border-border overflow-hidden relative h-52">
            <div className="absolute inset-0 nova-dot-grid">
              <div className="absolute inset-4 rounded-lg bg-card/60 border border-border/30 flex flex-col items-center justify-center gap-2">
                <div className="w-24 h-3 rounded bg-foreground/10" />
                <div className="w-16 h-2 rounded bg-foreground/8" />
                <div className="w-14 h-6 rounded bg-muted/50 mt-1" />
                <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[8px] bg-secondary text-muted-foreground">Before</div>
              </div>
            </div>
            <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 ${100 - compareSlider}% 0 0)` }}>
              <div className="absolute inset-0 nova-dot-grid">
                <div className="absolute inset-4 rounded-lg bg-card/80 backdrop-blur-sm border border-primary/20 flex flex-col items-center justify-center gap-2 shadow-lg shadow-primary/5">
                  <div className="w-28 h-4 rounded bg-foreground/20" />
                  <div className="w-20 h-2 rounded bg-foreground/12" />
                  <div className="w-16 h-7 rounded-lg nova-gradient mt-1" />
                  <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[8px] bg-primary/20 text-primary font-medium">After</div>
                </div>
              </div>
            </div>
            <div className="absolute top-0 bottom-0 w-0.5 bg-primary z-10 cursor-col-resize" style={{ left: `${compareSlider}%` }}>
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-primary border-2 border-primary-foreground shadow-lg flex items-center justify-center">
                <ArrowLeftRight className="w-3 h-3 text-primary-foreground" />
              </div>
            </div>
            <input type="range" min={0} max={100} value={compareSlider} onChange={(e) => setCompareSlider(Number(e.target.value))} className="absolute inset-0 w-full h-full opacity-0 cursor-col-resize z-20" />
          </div>

          <div className="rounded-xl border border-border bg-secondary/20 p-3 space-y-2">
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Changes Applied</span>
            {[
              { prop: "Heading size", from: "32px", to: "64px" },
              { prop: "Spacing", from: "16px", to: "24px" },
              { prop: "Corner radius", from: "4px", to: "14px" },
              { prop: "Shadow", from: "none", to: "lg/primary" },
              { prop: "Accent", from: "#666", to: "violet-500" },
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
              <Check className="w-3.5 h-3.5 mr-1.5" /> Accept
            </Button>
            <Button variant="outline" size="sm" className="h-8 text-xs border-border">
              <Undo2 className="w-3.5 h-3.5 mr-1.5" /> Revert
            </Button>
          </div>
        </div>
      )}
    </aside>
  );
}
