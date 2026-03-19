import { useState, useCallback, useEffect } from "react";
import { ChevronDown, Plus, Trash2, Copy, Download, Link2, Zap } from "lucide-react";
import { useCanvas, CanvasElement } from "@/contexts/CanvasContext";
import { toast } from "sonner";

// --- Utility Components ---

const SectionHeader = ({
  title, open, onToggle, extra,
}: {
  title: string; open: boolean; onToggle: () => void; extra?: React.ReactNode;
}) => (
  <button
    className="w-full flex items-center justify-between py-2 text-xs font-medium text-foreground"
    onClick={onToggle}
  >
    {title}
    <div className="flex items-center gap-1">
      {extra}
      <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform ${open ? "" : "-rotate-90"}`} />
    </div>
  </button>
);

const PropInput = ({
  label, value, onChange, type = "text", suffix, min, max, step = 1,
}: {
  label: string; value: string | number; onChange: (v: string) => void;
  type?: string; suffix?: string; min?: number; max?: number; step?: number;
}) => (
  <div className="flex items-center gap-1.5">
    <span className="text-[10px] text-muted-foreground w-6 font-mono shrink-0">{label}</span>
    <div className="flex-1 relative">
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        min={min}
        max={max}
        step={step}
        className="w-full h-7 px-2 rounded-md bg-secondary border border-border text-xs font-mono text-foreground outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
      />
      {suffix && (
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground pointer-events-none">
          {suffix}
        </span>
      )}
    </div>
  </div>
);

const ColorSwatch = ({ color, onChange, label }: { color: string; onChange: (c: string) => void; label?: string }) => {
  const isSolid = color.startsWith("#") || color.startsWith("rgb");
  const isGradient = color.startsWith("linear-gradient");
  const displayColor = isGradient ? "#8B5CF6" : isSolid ? color : "transparent";

  return (
    <div className="flex items-center gap-2">
      <label className="w-7 h-7 rounded-md border border-border overflow-hidden cursor-pointer shrink-0 relative" title={label}>
        <div className="w-full h-full" style={{ background: color || "transparent" }} />
        {isSolid && (
          <input
            type="color"
            value={displayColor.slice(0, 7)}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        )}
      </label>
      <input
        value={isGradient ? "Gradient" : color}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 h-7 px-2 rounded-md bg-secondary border border-border text-xs font-mono text-foreground outline-none focus:border-primary/50 transition-all"
        placeholder="none"
        readOnly={isGradient}
      />
    </div>
  );
};

// Shadow control
const ShadowControl = ({ el, update }: { el: CanvasElement; update: (k: keyof CanvasElement, v: string) => void }) => {
  const hasShadow = !!(el.shadowColor);
  const [enabled, setEnabled] = useState(hasShadow);

  const toggle = () => {
    if (enabled) {
      update("shadowColor", "");
      update("shadowBlur", "0");
      update("shadowX", "0");
      update("shadowY", "0");
    } else {
      update("shadowColor", "rgba(0,0,0,0.4)");
      update("shadowBlur", "16");
      update("shadowX", "0");
      update("shadowY", "8");
    }
    setEnabled(!enabled);
  };

  return (
    <div className="space-y-2 pb-3">
      <div className="flex items-center justify-between">
        <button
          onClick={toggle}
          className={`flex items-center gap-1.5 text-xs transition-colors ${enabled ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
        >
          <div className={`w-3 h-3 rounded-sm border ${enabled ? "bg-primary border-primary" : "border-border"} flex items-center justify-center`}>
            {enabled && <div className="w-1.5 h-1.5 rounded-sm bg-white" />}
          </div>
          Drop Shadow
        </button>
        {!enabled && (
          <button onClick={toggle} className="text-[10px] text-primary hover:underline">+ Add</button>
        )}
      </div>
      {enabled && (
        <div className="pl-2 space-y-1.5">
          <ColorSwatch
            color={el.shadowColor || "rgba(0,0,0,0.4)"}
            onChange={(c) => update("shadowColor", c)}
            label="Shadow color"
          />
          <div className="grid grid-cols-2 gap-1.5">
            <PropInput label="X" value={el.shadowX ?? 0} onChange={(v) => update("shadowX", v)} type="number" min={-100} max={100} />
            <PropInput label="Y" value={el.shadowY ?? 8} onChange={(v) => update("shadowY", v)} type="number" min={-100} max={100} />
            <PropInput label="Bl" value={el.shadowBlur ?? 16} onChange={(v) => update("shadowBlur", v)} type="number" min={0} max={100} suffix="px" />
            <PropInput label="Sp" value={el.shadowSpread ?? 0} onChange={(v) => update("shadowSpread", v)} type="number" min={-50} max={50} suffix="px" />
          </div>
        </div>
      )}
    </div>
  );
};

