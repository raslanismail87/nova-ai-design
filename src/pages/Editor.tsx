import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import EditorToolbar from "@/components/editor/EditorToolbar";
import EditorLeftSidebar from "@/components/editor/EditorLeftSidebar";
import EditorCanvas from "@/components/editor/EditorCanvas";
import EditorRightSidebar from "@/components/editor/EditorRightSidebar";
import AIChatPanel from "@/components/editor/AIChatPanel";
import AIGenerationModal from "@/components/editor/AIGenerationModal";
import { CanvasProvider, useCanvas, CanvasElement } from "@/contexts/CanvasContext";
import { toast } from "sonner";
import { PanelRight, X } from "lucide-react";

// ─── Command Palette ──────────────────────────────────────────────────────────

interface CommandItem {
  id: string;
  label: string;
  shortcut?: string;
  action: () => void;
  group?: string;
}

function CommandPalette({ onClose, commands }: { onClose: () => void; commands: CommandItem[] }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const filtered = query
    ? commands.filter(
        (c) =>
          c.label.toLowerCase().includes(query.toLowerCase()) ||
          (c.group && c.group.toLowerCase().includes(query.toLowerCase()))
      )
    : commands;

  const grouped = filtered.reduce<Record<string, CommandItem[]>>((acc, cmd) => {
    const g = cmd.group || "Actions";
    if (!acc[g]) acc[g] = [];
    acc[g].push(cmd);
    return acc;
  }, {});

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[18vh] bg-foreground/30 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="w-[520px] rounded-2xl bg-card border border-border/60 shadow-2xl shadow-foreground/10 overflow-hidden animate-slide-down border-shine noise-overlay"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border/50">
          <div className="w-5 h-5 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
            <span className="text-primary text-[11px] font-mono font-medium">⌘</span>
          </div>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search commands…"
            className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/50"
            onKeyDown={(e) => {
              if (e.key === "Escape") onClose();
              if (e.key === "Enter" && filtered.length > 0) {
                filtered[0].action();
                onClose();
              }
            }}
          />
          <kbd className="kbd">Esc</kbd>
        </div>

        <div className="max-h-[360px] overflow-auto py-1.5">
          {Object.keys(grouped).length === 0 ? (
            <div className="px-4 py-12 text-center">
              <p className="text-sm text-muted-foreground/60">No commands found</p>
              <p className="text-xs text-muted-foreground/30 mt-1">Try a different search</p>
            </div>
          ) : (
            Object.entries(grouped).map(([group, items]) => (
              <div key={group}>
                <p className="px-4 py-1.5 text-[10px] font-medium text-muted-foreground/50 uppercase tracking-wider">{group}</p>
                {items.map((cmd) => (
                  <button
                    key={cmd.id}
                    onClick={() => { cmd.action(); onClose(); }}
                    className="w-full flex items-center justify-between px-4 py-2 text-[13px] text-foreground/80 hover:bg-primary/8 hover:text-primary transition-colors duration-100 text-left"
                  >
                    <span>{cmd.label}</span>
                    {cmd.shortcut && (
                      <kbd className="kbd">
                        {cmd.shortcut}
                      </kbd>
                    )}
                  </button>
                ))}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}


// ─── Present / Preview Mode ───────────────────────────────────────────────────

function PresentMode({
  pages,
  initialPageId,
  artboardWidth,
  artboardHeight,
  onClose,
}: {
  pages: { id: string; name: string; elements: CanvasElement[] }[];
  initialPageId: string;
  artboardWidth: number;
  artboardHeight: number;
  onClose: () => void;
}) {
  const [currentPageId, setCurrentPageId] = useState(initialPageId);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const currentPage = pages.find((p) => p.id === currentPageId) ?? pages[0];
  const elements = currentPage?.elements ?? [];

  const navigateToPage = (pageName: string) => {
    const target = pages.find((p) => p.name === pageName);
    if (target) setCurrentPageId(target.id);
  };

  // Calculate scale to fit the artboard in the viewport
  const scale = Math.min(
    (window.innerWidth - 80) / artboardWidth,
    (window.innerHeight - 80) / artboardHeight,
    1
  );

  return (
    <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
        title="Exit presentation (Esc)"
      >
        <X className="w-5 h-5" />
      </button>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 text-white/40 text-xs">
        {pages.length > 1 && (
          <span className="font-medium text-white/60">{currentPage?.name}</span>
        )}
        Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white/60 font-mono">Esc</kbd> to exit
      </div>
      <svg
        width={artboardWidth * scale}
        height={artboardHeight * scale}
        viewBox={`0 0 ${artboardWidth} ${artboardHeight}`}
        className="rounded-lg shadow-2xl"
        style={{ background: "#0a0a0f" }}
      >
        {elements
          .filter((el) => el.visible)
          .map((el) => {
            const isGradient = el.fill.startsWith("linear-gradient");
            const gradId = `present-grad-${el.id}`;
            const clickInteraction = el.protoInteractions?.find((i) => i.trigger === "On Click");
            const isClickable = !!clickInteraction;

            let gradDef = null;
            let fillVal = el.fill;

            if (isGradient) {
              const match = el.fill.match(/#[0-9a-fA-F]{6}|rgba?\([^)]+\)/g);
              const colors = match || ["#8B5CF6", "#06B6D4"];
              gradDef = (
                <defs key={`def-${el.id}`}>
                  <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={colors[0]} />
                    <stop offset="100%" stopColor={colors[1] || colors[0]} />
                  </linearGradient>
                </defs>
              );
              fillVal = `url(#${gradId})`;
            }

            const handleClick = isClickable
              ? () => navigateToPage(clickInteraction!.dest)
              : undefined;

            if (el.type === "ellipse") {
              return (
                <g key={el.id} onClick={handleClick} style={isClickable ? { cursor: "pointer" } : undefined}>
                  {gradDef}
                  <ellipse
                    cx={el.x + el.width / 2}
                    cy={el.y + el.height / 2}
                    rx={el.width / 2}
                    ry={el.height / 2}
                    fill={fillVal}
                    stroke={el.stroke || "none"}
                    strokeWidth={el.strokeWidth}
                    opacity={el.opacity}
                  />
                </g>
              );
            }
            if (el.type === "text") {
              return (
                <text
                  key={el.id}
                  x={el.x}
                  y={el.y}
                  fill={el.fill}
                  fontSize={el.fontSize || 16}
                  fontWeight={el.fontWeight || "400"}
                  fontFamily={el.fontFamily || "Inter, sans-serif"}
                  dominantBaseline="hanging"
                  opacity={el.opacity}
                  onClick={handleClick}
                  style={isClickable ? { cursor: "pointer" } : undefined}
                >
                  {el.textContent || ""}
                </text>
              );
            }
            if (el.type === "line") {
              return (
                <line
                  key={el.id}
                  x1={el.x}
                  y1={el.y}
                  x2={el.x + el.width}
                  y2={el.y + el.height}
                  stroke={el.stroke || el.fill}
                  strokeWidth={el.strokeWidth || 2}
                  opacity={el.opacity}
                  onClick={handleClick}
                  style={isClickable ? { cursor: "pointer" } : undefined}
                />
              );
            }
            return (
              <g key={el.id} onClick={handleClick} style={isClickable ? { cursor: "pointer" } : undefined}>
                {gradDef}
                <rect
                  x={el.x}
                  y={el.y}
                  width={el.width}
                  height={el.height}
                  rx={el.cornerRadius}
                  fill={fillVal}
                  stroke={el.stroke || "none"}
                  strokeWidth={el.strokeWidth}
                  opacity={el.opacity}
                />
              </g>
            );
          })}
      </svg>
    </div>
  );
}

// ─── Editor Inner ─────────────────────────────────────────────────────────────

// ─── Template element generators for AI-generated designs ────────────────────

type TemplateEl = Omit<CanvasElement, "id">;

function buildTemplateElements(prompt: string): TemplateEl[] {
  const p = prompt.toLowerCase();
  const base: Partial<TemplateEl> = {
    rotation: 0, opacity: 1, visible: true, locked: false, stroke: "", strokeWidth: 0,
  };

  if (p.includes("saas") || p.includes("dashboard") || p.includes("admin") || p.includes("analytics")) {
    return [
      { ...base, type: "rectangle", x: 0, y: 0, width: 220, height: 900, fill: "rgba(13,13,22,0.98)", stroke: "rgba(255,255,255,0.07)", strokeWidth: 1, cornerRadius: 0, name: "Sidebar" },
      { ...base, type: "rectangle", x: 220, y: 0, width: 1060, height: 64, fill: "rgba(10,10,18,0.95)", stroke: "rgba(255,255,255,0.06)", strokeWidth: 1, cornerRadius: 0, name: "Top Bar" },
      { ...base, type: "rectangle", x: 32, y: 22, width: 28, height: 28, fill: "linear-gradient(135deg, #8B5CF6, #06B6D4)", cornerRadius: 8, name: "Logo" },
      { ...base, type: "text", x: 240, y: 84, width: 280, height: 36, fill: "#F2F2F2", cornerRadius: 0, name: "Page Title", textContent: "Overview", fontSize: 22, fontWeight: "700", fontFamily: "Inter", textAlign: "left", lineHeight: 1.2, letterSpacing: -0.02 },
      { ...base, type: "rectangle", x: 240, y: 136, width: 232, height: 108, fill: "rgba(20,20,32,0.85)", stroke: "rgba(255,255,255,0.07)", strokeWidth: 1, cornerRadius: 14, name: "Stat Card 1", shadowColor: "rgba(0,0,0,0.3)", shadowX: 0, shadowY: 8, shadowBlur: 24 },
      { ...base, type: "text", x: 264, y: 158, width: 180, height: 18, fill: "#888", cornerRadius: 0, name: "Stat Label 1", textContent: "Total Revenue", fontSize: 12, fontWeight: "500", fontFamily: "Inter", textAlign: "left", lineHeight: 1.3, letterSpacing: 0.01 },
      { ...base, type: "text", x: 264, y: 182, width: 180, height: 36, fill: "#F2F2F2", cornerRadius: 0, name: "Stat Value 1", textContent: "$48,295", fontSize: 26, fontWeight: "700", fontFamily: "Inter", textAlign: "left", lineHeight: 1.1, letterSpacing: -0.02 },
      { ...base, type: "rectangle", x: 488, y: 136, width: 232, height: 108, fill: "rgba(20,20,32,0.85)", stroke: "rgba(255,255,255,0.07)", strokeWidth: 1, cornerRadius: 14, name: "Stat Card 2", shadowColor: "rgba(0,0,0,0.3)", shadowX: 0, shadowY: 8, shadowBlur: 24 },
      { ...base, type: "text", x: 512, y: 158, width: 180, height: 18, fill: "#888", cornerRadius: 0, name: "Stat Label 2", textContent: "Active Users", fontSize: 12, fontWeight: "500", fontFamily: "Inter", textAlign: "left", lineHeight: 1.3, letterSpacing: 0.01 },
      { ...base, type: "text", x: 512, y: 182, width: 180, height: 36, fill: "#F2F2F2", cornerRadius: 0, name: "Stat Value 2", textContent: "12,840", fontSize: 26, fontWeight: "700", fontFamily: "Inter", textAlign: "left", lineHeight: 1.1, letterSpacing: -0.02 },
      { ...base, type: "rectangle", x: 736, y: 136, width: 232, height: 108, fill: "rgba(20,20,32,0.85)", stroke: "rgba(255,255,255,0.07)", strokeWidth: 1, cornerRadius: 14, name: "Stat Card 3", shadowColor: "rgba(0,0,0,0.3)", shadowX: 0, shadowY: 8, shadowBlur: 24 },
      { ...base, type: "text", x: 760, y: 158, width: 180, height: 18, fill: "#888", cornerRadius: 0, name: "Stat Label 3", textContent: "Conversion Rate", fontSize: 12, fontWeight: "500", fontFamily: "Inter", textAlign: "left", lineHeight: 1.3, letterSpacing: 0.01 },
      { ...base, type: "text", x: 760, y: 182, width: 180, height: 36, fill: "#10B981", cornerRadius: 0, name: "Stat Value 3", textContent: "+4.6%", fontSize: 26, fontWeight: "700", fontFamily: "Inter", textAlign: "left", lineHeight: 1.1, letterSpacing: -0.02 },
      { ...base, type: "rectangle", x: 240, y: 264, width: 736, height: 280, fill: "rgba(18,18,28,0.9)", stroke: "rgba(255,255,255,0.07)", strokeWidth: 1, cornerRadius: 16, name: "Chart Area", shadowColor: "rgba(0,0,0,0.2)", shadowX: 0, shadowY: 8, shadowBlur: 20 },
      { ...base, type: "text", x: 264, y: 284, width: 200, height: 22, fill: "#F2F2F2", cornerRadius: 0, name: "Chart Title", textContent: "Revenue Over Time", fontSize: 14, fontWeight: "600", fontFamily: "Inter", textAlign: "left", lineHeight: 1.3, letterSpacing: -0.01 },
      { ...base, type: "rectangle", x: 240, y: 564, width: 360, height: 200, fill: "rgba(18,18,28,0.9)", stroke: "rgba(255,255,255,0.07)", strokeWidth: 1, cornerRadius: 16, name: "Recent Activity" },
      { ...base, type: "rectangle", x: 620, y: 564, width: 356, height: 200, fill: "rgba(18,18,28,0.9)", stroke: "rgba(255,255,255,0.07)", strokeWidth: 1, cornerRadius: 16, name: "Top Segments" },
    ] as TemplateEl[];
  }

  if (p.includes("mobile") || p.includes("social") || p.includes("fintech") || p.includes("app")) {
    return [
      { ...base, type: "rectangle", x: 280, y: 0, width: 390, height: 844, fill: "rgba(10,10,18,1)", cornerRadius: 40, name: "Phone Frame", stroke: "rgba(255,255,255,0.12)", strokeWidth: 2 },
      { ...base, type: "rectangle", x: 280, y: 0, width: 390, height: 56, fill: "rgba(15,15,25,0.95)", cornerRadius: 0, name: "Status Bar" },
      { ...base, type: "text", x: 320, y: 80, width: 310, height: 40, fill: "#F2F2F2", cornerRadius: 0, name: "Screen Title", textContent: "Dashboard", fontSize: 28, fontWeight: "700", fontFamily: "Inter", textAlign: "left", lineHeight: 1.2, letterSpacing: -0.02 },
      { ...base, type: "rectangle", x: 304, y: 136, width: 342, height: 120, fill: "linear-gradient(135deg, #8B5CF6, #06B6D4)", cornerRadius: 20, name: "Balance Card", shadowColor: "rgba(139,92,246,0.4)", shadowX: 0, shadowY: 12, shadowBlur: 32 },
      { ...base, type: "text", x: 328, y: 156, width: 200, height: 20, fill: "rgba(255,255,255,0.7)", cornerRadius: 0, name: "Balance Label", textContent: "Total Balance", fontSize: 13, fontWeight: "500", fontFamily: "Inter", textAlign: "left", lineHeight: 1.3, letterSpacing: 0 },
      { ...base, type: "text", x: 328, y: 182, width: 280, height: 44, fill: "#FFFFFF", cornerRadius: 0, name: "Balance Amount", textContent: "$12,480.50", fontSize: 34, fontWeight: "700", fontFamily: "Inter", textAlign: "left", lineHeight: 1.1, letterSpacing: -0.02 },
      { ...base, type: "text", x: 304, y: 280, width: 200, height: 24, fill: "#F2F2F2", cornerRadius: 0, name: "Section Label", textContent: "Quick Actions", fontSize: 16, fontWeight: "600", fontFamily: "Inter", textAlign: "left", lineHeight: 1.3, letterSpacing: -0.01 },
      { ...base, type: "rectangle", x: 304, y: 316, width: 76, height: 76, fill: "rgba(139,92,246,0.15)", stroke: "rgba(139,92,246,0.3)", strokeWidth: 1, cornerRadius: 20, name: "Action Send" },
      { ...base, type: "rectangle", x: 398, y: 316, width: 76, height: 76, fill: "rgba(6,182,212,0.15)", stroke: "rgba(6,182,212,0.3)", strokeWidth: 1, cornerRadius: 20, name: "Action Receive" },
      { ...base, type: "rectangle", x: 492, y: 316, width: 76, height: 76, fill: "rgba(16,185,129,0.15)", stroke: "rgba(16,185,129,0.3)", strokeWidth: 1, cornerRadius: 20, name: "Action Pay" },
      { ...base, type: "rectangle", x: 586, y: 316, width: 76, height: 76, fill: "rgba(245,158,11,0.15)", stroke: "rgba(245,158,11,0.3)", strokeWidth: 1, cornerRadius: 20, name: "Action More" },
      { ...base, type: "text", x: 304, y: 420, width: 200, height: 24, fill: "#F2F2F2", cornerRadius: 0, name: "Transactions Label", textContent: "Recent Transactions", fontSize: 16, fontWeight: "600", fontFamily: "Inter", textAlign: "left", lineHeight: 1.3, letterSpacing: -0.01 },
      { ...base, type: "rectangle", x: 304, y: 456, width: 342, height: 64, fill: "rgba(20,20,32,0.8)", stroke: "rgba(255,255,255,0.07)", strokeWidth: 1, cornerRadius: 14, name: "Transaction 1" },
      { ...base, type: "rectangle", x: 304, y: 532, width: 342, height: 64, fill: "rgba(20,20,32,0.8)", stroke: "rgba(255,255,255,0.07)", strokeWidth: 1, cornerRadius: 14, name: "Transaction 2" },
      { ...base, type: "rectangle", x: 304, y: 608, width: 342, height: 64, fill: "rgba(20,20,32,0.8)", stroke: "rgba(255,255,255,0.07)", strokeWidth: 1, cornerRadius: 14, name: "Transaction 3" },
      { ...base, type: "rectangle", x: 280, y: 764, width: 390, height: 80, fill: "rgba(13,13,22,0.98)", stroke: "rgba(255,255,255,0.08)", strokeWidth: 1, cornerRadius: 0, name: "Tab Bar" },
      { ...base, type: "ellipse", x: 452, y: 774, width: 56, height: 56, fill: "linear-gradient(135deg, #8B5CF6, #06B6D4)", cornerRadius: 0, name: "FAB Button", shadowColor: "rgba(139,92,246,0.5)", shadowX: 0, shadowY: 8, shadowBlur: 20 },
    ] as TemplateEl[];
  }

  if (p.includes("ecommerce") || p.includes("e-commerce") || p.includes("shop") || p.includes("checkout")) {
    return [
      { ...base, type: "rectangle", x: 0, y: 0, width: 1280, height: 72, fill: "rgba(255,255,255,0.97)", stroke: "rgba(0,0,0,0.08)", strokeWidth: 1, cornerRadius: 0, name: "Navbar" },
      { ...base, type: "text", x: 40, y: 24, width: 100, height: 28, fill: "#1A1A2E", cornerRadius: 0, name: "Brand Name", textContent: "Shopify", fontSize: 20, fontWeight: "700", fontFamily: "Inter", textAlign: "left", lineHeight: 1.2, letterSpacing: -0.02 },
      { ...base, type: "rectangle", x: 1100, y: 20, width: 140, height: 36, fill: "#1A1A2E", cornerRadius: 10, name: "Cart Button" },
      { ...base, type: "rectangle", x: 0, y: 72, width: 280, height: 828, fill: "#F8F9FA", stroke: "rgba(0,0,0,0.06)", strokeWidth: 1, cornerRadius: 0, name: "Filter Sidebar" },
      { ...base, type: "text", x: 24, y: 100, width: 200, height: 24, fill: "#1A1A2E", cornerRadius: 0, name: "Filter Title", textContent: "Filters", fontSize: 16, fontWeight: "600", fontFamily: "Inter", textAlign: "left", lineHeight: 1.3, letterSpacing: -0.01 },
      { ...base, type: "rectangle", x: 24, y: 136, width: 232, height: 1, fill: "rgba(0,0,0,0.1)", cornerRadius: 0, name: "Divider 1" },
      { ...base, type: "text", x: 24, y: 152, width: 200, height: 20, fill: "#374151", cornerRadius: 0, name: "Category Label", textContent: "Category", fontSize: 13, fontWeight: "600", fontFamily: "Inter", textAlign: "left", lineHeight: 1.3, letterSpacing: 0 },
      { ...base, type: "rectangle", x: 300, y: 88, width: 940, height: 48, fill: "#F3F4F6", stroke: "rgba(0,0,0,0.08)", strokeWidth: 1, cornerRadius: 10, name: "Search Bar" },
      { ...base, type: "rectangle", x: 300, y: 152, width: 300, height: 380, fill: "#FFFFFF", stroke: "rgba(0,0,0,0.08)", strokeWidth: 1, cornerRadius: 16, name: "Product Card 1", shadowColor: "rgba(0,0,0,0.06)", shadowX: 0, shadowY: 4, shadowBlur: 16 },
      { ...base, type: "rectangle", x: 300, y: 152, width: 300, height: 224, fill: "#F3F4F6", cornerRadius: 12, name: "Product Image 1" },
      { ...base, type: "rectangle", x: 620, y: 152, width: 300, height: 380, fill: "#FFFFFF", stroke: "rgba(0,0,0,0.08)", strokeWidth: 1, cornerRadius: 16, name: "Product Card 2", shadowColor: "rgba(0,0,0,0.06)", shadowX: 0, shadowY: 4, shadowBlur: 16 },
      { ...base, type: "rectangle", x: 940, y: 152, width: 300, height: 380, fill: "#FFFFFF", stroke: "rgba(0,0,0,0.08)", strokeWidth: 1, cornerRadius: 16, name: "Product Card 3", shadowColor: "rgba(0,0,0,0.06)", shadowX: 0, shadowY: 4, shadowBlur: 16 },
      { ...base, type: "text", x: 320, y: 392, width: 260, height: 22, fill: "#1A1A2E", cornerRadius: 0, name: "Product Name 1", textContent: "Premium Wireless Headphones", fontSize: 14, fontWeight: "600", fontFamily: "Inter", textAlign: "left", lineHeight: 1.3, letterSpacing: -0.01 },
      { ...base, type: "text", x: 320, y: 420, width: 120, height: 28, fill: "#1A1A2E", cornerRadius: 0, name: "Product Price 1", textContent: "$129.00", fontSize: 18, fontWeight: "700", fontFamily: "Inter", textAlign: "left", lineHeight: 1.2, letterSpacing: -0.01 },
      { ...base, type: "rectangle", x: 320, y: 458, width: 240, height: 40, fill: "#1A1A2E", cornerRadius: 10, name: "Add to Cart Btn 1" },
    ] as TemplateEl[];
  }

  // Default: landing page
  return [
    { ...base, type: "rectangle", x: 0, y: 0, width: 1280, height: 72, fill: "rgba(15,15,20,0.95)", stroke: "rgba(255,255,255,0.08)", strokeWidth: 1, cornerRadius: 0, name: "Navigation" },
    { ...base, type: "rectangle", x: 32, y: 22, width: 28, height: 28, fill: "linear-gradient(135deg, #8B5CF6, #06B6D4)", cornerRadius: 8, name: "Logo Mark" },
    { ...base, type: "rectangle", x: 1152, y: 20, width: 96, height: 32, fill: "linear-gradient(135deg, #8B5CF6, #06B6D4)", cornerRadius: 10, name: "Get Started" },
    { ...base, type: "rectangle", x: 0, y: 72, width: 1280, height: 480, fill: "rgba(10,10,15,1)", cornerRadius: 0, name: "Hero Section" },
    { ...base, type: "text", x: 64, y: 160, width: 540, height: 120, fill: "#F2F2F2", cornerRadius: 0, name: "Headline", textContent: "Design at the\nspeed of thought.", fontSize: 64, fontWeight: "700", fontFamily: "Inter", textAlign: "left", lineHeight: 1.1, letterSpacing: -0.03 },
    { ...base, type: "text", x: 64, y: 296, width: 480, height: 60, fill: "#999", cornerRadius: 0, name: "Subheadline", textContent: "Create beautiful interfaces by editing visually or chatting naturally with AI.", fontSize: 18, fontWeight: "400", fontFamily: "Inter", textAlign: "left", lineHeight: 1.5, letterSpacing: 0 },
    { ...base, type: "rectangle", x: 64, y: 380, width: 180, height: 52, fill: "linear-gradient(135deg, #8B5CF6, #06B6D4)", cornerRadius: 14, name: "Primary CTA", shadowColor: "rgba(139,92,246,0.35)", shadowX: 0, shadowY: 12, shadowBlur: 28 },
    { ...base, type: "rectangle", x: 260, y: 380, width: 140, height: 52, fill: "transparent", stroke: "rgba(255,255,255,0.15)", strokeWidth: 1, cornerRadius: 14, name: "Secondary CTA" },
    { ...base, type: "rectangle", x: 680, y: 100, width: 520, height: 360, fill: "rgba(139,92,246,0.08)", stroke: "rgba(139,92,246,0.2)", strokeWidth: 1, cornerRadius: 20, name: "Hero Visual" },
    { ...base, type: "rectangle", x: 0, y: 552, width: 1280, height: 340, fill: "rgba(8,8,12,1)", cornerRadius: 0, name: "Features Section" },
    { ...base, type: "text", x: 400, y: 572, width: 480, height: 40, fill: "#F2F2F2", cornerRadius: 0, name: "Features Title", textContent: "Everything you need to design faster", fontSize: 26, fontWeight: "600", fontFamily: "Inter", textAlign: "center", lineHeight: 1.3, letterSpacing: -0.01 },
    { ...base, type: "rectangle", x: 48, y: 628, width: 368, height: 200, fill: "rgba(30,30,40,0.8)", stroke: "rgba(255,255,255,0.07)", strokeWidth: 1, cornerRadius: 16, name: "Feature Card 1" },
    { ...base, type: "rectangle", x: 456, y: 628, width: 368, height: 200, fill: "rgba(30,30,40,0.8)", stroke: "rgba(255,255,255,0.07)", strokeWidth: 1, cornerRadius: 16, name: "Feature Card 2" },
    { ...base, type: "rectangle", x: 864, y: 628, width: 368, height: 200, fill: "rgba(30,30,40,0.8)", stroke: "rgba(255,255,255,0.07)", strokeWidth: 1, cornerRadius: 16, name: "Feature Card 3" },
  ] as TemplateEl[];
}

// ─── Editor Inner ─────────────────────────────────────────────────────────────

const EditorInner = () => {
  const [showAI, setShowAI] = useState(false);
  const [pendingAIPrompt, setPendingAIPrompt] = useState<string>("");
  const [rightTab, setRightTab] = useState<"design" | "prototype" | "inspect">("design");
  const [showGenModal, setShowGenModal] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showPresent, setShowPresent] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const projectName = searchParams.get("name") || "Fintech Mobile App";
  const pageName = searchParams.get("page") || "Landing Page";

  const { dispatch, deleteSelected, undo, redo, copySelected, paste, duplicateSelected, state, selectedElements, addElements } = useCanvas();

  const commands: CommandItem[] = [
    { id: "undo", label: "Undo", shortcut: "⌘Z", group: "Edit", action: undo },
    { id: "redo", label: "Redo", shortcut: "⌘⇧Z", group: "Edit", action: redo },
    { id: "copy", label: "Copy", shortcut: "⌘C", group: "Edit", action: copySelected },
    { id: "paste", label: "Paste", shortcut: "⌘V", group: "Edit", action: paste },
    { id: "duplicate", label: "Duplicate", shortcut: "⌘D", group: "Edit", action: duplicateSelected },
    { id: "delete", label: "Delete Selection", shortcut: "⌫", group: "Edit", action: deleteSelected },
    { id: "select-all", label: "Select All", shortcut: "⌘A", group: "Edit", action: () => dispatch({ type: "SELECT", ids: state.elements.map(e => e.id) }) },
    { id: "toggle-ai", label: "Toggle AI Panel", shortcut: "⌘I", group: "View", action: () => setShowAI(p => !p) },
    { id: "ask-nova-restyle", label: "Ask Nova: Restyle selection", group: "AI", action: () => { setShowAI(true); } },
    { id: "ask-nova-variations", label: "Ask Nova: Generate variations", group: "AI", action: () => { setShowAI(true); } },
    { id: "ask-nova-darkmode", label: "Ask Nova: Dark mode variant", group: "AI", action: () => { setShowAI(true); } },
    { id: "toggle-grid", label: "Toggle Grid", shortcut: "⌘'", group: "View", action: () => dispatch({ type: "TOGGLE_GRID" }) },
    { id: "zoom-100", label: "Zoom to 100%", shortcut: "⌘0", group: "View", action: () => dispatch({ type: "SET_ZOOM", zoom: 100 }) },
    { id: "zoom-50", label: "Zoom to 50%", group: "View", action: () => dispatch({ type: "SET_ZOOM", zoom: 50 }) },
    { id: "zoom-200", label: "Zoom to 200%", group: "View", action: () => dispatch({ type: "SET_ZOOM", zoom: 200 }) },
    { id: "tool-move", label: "Move Tool", shortcut: "V", group: "Tools", action: () => dispatch({ type: "SET_TOOL", tool: "move" }) },
    { id: "tool-rect", label: "Rectangle Tool", shortcut: "R", group: "Tools", action: () => dispatch({ type: "SET_TOOL", tool: "rectangle" }) },
    { id: "tool-ellipse", label: "Ellipse Tool", shortcut: "O", group: "Tools", action: () => dispatch({ type: "SET_TOOL", tool: "ellipse" }) },
    { id: "tool-text", label: "Text Tool", shortcut: "T", group: "Tools", action: () => dispatch({ type: "SET_TOOL", tool: "text" }) },
    { id: "tool-frame", label: "Frame Tool", shortcut: "F", group: "Tools", action: () => dispatch({ type: "SET_TOOL", tool: "frame" }) },
    { id: "tool-line", label: "Line Tool", shortcut: "L", group: "Tools", action: () => dispatch({ type: "SET_TOOL", tool: "line" }) },
    { id: "size-desktop", label: "Resize to Desktop (1280×900)", group: "Canvas", action: () => { dispatch({ type: "SET_ARTBOARD_SIZE", width: 1280, height: 900 }); toast.success("Canvas resized to 1280×900"); } },
    { id: "size-mobile", label: "Resize to Mobile (390×844)", group: "Canvas", action: () => { dispatch({ type: "SET_ARTBOARD_SIZE", width: 390, height: 844 }); toast.success("Canvas resized to 390×844"); } },
    { id: "size-tablet", label: "Resize to Tablet (768×1024)", group: "Canvas", action: () => { dispatch({ type: "SET_ARTBOARD_SIZE", width: 768, height: 1024 }); toast.success("Canvas resized to 768×1024"); } },
    { id: "gen-modal", label: "Generate new design with AI", group: "AI", action: () => setShowGenModal(true) },
    { id: "present", label: "Present / Preview", shortcut: "⌘⏎", group: "View", action: () => setShowPresent(true) },
    { id: "dashboard", label: "Back to Dashboard", group: "Navigate", action: () => navigate("/dashboard") },
  ];

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName.toLowerCase();
      const isInput = tag === "input" || tag === "textarea" || tag === "select";

      if (!isInput && !e.metaKey && !e.ctrlKey) {
        const toolMap: Record<string, string> = {
          v: "move", f: "frame", r: "rectangle", o: "ellipse",
          l: "line", p: "pen", t: "text", i: "image", c: "comment", h: "hand",
        };
        if (toolMap[e.key.toLowerCase()]) {
          dispatch({ type: "SET_TOOL", tool: toolMap[e.key.toLowerCase()] });
          return;
        }
        if ((e.key === "Delete" || e.key === "Backspace") && !isInput) {
          deleteSelected();
          return;
        }
        if (e.key === "Escape") {
          dispatch({ type: "SET_TOOL", tool: "move" });
          dispatch({ type: "SELECT", ids: [] });
          setShowCommandPalette(false);
          return;
        }
      }

      if (e.metaKey || e.ctrlKey) {
        switch (e.key.toLowerCase()) {
          case "z":
            e.preventDefault();
            if (e.shiftKey) redo(); else undo();
            return;
          case "y":
            e.preventDefault();
            redo();
            return;
          case "i":
            e.preventDefault();
            setShowAI((p) => !p);
            return;
          case "k":
            e.preventDefault();
            setShowCommandPalette((p) => !p);
            return;
          case "c":
            if (!isInput) { e.preventDefault(); copySelected(); toast.success("Copied to clipboard"); }
            return;
          case "v":
            if (!isInput) { e.preventDefault(); paste(); }
            return;
          case "d":
            e.preventDefault();
            duplicateSelected();
            return;
          case "a":
            if (!isInput) {
              e.preventDefault();
              dispatch({ type: "SELECT", ids: state.elements.map(e => e.id) });
            }
            return;
          case "'":
            e.preventDefault();
            dispatch({ type: "TOGGLE_GRID" });
            return;
          case "=":
          case "+":
            e.preventDefault();
            dispatch({ type: "SET_ZOOM", zoom: state.zoom + 10 });
            return;
          case "-":
            e.preventDefault();
            dispatch({ type: "SET_ZOOM", zoom: state.zoom - 10 });
            return;
          case "0":
            e.preventDefault();
            dispatch({ type: "SET_ZOOM", zoom: 100 });
            return;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dispatch, deleteSelected, undo, redo, copySelected, paste, duplicateSelected, state.elements, state.zoom]);

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <EditorToolbar
        showAI={showAI}
        onToggleAI={() => setShowAI(!showAI)}
        onOpenCommandPalette={() => setShowCommandPalette(true)}
        onOpenGenModal={() => setShowGenModal(true)}
        onPresent={() => setShowPresent(true)}
        projectName={projectName}
        pageName={pageName}
      />

      <div className="flex-1 flex overflow-hidden relative">
        <EditorLeftSidebar />

        {/* Canvas fills remaining space */}
        <EditorCanvas
          onOpenAI={(prompt) => {
            if (prompt) setPendingAIPrompt(prompt);
            setShowAI(true);
          }}
        />

        {/* Right panel: AI chat OR properties — seamless transition */}
        <div
          className={`shrink-0 flex transition-all duration-300 ease-out ${showAI ? "w-80" : "w-72"}`}
        >
          {showAI ? (
            <AIChatPanel
              onClose={() => { setShowAI(false); setPendingAIPrompt(""); }}
              initialPrompt={pendingAIPrompt}
            />
          ) : (
            <EditorRightSidebar
              activeTab={rightTab}
              onTabChange={setRightTab}
            />
          )}
        </div>

      </div>

      {/* AI Generation Modal */}
      <AIGenerationModal
        open={showGenModal}
        onClose={() => setShowGenModal(false)}
        onGenerate={(prompt) => {
          setShowGenModal(false);
          const templateEls = buildTemplateElements(prompt ?? "landing");
          dispatch({ type: "LOAD_ELEMENTS", elements: [] });
          setTimeout(() => {
            addElements(templateEls);
            toast.success("Design generated!", { description: `${templateEls.length} elements added to canvas` });
          }, 100);
        }}
      />

      {/* Command Palette */}
      {showCommandPalette && (
        <CommandPalette
          commands={commands}
          onClose={() => setShowCommandPalette(false)}
        />
      )}

      {/* Present / Preview Mode */}
      {showPresent && (
        <PresentMode
          pages={state.pages.map((p) => p.id === state.currentPageId ? { ...p, elements: state.elements } : p)}
          initialPageId={state.currentPageId}
          artboardWidth={state.artboardWidth}
          artboardHeight={state.artboardHeight}
          onClose={() => setShowPresent(false)}
        />
      )}
    </div>
  );
};

// ─── Page Wrapper ─────────────────────────────────────────────────────────────

const Editor = () => {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("id") || searchParams.get("name") || "default";

  return (
    <CanvasProvider projectKey={projectId}>
      <EditorInner />
    </CanvasProvider>
  );
};

export default Editor;
