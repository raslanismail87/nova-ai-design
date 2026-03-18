import { useState, useCallback } from "react";
import { ChevronDown, Plus, Trash2, Copy } from "lucide-react";
import { useCanvas, CanvasElement } from "@/contexts/CanvasContext";

// --- Utility Components ---

const SectionHeader = ({
  title,
  open,
  onToggle,
  extra,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  extra?: React.ReactNode;
}) => (
  <button
    className="w-full flex items-center justify-between py-2 text-xs font-medium text-foreground"
    onClick={onToggle}
  >
    {title}
    <div className="flex items-center gap-1">
      {extra}
      <ChevronDown
        className={`w-3 h-3 text-muted-foreground transition-transform ${open ? "" : "-rotate-90"}`}
      />
    </div>
  </button>
);

const PropInput = ({
  label,
  value,
  onChange,
  type = "text",
  suffix,
  min,
  max,
  step = 1,
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  type?: string;
  suffix?: string;
  min?: number;
  max?: number;
  step?: number;
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
        className="w-full h-7 px-2 rounded-md bg-secondary/30 border border-border text-xs font-mono text-foreground outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
      />
      {suffix && (
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground pointer-events-none">
          {suffix}
        </span>
      )}
    </div>
  </div>
);

const ColorSwatch = ({
  color,
  onChange,
}: {
  color: string;
  onChange: (c: string) => void;
}) => {
  // Only show picker for solid hex colors
  const isSolid = color.startsWith("#") || color.startsWith("rgb");
  const isGradient = color.startsWith("linear-gradient");
  const displayColor = isGradient ? "#8B5CF6" : isSolid ? color : "transparent";

  return (
    <div className="flex items-center gap-2">
      <label className="w-7 h-7 rounded-md border border-border overflow-hidden cursor-pointer shrink-0 relative">
        <div
          className="w-full h-full"
          style={{ background: color || "transparent" }}
        />
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
        className="flex-1 h-7 px-2 rounded-md bg-secondary/30 border border-border text-xs font-mono text-foreground outline-none focus:border-primary/50 transition-all"
        placeholder="none"
        readOnly={isGradient}
      />
    </div>
  );
};

// --- Main Component ---

interface Props {
  activeTab: "design" | "prototype" | "inspect";
  onTabChange: (tab: "design" | "prototype" | "inspect") => void;
}

const tabs = ["design", "prototype", "inspect"] as const;

export default function EditorRightSidebar({ activeTab, onTabChange }: Props) {
  const { state, updateElement, selectedElements, deleteSelected } = useCanvas();

  const [sections, setSections] = useState({
    transform: true,
    layout: false,
    typography: true,
    fill: true,
    stroke: false,
    effects: true,
    radius: true,
    export: false,
  });

  const toggleSection = (key: keyof typeof sections) =>
    setSections((s) => ({ ...s, [key]: !s[key] }));

  // Use the first selected element for display
  const el: CanvasElement | null = selectedElements[0] ?? null;

  const update = useCallback(
    (key: keyof CanvasElement, raw: string) => {
      if (!el) return;
      const numKeys: (keyof CanvasElement)[] = [
        "x", "y", "width", "height", "rotation", "opacity", "cornerRadius",
        "strokeWidth", "fontSize", "lineHeight", "letterSpacing",
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
        el.fill && el.fill !== "transparent" && `background: ${el.fill};`,
        el.stroke && `border: ${el.strokeWidth}px solid ${el.stroke};`,
        el.opacity !== 1 && `opacity: ${el.opacity};`,
        el.type === "text" && `font-size: ${el.fontSize}px;`,
        el.type === "text" && `font-weight: ${el.fontWeight};`,
        el.type === "text" && `font-family: "${el.fontFamily}";`,
        el.type === "text" && `line-height: ${el.lineHeight};`,
        el.type === "text" && `letter-spacing: ${el.letterSpacing}em;`,
        el.type === "text" && `color: ${el.fill};`,
      ].filter(Boolean)
    : [];

  return (
    <aside className="w-72 border-l border-border bg-card flex flex-col shrink-0">
      {/* Tabs */}
      <div className="flex border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`flex-1 py-2.5 text-xs font-medium capitalize transition-colors ${
              activeTab === tab
                ? "text-foreground border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto">
        {/* No selection state */}
        {!el && activeTab === "design" && (
          <div className="p-6 text-center space-y-2">
            <div className="w-10 h-10 rounded-xl bg-secondary/50 mx-auto flex items-center justify-center">
              <ChevronDown className="w-5 h-5 text-muted-foreground rotate-90" />
            </div>
            <p className="text-xs text-muted-foreground">Select an element to edit its properties</p>
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
                className="flex-1 bg-transparent text-xs font-medium outline-none text-foreground"
              />
              <button
                onClick={deleteSelected}
                className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                title="Delete element"
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
                    <PropInput label="X" value={Math.round(el.x)} onChange={(v) => update("x", v)} type="number" />
                    <PropInput label="Y" value={Math.round(el.y)} onChange={(v) => update("y", v)} type="number" />
                    <PropInput label="W" value={Math.round(el.width)} onChange={(v) => update("width", v)} type="number" min={1} />
                    <PropInput label="H" value={Math.round(el.height)} onChange={(v) => update("height", v)} type="number" min={1} />
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <PropInput label="R°" value={el.rotation} onChange={(v) => update("rotation", v)} type="number" min={-360} max={360} />
                    <PropInput label="O%" value={Math.round(el.opacity * 100)} onChange={(v) => update("opacity", String(parseFloat(v) / 100))} type="number" min={0} max={100} />
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
                        {["Inter", "Roboto", "Poppins", "DM Sans", "Space Grotesk", "JetBrains Mono", "Playfair Display"].map((f) => (
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
                      <PropInput label="Sz" value={el.fontSize || 16} onChange={(v) => update("fontSize", v)} type="number" min={8} max={200} />
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
                    <button className="mr-1 text-muted-foreground hover:text-foreground" onClick={(e) => e.stopPropagation()}>
                      <Plus className="w-3 h-3" />
                    </button>
                  }
                />
                {sections.fill && (
                  <div className="pb-3">
                    <ColorSwatch
                      color={el.fill || "transparent"}
                      onChange={(c) => updateElement(el.id, { fill: c })}
                    />
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
                  <button className="mr-1 text-muted-foreground hover:text-foreground" onClick={(e) => e.stopPropagation()}>
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
                  <PropInput label="W" value={el.strokeWidth || 1} onChange={(v) => update("strokeWidth", v)} type="number" min={0} max={20} />
                </div>
              )}
            </div>

            {/* Corner Radius (non-ellipse, non-line, non-text) */}
            {!["ellipse", "line", "text"].includes(el.type) && (
              <div>
                <SectionHeader title="Corner Radius" open={sections.radius} onToggle={() => toggleSection("radius")} />
                {sections.radius && (
                  <div className="pb-3">
                    <PropInput label="r" value={el.cornerRadius || 0} onChange={(v) => update("cornerRadius", v)} type="number" min={0} max={999} />
                  </div>
                )}
              </div>
            )}

            {/* Effects */}
            <div>
              <SectionHeader title="Effects" open={sections.effects} onToggle={() => toggleSection("effects")} />
              {sections.effects && (
                <div className="pb-3 space-y-2">
                  <div className="p-2.5 rounded-lg bg-secondary/20 border border-border/50 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Drop Shadow</span>
                    <button className="text-[10px] text-primary hover:underline">+ Add</button>
                  </div>
                  <div className="p-2.5 rounded-lg bg-secondary/20 border border-border/50 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Blur</span>
                    <button className="text-[10px] text-primary hover:underline">+ Add</button>
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
                    {["PNG", "SVG", "PDF"].map((fmt) => (
                      <button
                        key={fmt}
                        className="flex-1 py-1.5 rounded-lg bg-secondary/30 border border-border text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
                      >
                        {fmt}
                      </button>
                    ))}
                  </div>
                  <button className="w-full py-2 rounded-lg bg-primary/10 border border-primary/20 text-xs text-primary hover:bg-primary/15 transition-colors">
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
            <p className="text-xs text-muted-foreground">
              {el ? `Interactions for "${el.name}"` : "Select a layer to add interactions"}
            </p>
            <div className="p-4 rounded-xl border border-dashed border-border text-center space-y-2">
              <div className="w-8 h-8 mx-auto rounded-lg bg-secondary/50 flex items-center justify-center">
                <Plus className="w-4 h-4 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground">No interactions yet</p>
              <button className="text-xs text-primary hover:underline">+ Add interaction</button>
            </div>
            {el && (
              <div className="space-y-2">
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Triggers</p>
                {["On Click", "On Hover", "On Focus"].map((trigger) => (
                  <button
                    key={trigger}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/20 border border-border text-xs text-muted-foreground hover:text-foreground hover:border-primary/20 transition-colors"
                  >
                    <Plus className="w-3 h-3 text-primary" />
                    {trigger}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Inspect tab */}
        {activeTab === "inspect" && (
          <div className="p-4 space-y-3">
            {!el ? (
              <p className="text-xs text-muted-foreground">Select an element to inspect its CSS</p>
            ) : (
              <>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-medium text-muted-foreground">CSS Properties</p>
                  <button
                    onClick={() => navigator.clipboard.writeText(inspectCSS.join("\n"))}
                    className="text-[10px] text-primary hover:underline flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" /> Copy
                  </button>
                </div>
                <div className="rounded-lg bg-secondary/30 border border-border p-3 font-mono text-[11px] space-y-1">
                  {inspectCSS.map((line, i) => {
                    if (!line) return null;
                    const [prop, ...rest] = (line as string).split(":");
                    return (
                      <p key={i}>
                        <span className="text-primary">{prop}</span>
                        <span className="text-muted-foreground">:{rest.join(":")}</span>
                      </p>
                    );
                  })}
                </div>
                <div className="mt-3">
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">Box Model</p>
                  <div className="aspect-square rounded-lg bg-secondary/20 border border-border p-3 flex items-center justify-center">
                    <div className="border-2 border-dashed border-border/60 rounded px-6 py-4 text-center">
                      <div className="text-[9px] text-muted-foreground mb-2">margin</div>
                      <div className="border border-primary/30 rounded px-3 py-2 bg-primary/5">
                        <div className="text-[9px] text-muted-foreground mb-1">padding</div>
                        <div className="text-[9px] text-primary font-mono">
                          {Math.round(el.width)} × {Math.round(el.height)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
