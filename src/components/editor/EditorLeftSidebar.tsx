import { useState } from "react";
import {
  ChevronRight, ChevronDown, Eye, EyeOff, Lock, Unlock,
  Frame, Type, Image, Layers, Component, FolderOpen, Square, Circle, Minus,
  Plus, Trash2, Search,
} from "lucide-react";
import { useCanvas, CanvasElement } from "@/contexts/CanvasContext";

const typeIcons: Record<string, any> = {
  frame: Frame,
  group: FolderOpen,
  component: Component,
  text: Type,
  image: Image,
  rectangle: Square,
  ellipse: Circle,
  line: Minus,
};

const LayerRow = ({
  el,
  depth,
  selectedIds,
  onSelect,
}: {
  el: CanvasElement;
  depth: number;
  selectedIds: string[];
  onSelect: (id: string, multi: boolean) => void;
}) => {
  const { dispatch } = useCanvas();
  const [expanded, setExpanded] = useState(depth < 1);
  const Icon = typeIcons[el.type] || Layers;
  const isSelected = selectedIds.includes(el.id);

  return (
    <div>
      <div
        className={`group flex items-center gap-1 px-2 py-[5px] text-xs transition-colors cursor-pointer select-none ${
          isSelected
            ? "bg-primary/15 text-primary"
            : "text-muted-foreground hover:bg-secondary/40 hover:text-foreground"
        } ${!el.visible ? "opacity-40" : ""}`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={(e) => onSelect(el.id, e.shiftKey || e.metaKey || e.ctrlKey)}
      >
        {/* Expand toggle placeholder */}
        <span className="w-3 shrink-0" />

        {/* Icon */}
        <Icon
          className={`w-3 h-3 shrink-0 ${isSelected ? "text-primary" : el.isFrame ? "text-violet-400" : ""}`}
        />

        {/* Name */}
        <span className="truncate flex-1 text-left leading-none">{el.name}</span>

        {/* Actions on hover */}
        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity ml-1">
          <button
            title={el.visible ? "Hide" : "Show"}
            onClick={(e) => { e.stopPropagation(); dispatch({ type: "TOGGLE_VISIBLE", id: el.id }); }}
            className="p-0.5 rounded hover:bg-secondary/50"
          >
            {el.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
          </button>
          <button
            title={el.locked ? "Unlock" : "Lock"}
            onClick={(e) => { e.stopPropagation(); dispatch({ type: "TOGGLE_LOCK", id: el.id }); }}
            className="p-0.5 rounded hover:bg-secondary/50"
          >
            {el.locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
          </button>
        </div>
      </div>
    </div>
  );
};

const assetComponents = [
  "Button", "Card", "Input", "Avatar", "Badge", "Modal", "Tooltip",
  "Dropdown", "Toggle", "Slider", "Table", "Tabs",
];

const tabs = ["Layers", "Assets", "Pages"];

export default function EditorLeftSidebar() {
  const { state, selectById, addElement, dispatch } = useCanvas();
  const { elements, selectedIds } = state;

  const [activeTab, setActiveTab] = useState("Layers");
  const [search, setSearch] = useState("");

  const filteredElements = search
    ? elements.filter((el) => el.name.toLowerCase().includes(search.toLowerCase()))
    : elements;

  // Sorted: frames at top, then other elements
  const frames = filteredElements.filter((el) => el.isFrame);
  const nonFrames = filteredElements.filter((el) => !el.isFrame);
  const sorted = [...frames.reverse(), ...nonFrames.reverse()];

  const handleAddElement = (type: string) => {
    addElement({
      type: type as any,
      x: 100, y: 100, width: type === "text" ? 200 : 120, height: type === "text" ? 40 : 80,
      rotation: 0,
      fill: type === "text" ? "#F2F2F2" : "rgba(139,92,246,0.2)",
      stroke: type === "text" ? "" : "rgba(139,92,246,0.4)",
      strokeWidth: 1,
      opacity: 1, cornerRadius: type === "ellipse" ? 999 : 8,
      name: type.charAt(0).toUpperCase() + type.slice(1),
      visible: true, locked: false,
      textContent: type === "text" ? "New Text" : undefined,
      fontSize: type === "text" ? 16 : undefined,
      fontFamily: type === "text" ? "Inter" : undefined,
      fontWeight: type === "text" ? "400" : undefined,
    });
  };

  return (
    <aside className="w-64 border-r border-border bg-card flex flex-col shrink-0">
      {/* Tabs */}
      <div className="flex border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 text-xs font-medium transition-colors ${
              activeTab === tab
                ? "text-foreground border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Layers tab */}
      {activeTab === "Layers" && (
        <>
          {/* Search + add */}
          <div className="flex items-center gap-1 px-2 py-2 border-b border-border">
            <div className="flex-1 relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search layers..."
                className="w-full pl-6 pr-2 h-6 rounded bg-secondary/30 border border-border text-[11px] text-foreground outline-none focus:border-primary/50 placeholder:text-muted-foreground/50"
              />
            </div>
            <button
              title="Add rectangle"
              onClick={() => handleAddElement("rectangle")}
              className="p-1 rounded hover:bg-secondary/50 text-muted-foreground hover:text-foreground"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Layer list */}
          <div className="flex-1 overflow-auto py-1">
            {sorted.length === 0 ? (
              <div className="p-4 text-center text-xs text-muted-foreground">
                <p>No layers yet.</p>
                <p className="mt-1 text-[10px]">Draw shapes on the canvas.</p>
              </div>
            ) : (
              sorted.map((el) => (
                <LayerRow
                  key={el.id}
                  el={el}
                  depth={0}
                  selectedIds={selectedIds}
                  onSelect={(id, multi) => selectById(id, multi)}
                />
              ))
            )}
          </div>

          {/* Quick add */}
          <div className="border-t border-border p-2">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5 px-1">Quick Add</p>
            <div className="grid grid-cols-4 gap-1">
              {[
                { type: "rectangle", icon: Square, label: "Rect" },
                { type: "ellipse", icon: Circle, label: "Circle" },
                { type: "text", icon: Type, label: "Text" },
                { type: "frame", icon: Frame, label: "Frame" },
              ].map(({ type, icon: Icon, label }) => (
                <button
                  key={type}
                  onClick={() => handleAddElement(type)}
                  className="flex flex-col items-center gap-1 py-2 rounded-lg bg-secondary/20 hover:bg-primary/10 hover:text-primary text-muted-foreground transition-colors"
                  title={`Add ${label}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="text-[9px]">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Assets tab */}
      {activeTab === "Assets" && (
        <div className="flex-1 overflow-auto p-3 space-y-3">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
            <input
              placeholder="Search components..."
              className="w-full pl-7 pr-2 h-7 rounded bg-secondary/30 border border-border text-xs text-foreground outline-none focus:border-primary/50 placeholder:text-muted-foreground/50"
            />
          </div>
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Components</p>
          <div className="space-y-0.5">
            {assetComponents.map((comp) => (
              <button
                key={comp}
                onClick={() => addElement({
                  type: "rectangle",
                  x: 100, y: 100, width: 120, height: 40,
                  rotation: 0, fill: "rgba(139,92,246,0.15)", stroke: "rgba(139,92,246,0.3)", strokeWidth: 1,
                  opacity: 1, cornerRadius: 8,
                  name: comp, visible: true, locked: false,
                })}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-secondary/50 text-xs text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
              >
                <Component className="w-3 h-3 text-primary shrink-0" />
                {comp}
              </button>
            ))}
          </div>

          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mt-3">Design Tokens</p>
          <div className="space-y-1.5">
            {[
              { name: "Primary", color: "#8B5CF6" },
              { name: "Accent Cyan", color: "#06B6D4" },
              { name: "Background", color: "#0a0a0f" },
              { name: "Surface", color: "#1a1a24" },
              { name: "Border", color: "rgba(255,255,255,0.08)" },
              { name: "Text Primary", color: "#F2F2F2" },
              { name: "Text Muted", color: "#888" },
            ].map(({ name, color }) => (
              <div key={name} className="flex items-center gap-2 px-1">
                <div className="w-4 h-4 rounded" style={{ background: color, border: "1px solid rgba(255,255,255,0.1)" }} />
                <span className="text-xs text-muted-foreground">{name}</span>
                <span className="ml-auto text-[9px] font-mono text-muted-foreground/50">{color}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pages tab */}
      {activeTab === "Pages" && (
        <div className="flex-1 overflow-auto p-3 space-y-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Pages</span>
            <button className="p-0.5 rounded hover:bg-secondary/50 text-muted-foreground hover:text-foreground">
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
          {["Landing Page", "Dashboard", "Settings", "Profile", "Onboarding"].map((page, i) => (
            <div
              key={page}
              className={`flex items-center gap-2 px-2 py-2 rounded-lg text-xs cursor-pointer transition-colors ${
                i === 0
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
              }`}
            >
              <Frame className="w-3 h-3 shrink-0" />
              <span className="flex-1 truncate">{page}</span>
              {i !== 0 && (
                <Trash2 className="w-3 h-3 opacity-0 group-hover:opacity-100 hover:text-destructive" />
              )}
            </div>
          ))}
        </div>
      )}
    </aside>
  );
}