// Blur control
const BlurControl = ({ el, update }: { el: CanvasElement; update: (k: keyof CanvasElement, v: string) => void }) => {
  const [enabled, setEnabled] = useState(!!(el.blur && el.blur > 0));

  const toggle = () => {
    if (enabled) {
      update("blur", "0");
    } else {
      update("blur", "8");
    }
    setEnabled(!enabled);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <button
          onClick={toggle}
          className={`flex items-center gap-1.5 text-xs transition-colors ${enabled ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
        >
          <div className={`w-3 h-3 rounded-sm border ${enabled ? "bg-primary border-primary" : "border-border"} flex items-center justify-center`}>
            {enabled && <div className="w-1.5 h-1.5 rounded-sm bg-white" />}
          </div>
          Layer Blur
        </button>
        {!enabled && (
          <button onClick={toggle} className="text-[10px] text-primary hover:underline">+ Add</button>
        )}
      </div>
      {enabled && (
        <div className="pl-2">
          <PropInput label="Bl" value={el.blur ?? 8} onChange={(v) => update("blur", v)} type="number" min={0} max={100} suffix="px" />
        </div>
      )}
    </div>
  );
};

// Prototype interaction row
const InteractionRow = ({
  trigger, dest, onRemove,
}: { trigger: string; dest: string; onRemove: () => void }) => (
  <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-secondary border border-border group">
    <div className="flex-1">
      <div className="flex items-center gap-1.5 text-xs">
        <Zap className="w-3 h-3 text-primary" />
        <span className="text-foreground font-medium">{trigger}</span>
        <span className="text-muted-foreground">→</span>
        <Link2 className="w-3 h-3 text-muted-foreground" />
        <span className="text-muted-foreground">{dest}</span>
      </div>
    </div>
    <button
      onClick={onRemove}
      className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:text-destructive transition-all"
    >
      <Trash2 className="w-3 h-3" />
    </button>
  </div>
);

// Export to SVG string
function exportElementAsSVG(el: CanvasElement): string {
  const isGradient = el.fill.startsWith("linear-gradient");
  const gradId = "grad-export";
  let fill = el.fill;
  let gradDef = "";

  if (isGradient) {
    const match = el.fill.match(/#[0-9a-fA-F]{6}|rgba?\([^)]+\)/g);
    const colors = match || ["#8B5CF6", "#06B6D4"];
    gradDef = `<defs><linearGradient id="${gradId}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${colors[0]}"/><stop offset="100%" stop-color="${colors[1] || colors[0]}"/></linearGradient></defs>`;
    fill = `url(#${gradId})`;
  }

  const w = Math.round(el.width);
  const h = Math.round(el.height);

  let shape = "";
  if (el.type === "rectangle" || el.type === "frame" || el.type === "image") {
    shape = `<rect x="0" y="0" width="${w}" height="${h}" rx="${el.cornerRadius}" ry="${el.cornerRadius}" fill="${fill}" stroke="${el.stroke || "none"}" stroke-width="${el.strokeWidth}" opacity="${el.opacity}"/>`;
  } else if (el.type === "ellipse") {
    shape = `<ellipse cx="${w / 2}" cy="${h / 2}" rx="${w / 2}" ry="${h / 2}" fill="${fill}" stroke="${el.stroke || "none"}" stroke-width="${el.strokeWidth}" opacity="${el.opacity}"/>`;
  } else if (el.type === "text") {
    shape = `<text x="0" y="0" fill="${fill}" font-size="${el.fontSize || 16}" font-weight="${el.fontWeight || "400"}" font-family="${el.fontFamily || "Inter, sans-serif"}" dominant-baseline="hanging" opacity="${el.opacity}">${el.textContent || ""}</text>`;
  }

  return `<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${gradDef}${shape}</svg>`;
}

function downloadSVG(el: CanvasElement) {
  const svg = exportElementAsSVG(el);
  const blob = new Blob([svg], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${el.name.replace(/\s+/g, "_")}.svg`;
  a.click();
  URL.revokeObjectURL(url);
}

function copyCSS(css: string) {
  navigator.clipboard.writeText(css);
  toast.success("CSS copied to clipboard");
}

// --- Main Component ---

interface Props {
  activeTab: "design" | "prototype" | "inspect";
  onTabChange: (tab: "design" | "prototype" | "inspect") => void;
}

const tabs = ["design", "prototype", "inspect"] as const;

export default function EditorRightSidebar({ activeTab, onTabChange }: Props) {
  const { state, updateElement, selectedElements, deleteSelected, duplicateSelected } = useCanvas();

  const [sections, setSections] = useState({
    transform: true,
    typography: true,
    fill: true,
    stroke: false,
    effects: true,
    radius: true,
    export: false,
  });
  const strokePosition = el?.strokePosition ?? "center";

  const [interactions, setInteractions] = useState<{ id: string; trigger: string; dest: string; animation: string; duration: number }[]>([]);
  const [showAddInteraction, setShowAddInteraction] = useState(false);
  const [newTrigger, setNewTrigger] = useState("On Click");
  const [newDest, setNewDest] = useState(() => state.pages[0]?.name ?? "");
  const [selectedAnimation, setSelectedAnimation] = useState("None");
  const [animDuration, setAnimDuration] = useState(300);

  const toggleSection = (key: keyof typeof sections) =>
    setSections((s) => ({ ...s, [key]: !s[key] }));

  const el: CanvasElement | null = selectedElements[0] ?? null;

  // Sync prototype state from element when selection changes
  useEffect(() => {
    if (el) {
      setInteractions(el.protoInteractions ?? []);
      setSelectedAnimation(el.protoAnimation ?? "None");
      setAnimDuration(el.protoAnimDuration ?? 300);
    } else {
      setInteractions([]);
      setSelectedAnimation("None");
      setAnimDuration(300);
    }
    setShowAddInteraction(false);
  }, [el?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const update = useCallback(
    (key: keyof CanvasElement, raw: string) => {
      if (!el) return;
      const numKeys: (keyof CanvasElement)[] = [
        "x", "y", "width", "height", "rotation", "opacity", "cornerRadius",
        "strokeWidth", "fontSize", "lineHeight", "letterSpacing",
        "shadowX", "shadowY", "shadowBlur", "shadowSpread", "blur",
      ];
      if (numKeys.includes(key)) {
        const num = parseFloat(raw);
        if (!isNaN(num)) updateElement(el.id, { [key]: num } as any);
      } else {
        updateElement(el.id, { [key]: raw } as any);
      }
    },
    [el, updateElement]
  );

  const inspectCSS = el
    ? [
        el.type !== "text" && `width: ${Math.round(el.width)}px;`,
        el.type !== "text" && `height: ${Math.round(el.height)}px;`,
        `left: ${Math.round(el.x)}px;`,
        `top: ${Math.round(el.y)}px;`,
        el.cornerRadius && `border-radius: ${el.cornerRadius}px;`,
        el.fill && el.fill !== "transparent" && el.fill.startsWith("linear-gradient")
          ? `background: ${el.fill};`
          : el.fill && el.fill !== "transparent" ? `background-color: ${el.fill};` : null,
        el.stroke && `border: ${el.strokeWidth}px solid ${el.stroke};`,
        el.opacity !== 1 && `opacity: ${el.opacity};`,
        el.type === "text" && `font-size: ${el.fontSize}px;`,
        el.type === "text" && `font-weight: ${el.fontWeight};`,
        el.type === "text" && `font-family: "${el.fontFamily}";`,
        el.type === "text" && `line-height: ${el.lineHeight};`,
        el.type === "text" && el.letterSpacing && `letter-spacing: ${el.letterSpacing}em;`,
        el.type === "text" && `color: ${el.fill};`,
        el.shadowColor && `box-shadow: ${el.shadowX || 0}px ${el.shadowY || 4}px ${el.shadowBlur || 16}px ${el.shadowSpread || 0}px ${el.shadowColor};`,
        el.blur && el.blur > 0 && `filter: blur(${el.blur}px);`,
      ].filter(Boolean) as string[]
    : [];

  return (
    <aside className="w-72 border-l border-border bg-card flex flex-col shrink-0">
      {/* Tabs */}
      <div className="flex border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`flex-1 py-2.5 text-xs font-medium capitalize transition-all duration-150 relative ${
              activeTab === tab
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-1/4 right-1/4 h-[1.5px] bg-primary rounded-full" />
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto">
        {/* No selection state */}
        {!el && activeTab === "design" && (
          <div className="p-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-secondary mx-auto flex items-center justify-center">
              <ChevronDown className="w-6 h-6 text-muted-foreground rotate-90" />
            </div>
            <p className="text-xs text-muted-foreground">Select an element to edit its properties</p>
            <div className="text-[10px] text-muted-foreground space-y-1">
              <p>Click an element on the canvas</p>
              <p>or click a layer in the panel</p>
            </div>
          </div>
        )}

        {/* Design tab */}
        {el && activeTab === "design" && (
          <div className="px-4 py-2 space-y-1">
            {/* Element name and actions */}
            <div className="flex items-center gap-2 py-2 border-b border-border mb-2">
              <input
                value={el.name}
                onChange={(e) => updateElement(el.id, { name: e.target.value })}
                className="flex-1 bg-transparent text-xs font-medium outline-none text-foreground focus:text-primary transition-colors"
              />
              <button
                onClick={() => { duplicateSelected(); toast.success(`Duplicated "${el.name}"`); }}
                className="p-1 rounded hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors"
                title="Duplicate (⌘D)"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => { deleteSelected(); toast.success("Element deleted"); }}
                className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                title="Delete (⌫)"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Position & Size */}
            <div>
              <SectionHeader title="Position & Size" open={sections.transform} onToggle={() => toggleSection("transform")} />
              {sections.transform && (
                <div className="space-y-1.5 pb-3">
                  <div className="grid grid-cols-2 gap-2">
                    <PropInput label="X" value={Math.round(el.x)} onChange={(v) => update("x", v)} type="number" suffix="px" />
                    <PropInput label="Y" value={Math.round(el.y)} onChange={(v) => update("y", v)} type="number" suffix="px" />
                    <PropInput label="W" value={Math.round(el.width)} onChange={(v) => update("width", v)} type="number" min={1} suffix="px" />
                    <PropInput label="H" value={Math.round(el.height)} onChange={(v) => update("height", v)} type="number" min={1} suffix="px" />
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <PropInput label="R°" value={el.rotation} onChange={(v) => update("rotation", v)} type="number" min={-360} max={360} suffix="°" />
                    <PropInput label="O%" value={Math.round(el.opacity * 100)} onChange={(v) => update("opacity", String(parseFloat(v) / 100))} type="number" min={0} max={100} suffix="%" />
                  </div>
                </div>
              )}
            </div>

            {/* Typography (text elements only) */}
            {el.type === "text" && (
              <div>
                <SectionHeader title="Typography" open={sections.typography} onToggle={() => toggleSection("typography")} />
                {sections.typography && (
                  <div className="space-y-2 pb-3">
                    <div className="flex items-center gap-2">
                      <select
                        value={el.fontFamily || "Inter"}
                        onChange={(e) => updateElement(el.id, { fontFamily: e.target.value })}
                        className="flex-1 h-7 px-2 rounded-md bg-secondary/30 border border-border text-xs text-foreground outline-none focus:border-primary/50"
                      >
                        {["Inter", "Roboto", "Poppins", "DM Sans", "Space Grotesk", "JetBrains Mono", "Playfair Display", "Geist", "Outfit"].map((f) => (
                          <option key={f} value={f}>{f}</option>
                        ))}
                      </select>
                      <select
                        value={el.fontWeight || "400"}
                        onChange={(e) => updateElement(el.id, { fontWeight: e.target.value })}
                        className="w-24 h-7 px-2 rounded-md bg-secondary/30 border border-border text-xs text-foreground outline-none focus:border-primary/50"
                      >
                        {[["100", "Thin"], ["200", "ExtraLight"], ["300", "Light"], ["400", "Regular"], ["500", "Medium"], ["600", "SemiBold"], ["700", "Bold"], ["800", "ExtraBold"], ["900", "Black"]].map(([v, l]) => (
                          <option key={v} value={v}>{l}</option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <PropInput label="Sz" value={el.fontSize || 16} onChange={(v) => update("fontSize", v)} type="number" min={8} max={200} suffix="px" />
                      <PropInput label="Lh" value={el.lineHeight || 1.4} onChange={(v) => update("lineHeight", v)} type="number" min={0.8} max={4} step={0.1} />
                      <PropInput label="Ls" value={el.letterSpacing || 0} onChange={(v) => update("letterSpacing", v)} type="number" min={-0.1} max={0.5} step={0.01} />
                    </div>
                    <div className="flex gap-1">
                      {(["left", "center", "right"] as const).map((align) => (
                        <button
                          key={align}
                          onClick={() => updateElement(el.id, { textAlign: align })}
                          className={`flex-1 py-1 rounded text-[10px] font-medium capitalize transition-colors ${
                            el.textAlign === align ? "bg-primary/20 text-primary" : "bg-secondary/30 text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {align}
                        </button>
                      ))}
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground mb-1 block">Content</span>
                      <textarea
                        value={el.textContent || ""}
                        onChange={(e) => updateElement(el.id, { textContent: e.target.value })}
                        className="w-full h-16 px-2 py-1.5 rounded-md bg-secondary/30 border border-border text-xs text-foreground outline-none focus:border-primary/50 resize-none font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Fill */}
            {el.type !== "line" && (
              <div>
                <SectionHeader
                  title="Fill"
                  open={sections.fill}
                  onToggle={() => toggleSection("fill")}
                  extra={
                    <button
                      className="mr-1 text-muted-foreground hover:text-foreground"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (el) {
                          updateElement(el.id, { fill: "#8B5CF6" });
                          toast.success("Fill color reset");
                        }
                      }}
                      title="Reset fill color"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  }
                />
                {sections.fill && (
                  <div className="pb-3 space-y-2">
                    <ColorSwatch
                      color={el.fill || "transparent"}
                      onChange={(c) => updateElement(el.id, { fill: c })}
                    />
                    {/* Gradient presets */}
                    <div className="grid grid-cols-5 gap-1">
                      {[
                        "linear-gradient(135deg, #8B5CF6, #06B6D4)",
                        "linear-gradient(135deg, #F59E0B, #EF4444)",
                        "linear-gradient(135deg, #10B981, #3B82F6)",
                        "linear-gradient(135deg, #EC4899, #8B5CF6)",
                        "linear-gradient(to right, #1a1a24, #2a2a3a)",
                      ].map((grad) => (
                        <button
                          key={grad}
                          onClick={() => updateElement(el.id, { fill: grad })}
                          className="w-full aspect-square rounded-md border border-border hover:scale-105 transition-transform"
                          style={{ background: grad }}
                          title="Apply gradient"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Stroke */}
            <div>
              <SectionHeader
                title="Stroke"
                open={sections.stroke}
                onToggle={() => toggleSection("stroke")}
                extra={
                  <button
                    className="mr-1 text-muted-foreground hover:text-foreground"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (el) {
                        updateElement(el.id, { stroke: "#8B5CF6", strokeWidth: 1 });
                        setSections((s) => ({ ...s, stroke: true }));
                        toast.success("Stroke added");
                      }
                    }}
                    title="Add stroke"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                }
              />
              {sections.stroke && (
                <div className="space-y-2 pb-3">
                  <ColorSwatch
                    color={el.stroke || "transparent"}
                    onChange={(c) => updateElement(el.id, { stroke: c })}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <PropInput label="W" value={el.strokeWidth || 1} onChange={(v) => update("strokeWidth", v)} type="number" min={0} max={20} suffix="px" />
                    <select
                      className="h-7 px-2 rounded-md bg-secondary/30 border border-border text-xs text-foreground outline-none focus:border-primary/50"
                      value={strokePosition}
                      onChange={(e) => {
                        if (el) updateElement(el.id, { strokePosition: e.target.value as "inside" | "center" | "outside" });
                      }}
                    >
                      <option value="inside">Inside</option>
                      <option value="center">Center</option>
                      <option value="outside">Outside</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Corner Radius */}
            {!["ellipse", "line", "text"].includes(el.type) && (
              <div>
                <SectionHeader title="Corner Radius" open={sections.radius} onToggle={() => toggleSection("radius")} />
                {sections.radius && (
                  <div className="pb-3 space-y-2">
                    <PropInput label="r" value={el.cornerRadius || 0} onChange={(v) => update("cornerRadius", v)} type="number" min={0} max={999} suffix="px" />
                    {/* Radius presets */}
                    <div className="flex gap-1.5">
                      {[0, 4, 8, 12, 16, 24, 999].map((r) => (
                        <button
                          key={r}
                          onClick={() => updateElement(el.id, { cornerRadius: r })}
                          className={`flex-1 py-1.5 rounded text-[9px] font-mono transition-colors ${
                            el.cornerRadius === r ? "bg-primary/20 text-primary" : "bg-secondary/30 text-muted-foreground hover:text-foreground"
                          }`}
                          title={r === 999 ? "Full radius" : `${r}px`}
                        >
                          {r === 999 ? "∞" : r}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Effects */}
            <div>
              <SectionHeader title="Effects" open={sections.effects} onToggle={() => toggleSection("effects")} />
              {sections.effects && (
                <div className="pb-3 space-y-3">
                  <ShadowControl el={el} update={update} />
                  <div className="border-t border-border/50 pt-3">
                    <BlurControl el={el} update={update} />
                  </div>
                </div>
              )}
            </div>

            {/* Export */}
            <div>
              <SectionHeader title="Export" open={sections.export} onToggle={() => toggleSection("export")} />
              {sections.export && (
                <div className="pb-3 space-y-2">
                  <div className="flex gap-2">
                    {["SVG", "CSS"].map((fmt) => (
                      <button
                        key={fmt}
                        onClick={() => {
                          if (fmt === "SVG") {
                            downloadSVG(el);
                            toast.success(`${el.name} exported as SVG`);
                          } else if (fmt === "CSS") {
                            copyCSS(inspectCSS.join("\n"));
                          }
                        }}
                        className="flex-1 py-1.5 rounded-lg bg-secondary/30 border border-border text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors flex items-center justify-center gap-1"
                      >
                        <Download className="w-3 h-3" />
                        {fmt}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => {
                      downloadSVG(el);
                      toast.success(`${el.name} exported`);
                    }}
                    className="w-full py-2 rounded-lg bg-primary/10 border border-primary/20 text-xs text-primary hover:bg-primary/15 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-3 h-3" />
                    Export {el.name}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Prototype tab */}
        {activeTab === "prototype" && (
          <div className="p-4 space-y-4">
            <div className="space-y-1">
              <p className="text-xs font-medium text-foreground">Interactions</p>
              <p className="text-[10px] text-muted-foreground">
                {el ? `Add click/hover interactions to "${el.name}"` : "Select a layer to add interactions"}
              </p>
            </div>

            {interactions.length === 0 && !showAddInteraction ? (
              <div className="p-4 rounded-xl border border-dashed border-border text-center space-y-2">
                <div className="w-8 h-8 mx-auto rounded-lg bg-secondary/50 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground">No interactions yet</p>
                <button
                  className="text-xs text-primary hover:underline"
                  onClick={() => setShowAddInteraction(true)}
                >
                  + Add interaction
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {interactions.map((inter) => (
                  <InteractionRow
                    key={inter.id}
                    trigger={inter.trigger}
                    dest={inter.dest}
                    onRemove={() => {
                      const next = interactions.filter((i) => i.id !== inter.id);
                      setInteractions(next);
                      if (el) updateElement(el.id, { protoInteractions: next, linkTo: next.find(i => i.trigger === "On Click")?.dest });
                    }}
                  />
                ))}
                {!showAddInteraction && (
                  <button
                    className="w-full py-2 rounded-lg border border-dashed border-border text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
                    onClick={() => setShowAddInteraction(true)}
                  >
                    + Add interaction
                  </button>
                )}
              </div>
            )}

            {showAddInteraction && (
              <div className="rounded-xl border border-primary/30 bg-primary/5 p-3 space-y-3 animate-fade-in">
                <p className="text-xs font-medium text-foreground">New Interaction</p>
                <div className="space-y-2">
                  <div>
                    <label className="text-[10px] text-muted-foreground mb-1 block">Trigger</label>
                    <select
                      value={newTrigger}
                      onChange={(e) => setNewTrigger(e.target.value)}
                      className="w-full h-7 px-2 rounded-md bg-secondary/30 border border-border text-xs text-foreground outline-none focus:border-primary/50"
                    >
                      {["On Click", "On Hover", "On Focus", "On Press", "On Drag", "Mouse Enter", "Mouse Leave"].map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground mb-1 block">Navigate to</label>
                    <select
                      value={newDest}
                      onChange={(e) => setNewDest(e.target.value)}
                      className="w-full h-7 px-2 rounded-md bg-secondary/30 border border-border text-xs text-foreground outline-none focus:border-primary/50"
                    >
                      {state.pages.map((p) => (
                        <option key={p.id} value={p.name}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const destPage = newDest || state.pages[0]?.name || "";
                      const newItem = { id: String(Date.now()), trigger: newTrigger, dest: destPage, animation: selectedAnimation, duration: animDuration };
                      const next = [...interactions, newItem];
                      setInteractions(next);
                      if (el) updateElement(el.id, { protoInteractions: next, linkTo: next.find(i => i.trigger === "On Click")?.dest });
                      setShowAddInteraction(false);
                      toast.success("Interaction added");
                    }}
                    className="flex-1 py-1.5 rounded-lg bg-primary/20 text-xs text-primary hover:bg-primary/30 transition-colors"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => setShowAddInteraction(false)}
                    className="flex-1 py-1.5 rounded-lg bg-secondary/30 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {el && (
              <div className="space-y-2 mt-4">
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Animation</p>
                <div className="flex gap-2">
                  {["None", "Fade", "Slide", "Push", "Dissolve"].map((anim) => (
                    <button
                      key={anim}
                      onClick={() => {
                        setSelectedAnimation(anim);
                        if (el) updateElement(el.id, { protoAnimation: anim });
                        toast.success(`Animation: ${anim}`);
                      }}
                      className={`flex-1 py-1.5 text-[10px] rounded-md transition-colors ${
                        selectedAnimation === anim ? "bg-primary/15 text-primary" : "bg-secondary/20 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {anim}
                    </button>
                  ))}
                </div>
                <div className="mt-3">
                  <label className="text-[10px] text-muted-foreground mb-1 block">Duration</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min={100}
                      max={1000}
                      step={50}
                      value={animDuration}
                      onChange={(e) => { const v = Number(e.target.value); setAnimDuration(v); if (el) updateElement(el.id, { protoAnimDuration: v }); }}
                      className="flex-1"
                    />
                    <span className="text-[10px] font-mono text-muted-foreground w-10">{animDuration}ms</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Inspect tab */}
        {activeTab === "inspect" && (
          <div className="p-4 space-y-3">
            {!el ? (
              <div className="text-center space-y-2 py-6">
                <p className="text-xs text-muted-foreground">Select an element to inspect its CSS</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-medium text-muted-foreground">CSS Properties</p>
                  <button
                    onClick={() => { copyCSS(inspectCSS.join("\n")); }}
                    className="text-[10px] text-primary hover:underline flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" /> Copy All
                  </button>
                </div>
                <div className="rounded-lg bg-secondary/30 border border-border p-3 font-mono text-[11px] space-y-1">
                  {inspectCSS.map((line, i) => {
                    if (!line) return null;
                    const colonIdx = (line as string).indexOf(":");
                    const prop = (line as string).slice(0, colonIdx);
                    const val = (line as string).slice(colonIdx);
                    return (
                      <p key={i} className="flex items-start gap-0">
                        <span className="text-primary">{prop}</span>
                        <span className="text-muted-foreground">{val}</span>
                      </p>
                    );
                  })}
                </div>

                {/* Tailwind equivalent */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Tailwind Classes</p>
                    <button
                      onClick={() => {
                        const tw = [
                          el.cornerRadius ? `rounded-[${el.cornerRadius}px]` : "",
                          el.opacity !== 1 ? `opacity-${Math.round(el.opacity * 100)}` : "",
                        ].filter(Boolean).join(" ");
                        navigator.clipboard.writeText(tw);
                        toast.success("Tailwind classes copied");
                      }}
                      className="text-[10px] text-primary hover:underline flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" /> Copy
                    </button>
                  </div>
                  <div className="rounded-lg bg-secondary/30 border border-border p-3 font-mono text-[11px] text-muted-foreground">
                    <span className="text-cyan-400">
                      {[
                        el.type === "rectangle" ? "rounded" : "",
                        el.cornerRadius ? `rounded-[${el.cornerRadius}px]` : "",
                        el.opacity !== 1 ? `opacity-${Math.round(el.opacity * 100)}` : "",
                        el.shadowBlur ? `shadow-lg` : "",
                      ].filter(Boolean).join(" ") || <span className="text-muted-foreground/40">/* no Tailwind classes */</span>}
                    </span>
                  </div>
                </div>

                {/* Box Model */}
                <div>
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">Box Model</p>
                  <div className="rounded-lg bg-secondary/20 border border-border p-3">
                    <div className="border-2 border-dashed border-border/60 rounded p-2 text-center">
                      <div className="text-[9px] text-muted-foreground mb-1">margin</div>
                      <div className="border border-primary/30 rounded p-2 bg-primary/5">
                        <div className="text-[9px] text-muted-foreground mb-1">padding</div>
                        <div className="text-[10px] text-primary font-mono bg-primary/10 rounded px-2 py-1">
                          {Math.round(el.width)} × {Math.round(el.height)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Export from inspect */}
                <div className="pt-1">
                  <button
                    onClick={() => { downloadSVG(el); toast.success(`${el.name} exported as SVG`); }}
                    className="w-full py-2 rounded-lg bg-secondary/30 border border-border text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-3 h-3" />
                    Export as SVG
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
