import { useState } from "react";
import {
  ChevronRight, ChevronDown, Eye, EyeOff, Lock, Unlock,
  Frame, Type, Image, Layers, Component, FolderOpen, Square, Circle, Minus,
  Plus, Trash2, Search, Edit3, GripVertical,
} from "lucide-react";
import { useCanvas, CanvasElement } from "@/contexts/CanvasContext";
import { toast } from "sonner";

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

const typeColors: Record<string, string> = {
  frame:     "text-violet-400/70",
  text:      "text-blue-400/70",
  image:     "text-amber-400/70",
  rectangle: "text-muted-foreground/60",
  ellipse:   "text-cyan-400/70",
  line:      "text-muted-foreground/50",
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
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameVal, setRenameVal] = useState(el.name);
  const Icon = typeIcons[el.type] || Layers;
  const isSelected = selectedIds.includes(el.id);
  const iconColor = typeColors[el.type] || "text-muted-foreground";

  const finishRename = () => {
    if (renameVal.trim()) {
      dispatch({ type: "UPDATE_ELEMENT", id: el.id, updates: { name: renameVal.trim() } });
    }
    setIsRenaming(false);
  };

  return (
    <div>
      <div
        className={`group flex items-center h-7 gap-1.5 text-[12px] transition-colors duration-75 cursor-pointer select-none relative ${
          isSelected
            ? "bg-primary/10 text-foreground"
            : "text-muted-foreground/75 hover:bg-foreground/[0.04] hover:text-foreground/85"
        } ${!el.visible ? "opacity-35" : ""}`}
        style={{ paddingLeft: `${depth * 14 + 10}px`, paddingRight: 8 }}
        onClick={(e) => !isRenaming && onSelect(el.id, e.shiftKey || e.metaKey || e.ctrlKey)}
        onDoubleClick={() => { setIsRenaming(true); setRenameVal(el.name); }}
      >
        {/* Selected accent bar */}
        {isSelected && (
          <div className="absolute left-0 top-1 bottom-1 w-0.5 rounded-full bg-primary/70" />
        )}

        {/* Drag handle */}
        <GripVertical className="w-2.5 h-2.5 shrink-0 opacity-0 group-hover:opacity-25 transition-opacity duration-75" />

        {/* Element icon */}
        <Icon className={`w-3 h-3 shrink-0 ${isSelected ? "text-primary/80" : iconColor}`} />

        {/* Name / rename input */}
        {isRenaming ? (
          <input
            value={renameVal}
            onChange={(e) => setRenameVal(e.target.value)}
            onBlur={finishRename}
            onKeyDown={(e) => {
              if (e.key === "Enter") finishRename();
              if (e.key === "Escape") setIsRenaming(false);
            }}
            className="flex-1 h-5 bg-secondary/60 rounded px-1.5 text-[11px] font-medium outline-none border border-primary/35"
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className="truncate flex-1 leading-none">{el.name}</span>
        )}

        {/* Hover actions */}
        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-px transition-opacity duration-75 shrink-0">
          <button
            title={el.visible ? "Hide" : "Show"}
            onClick={(e) => { e.stopPropagation(); dispatch({ type: "TOGGLE_VISIBLE", id: el.id }); }}
            className="w-5 h-5 flex items-center justify-center rounded hover:bg-foreground/[0.08] transition-colors duration-75"
          >
            {el.visible
              ? <Eye className="w-2.5 h-2.5 text-muted-foreground/60" />
              : <EyeOff className="w-2.5 h-2.5 text-muted-foreground/60" />
            }
          </button>
          <button
            title={el.locked ? "Unlock" : "Lock"}
            onClick={(e) => { e.stopPropagation(); dispatch({ type: "TOGGLE_LOCK", id: el.id }); }}
            className="w-5 h-5 flex items-center justify-center rounded hover:bg-foreground/[0.08] transition-colors duration-75"
          >
            {el.locked
              ? <Lock className="w-2.5 h-2.5 text-muted-foreground/60" />
              : <Unlock className="w-2.5 h-2.5 text-muted-foreground/60" />
            }
          </button>
        </div>
      </div>
    </div>
  );
};

// Rich component presets — insert meaningful multi-element groups
const componentPresets: Record<string, Array<Omit<CanvasElement, "id">>> = {
  "Primary Button": [
    { type: "rectangle", x: 100, y: 100, width: 160, height: 48, rotation: 0, fill: "linear-gradient(135deg, #8B5CF6, #06B6D4)", stroke: "", strokeWidth: 0, opacity: 1, cornerRadius: 12, name: "Button BG", visible: true, locked: false },
    { type: "text", x: 140, y: 120, width: 80, height: 24, rotation: 0, fill: "#FFFFFF", stroke: "", strokeWidth: 0, opacity: 1, cornerRadius: 0, name: "Button Label", textContent: "Get Started", fontSize: 14, fontWeight: "600", fontFamily: "Inter", textAlign: "center", lineHeight: 1.2, letterSpacing: 0, visible: true, locked: false },
  ],
  "Card": [
    { type: "rectangle", x: 100, y: 100, width: 280, height: 180, rotation: 0, fill: "rgba(30,30,40,0.9)", stroke: "rgba(255,255,255,0.08)", strokeWidth: 1, opacity: 1, cornerRadius: 16, name: "Card BG", visible: true, locked: false },
    { type: "rectangle", x: 124, y: 124, width: 36, height: 36, rotation: 0, fill: "linear-gradient(135deg, #8B5CF6, #06B6D4)", stroke: "", strokeWidth: 0, opacity: 1, cornerRadius: 10, name: "Card Icon", visible: true, locked: false },
    { type: "text", x: 124, y: 174, width: 200, height: 22, rotation: 0, fill: "#F2F2F2", stroke: "", strokeWidth: 0, opacity: 1, cornerRadius: 0, name: "Card Title", textContent: "Feature Title", fontSize: 14, fontWeight: "600", fontFamily: "Inter", textAlign: "left", lineHeight: 1.3, letterSpacing: -0.01, visible: true, locked: false },
    { type: "text", x: 124, y: 200, width: 220, height: 40, rotation: 0, fill: "#888", stroke: "", strokeWidth: 0, opacity: 1, cornerRadius: 0, name: "Card Description", textContent: "A concise description of this feature goes here.", fontSize: 12, fontWeight: "400", fontFamily: "Inter", textAlign: "left", lineHeight: 1.5, letterSpacing: 0, visible: true, locked: false },
  ],
  "Input": [
    { type: "rectangle", x: 100, y: 100, width: 280, height: 44, rotation: 0, fill: "rgba(20,20,30,0.8)", stroke: "rgba(255,255,255,0.1)", strokeWidth: 1, opacity: 1, cornerRadius: 10, name: "Input BG", visible: true, locked: false },
    { type: "text", x: 116, y: 118, width: 150, height: 20, rotation: 0, fill: "#666", stroke: "", strokeWidth: 0, opacity: 1, cornerRadius: 0, name: "Placeholder", textContent: "Enter your email...", fontSize: 13, fontWeight: "400", fontFamily: "Inter", textAlign: "left", lineHeight: 1.4, letterSpacing: 0, visible: true, locked: false },
  ],
  "Avatar": [
    { type: "ellipse", x: 100, y: 100, width: 48, height: 48, rotation: 0, fill: "linear-gradient(135deg, #8B5CF6, #06B6D4)", stroke: "rgba(255,255,255,0.15)", strokeWidth: 2, opacity: 1, cornerRadius: 0, name: "Avatar BG", visible: true, locked: false },
    { type: "text", x: 100, y: 118, width: 48, height: 20, rotation: 0, fill: "#FFFFFF", stroke: "", strokeWidth: 0, opacity: 1, cornerRadius: 0, name: "Avatar Initial", textContent: "A", fontSize: 18, fontWeight: "600", fontFamily: "Inter", textAlign: "center", lineHeight: 1.2, letterSpacing: 0, visible: true, locked: false },
  ],
  "Badge": [
    { type: "rectangle", x: 100, y: 100, width: 80, height: 24, rotation: 0, fill: "rgba(139,92,246,0.15)", stroke: "rgba(139,92,246,0.3)", strokeWidth: 1, opacity: 1, cornerRadius: 999, name: "Badge BG", visible: true, locked: false },
    { type: "text", x: 100, y: 106, width: 80, height: 14, rotation: 0, fill: "#8B5CF6", stroke: "", strokeWidth: 0, opacity: 1, cornerRadius: 0, name: "Badge Label", textContent: "New", fontSize: 10, fontWeight: "600", fontFamily: "Inter", textAlign: "center", lineHeight: 1.2, letterSpacing: 0.05, visible: true, locked: false },
  ],
  "Modal": [
    { type: "rectangle", x: 80, y: 60, width: 440, height: 320, rotation: 0, fill: "rgba(18,18,26,0.98)", stroke: "rgba(255,255,255,0.1)", strokeWidth: 1, opacity: 1, cornerRadius: 20, name: "Modal BG", visible: true, locked: false, shadowColor: "rgba(0,0,0,0.6)", shadowX: 0, shadowY: 24, shadowBlur: 48 },
    { type: "text", x: 112, y: 100, width: 280, height: 32, rotation: 0, fill: "#F2F2F2", stroke: "", strokeWidth: 0, opacity: 1, cornerRadius: 0, name: "Modal Title", textContent: "Confirm Action", fontSize: 18, fontWeight: "600", fontFamily: "Inter", textAlign: "left", lineHeight: 1.3, letterSpacing: -0.01, visible: true, locked: false },
    { type: "text", x: 112, y: 144, width: 360, height: 50, rotation: 0, fill: "#888", stroke: "", strokeWidth: 0, opacity: 1, cornerRadius: 0, name: "Modal Body", textContent: "Are you sure you want to perform this action? This cannot be undone.", fontSize: 13, fontWeight: "400", fontFamily: "Inter", textAlign: "left", lineHeight: 1.6, letterSpacing: 0, visible: true, locked: false },
    { type: "rectangle", x: 300, y: 320, width: 120, height: 40, rotation: 0, fill: "linear-gradient(135deg, #8B5CF6, #06B6D4)", stroke: "", strokeWidth: 0, opacity: 1, cornerRadius: 10, name: "Confirm Button", visible: true, locked: false },
    { type: "rectangle", x: 168, y: 320, width: 120, height: 40, rotation: 0, fill: "transparent", stroke: "rgba(255,255,255,0.1)", strokeWidth: 1, opacity: 1, cornerRadius: 10, name: "Cancel Button", visible: true, locked: false },
  ],
  "Navbar": [
    { type: "frame", isFrame: true, x: 0, y: 0, width: 1280, height: 72, rotation: 0, fill: "rgba(10,10,15,0.95)", stroke: "rgba(255,255,255,0.08)", strokeWidth: 1, opacity: 1, cornerRadius: 0, name: "Navbar", visible: true, locked: false },
    { type: "rectangle", x: 32, y: 22, width: 28, height: 28, rotation: 0, fill: "linear-gradient(135deg, #8B5CF6, #06B6D4)", stroke: "", strokeWidth: 0, opacity: 1, cornerRadius: 8, name: "Logo Mark", visible: true, locked: false },
    { type: "rectangle", x: 1152, y: 20, width: 96, height: 32, rotation: 0, fill: "linear-gradient(135deg, #8B5CF6, #06B6D4)", stroke: "", strokeWidth: 0, opacity: 1, cornerRadius: 8, name: "Nav CTA", visible: true, locked: false },
  ],
  "Toggle": [
    { type: "rectangle", x: 100, y: 100, width: 52, height: 28, rotation: 0, fill: "linear-gradient(135deg, #8B5CF6, #06B6D4)", stroke: "", strokeWidth: 0, opacity: 1, cornerRadius: 999, name: "Toggle Track", visible: true, locked: false },
    { type: "ellipse", x: 124, y: 104, width: 20, height: 20, rotation: 0, fill: "#FFFFFF", stroke: "", strokeWidth: 0, opacity: 1, cornerRadius: 0, name: "Toggle Thumb", visible: true, locked: false },
  ],
  "Checkbox": [
    { type: "rectangle", x: 100, y: 100, width: 18, height: 18, rotation: 0, fill: "rgba(139,92,246,0.15)", stroke: "#8B5CF6", strokeWidth: 1.5, opacity: 1, cornerRadius: 4, name: "Checkbox Box", visible: true, locked: false },
    { type: "text", x: 128, y: 100, width: 100, height: 18, rotation: 0, fill: "#F2F2F2", stroke: "", strokeWidth: 0, opacity: 1, cornerRadius: 0, name: "Checkbox Label", textContent: "Check option", fontSize: 13, fontWeight: "400", fontFamily: "Inter", textAlign: "left", lineHeight: 1.4, letterSpacing: 0, visible: true, locked: false },
  ],
  "Divider": [
    { type: "line", x: 48, y: 100, width: 1184, height: 0, rotation: 0, fill: "rgba(255,255,255,0.08)", stroke: "rgba(255,255,255,0.08)", strokeWidth: 1, opacity: 1, cornerRadius: 0, name: "Divider", visible: true, locked: false },
  ],
  "Tag / Chip": [
    { type: "rectangle", x: 100, y: 100, width: 90, height: 28, rotation: 0, fill: "rgba(6,182,212,0.1)", stroke: "rgba(6,182,212,0.3)", strokeWidth: 1, opacity: 1, cornerRadius: 6, name: "Chip BG", visible: true, locked: false },
    { type: "text", x: 100, y: 108, width: 90, height: 14, rotation: 0, fill: "#06B6D4", stroke: "", strokeWidth: 0, opacity: 1, cornerRadius: 0, name: "Chip Label", textContent: "Design", fontSize: 11, fontWeight: "500", fontFamily: "Inter", textAlign: "center", lineHeight: 1.2, letterSpacing: 0.03, visible: true, locked: false },
  ],
  "Progress Bar": [
    { type: "rectangle", x: 100, y: 100, width: 280, height: 8, rotation: 0, fill: "rgba(255,255,255,0.08)", stroke: "", strokeWidth: 0, opacity: 1, cornerRadius: 999, name: "Progress Track", visible: true, locked: false },
    { type: "rectangle", x: 100, y: 100, width: 168, height: 8, rotation: 0, fill: "linear-gradient(135deg, #8B5CF6, #06B6D4)", stroke: "", strokeWidth: 0, opacity: 1, cornerRadius: 999, name: "Progress Fill (60%)", visible: true, locked: false },
  ],
  "Stat Card": [
    { type: "rectangle", x: 100, y: 100, width: 200, height: 120, rotation: 0, fill: "rgba(20,20,30,0.8)", stroke: "rgba(255,255,255,0.07)", strokeWidth: 1, opacity: 1, cornerRadius: 16, name: "Stat Card BG", visible: true, locked: false },
    { type: "text", x: 124, y: 122, width: 160, height: 18, rotation: 0, fill: "#888", stroke: "", strokeWidth: 0, opacity: 1, cornerRadius: 0, name: "Stat Label", textContent: "Total Revenue", fontSize: 11, fontWeight: "500", fontFamily: "Inter", textAlign: "left", lineHeight: 1.3, letterSpacing: 0.02, visible: true, locked: false },
    { type: "text", x: 124, y: 148, width: 160, height: 40, rotation: 0, fill: "#F2F2F2", stroke: "", strokeWidth: 0, opacity: 1, cornerRadius: 0, name: "Stat Value", textContent: "$48,295", fontSize: 28, fontWeight: "700", fontFamily: "Inter", textAlign: "left", lineHeight: 1.1, letterSpacing: -0.02, visible: true, locked: false },
    { type: "text", x: 124, y: 194, width: 100, height: 16, rotation: 0, fill: "#10B981", stroke: "", strokeWidth: 0, opacity: 1, cornerRadius: 0, name: "Stat Change", textContent: "+12.5%", fontSize: 11, fontWeight: "600", fontFamily: "Inter", textAlign: "left", lineHeight: 1.3, letterSpacing: 0, visible: true, locked: false },
  ],
};

const tabs = ["Layers", "Assets", "Pages"];

export default function EditorLeftSidebar() {
  const { state, selectById, addElement, addElements, dispatch, addPage, removePage, renamePage, switchPage } = useCanvas();
  const { elements, selectedIds, pages, currentPageId } = state;

  const [activeTab, setActiveTab] = useState("Layers");
  const [search, setSearch] = useState("");
  const [assetSearch, setAssetSearch] = useState("");
  const [renamingPageId, setRenamingPageId] = useState<string | null>(null);
  const [renameVal, setRenameVal] = useState("");
  const [expandedGroup, setExpandedGroup] = useState<string | null>("Components");

  const filteredElements = search
    ? elements.filter((el) => el.name.toLowerCase().includes(search.toLowerCase()))
    : elements;

  // Show frames first (reversed to match z-order), then other elements
  const frames = filteredElements.filter((el) => el.isFrame).reverse();
  const nonFrames = filteredElements.filter((el) => !el.isFrame).reverse();
  const sorted = [...frames, ...nonFrames];

  const filteredComponents = assetSearch
    ? Object.keys(componentPresets).filter((k) => k.toLowerCase().includes(assetSearch.toLowerCase()))
    : Object.keys(componentPresets);

  const handleAddQuick = (type: string) => {
    addElement({
      type: type as any,
      x: 100, y: 100, width: type === "text" ? 200 : type === "line" ? 200 : 120, height: type === "text" ? 40 : type === "line" ? 2 : 80,
      rotation: 0,
      fill: type === "text" ? "#F2F2F2" : type === "line" ? "rgba(255,255,255,0.2)" : "rgba(139,92,246,0.2)",
      stroke: type === "text" ? "" : type === "line" ? "rgba(255,255,255,0.2)" : "rgba(139,92,246,0.4)",
      strokeWidth: type === "line" ? 2 : 1,
      opacity: 1, cornerRadius: type === "ellipse" ? 999 : type === "frame" ? 12 : 8,
      name: type.charAt(0).toUpperCase() + type.slice(1),
      visible: true, locked: false,
      isFrame: type === "frame",
      textContent: type === "text" ? "New Text" : undefined,
      fontSize: type === "text" ? 16 : undefined,
      fontFamily: type === "text" ? "Inter" : undefined,
      fontWeight: type === "text" ? "400" : undefined,
    });
    toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} added`);
  };

  const insertComponent = (name: string) => {
    const preset = componentPresets[name];
    if (!preset || preset.length === 0) return;
    if (preset.length === 1) {
      addElement(preset[0]);
    } else {
      addElements(preset);
    }
    toast.success(`${name} inserted`);
  };

  const currentPage = pages.find((p) => p.id === currentPageId);

  return (
    <aside className="w-60 border-r border-border bg-card flex flex-col shrink-0 select-none">
      {/* Tabs */}
      <div className="flex border-b border-border shrink-0">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 text-[12px] font-medium transition-all duration-150 relative ${
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

      {/* Layers tab */}
      {activeTab === "Layers" && (
        <>
          {/* Search + add */}
          <div className="flex items-center gap-1.5 px-2.5 py-2 border-b border-border/50 shrink-0">
            <div className="flex-1 relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground/40 pointer-events-none" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search layers…"
                className="w-full pl-6 pr-2 h-6 rounded-[5px] bg-secondary/20 border border-border/50 text-[11px] text-foreground/80 placeholder:text-muted-foreground/35 focus:border-primary/35 focus:bg-secondary/30 transition-all duration-100"
              />
            </div>
            <button
              title="Add rectangle"
              onClick={() => handleAddQuick("rectangle")}
              className="w-6 h-6 flex items-center justify-center rounded-[5px] hover:bg-foreground/[0.06] text-muted-foreground/60 hover:text-foreground/80 transition-colors duration-75"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Layer list */}
          <div className="flex-1 overflow-auto py-1">
            {sorted.length === 0 ? (
              <div className="p-4 text-center text-xs text-muted-foreground">
                <p>No layers yet.</p>
                <p className="mt-1 text-[10px]">Draw shapes on the canvas or use Quick Add below.</p>
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
          <div className="border-t border-border/50 p-2.5 shrink-0">
            <p className="text-[9px] font-medium text-muted-foreground/40 uppercase tracking-widest mb-2 px-0.5">Add element</p>
            <div className="grid grid-cols-4 gap-1">
              {[
                { type: "rectangle", icon: Square, label: "Rect" },
                { type: "ellipse",   icon: Circle, label: "Ellipse" },
                { type: "text",      icon: Type,   label: "Text" },
                { type: "frame",     icon: Frame,  label: "Frame" },
              ].map(({ type, icon: Icon, label }) => (
                <button
                  key={type}
                  onClick={() => handleAddQuick(type)}
                  className="flex flex-col items-center gap-1 py-2 rounded-[7px] bg-secondary/15 hover:bg-primary/8 hover:text-primary text-muted-foreground/60 hover:text-primary transition-colors duration-100"
                  title={`Add ${label}`}
                >
                  <Icon className="w-3 h-3" />
                  <span className="text-[9px] font-medium">{label}</span>
                </button>
              ))}
            </div>

            {/* Reorder */}
            {selectedIds.length === 1 && (
              <div className="mt-2 flex gap-1">
                {[
                  { dir: "top",    label: "↑↑" },
                  { dir: "up",     label: "↑"  },
                  { dir: "down",   label: "↓"  },
                  { dir: "bottom", label: "↓↓" },
                ].map(({ dir, label }) => (
                  <button
                    key={dir}
                    onClick={() => dispatch({ type: "REORDER", id: selectedIds[0], direction: dir as any })}
                    className="flex-1 py-1 text-[10px] font-mono rounded-[5px] bg-secondary/15 text-muted-foreground/50 hover:text-foreground/80 hover:bg-secondary/30 transition-colors duration-75"
                    title={dir === "top" ? "Bring to front" : dir === "bottom" ? "Send to back" : dir === "up" ? "Move up" : "Move down"}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Assets tab */}
      {activeTab === "Assets" && (
        <div className="flex-1 overflow-auto">
          <div className="p-3">
            <div className="relative mb-3">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
              <input
                value={assetSearch}
                onChange={(e) => setAssetSearch(e.target.value)}
                placeholder="Search components..."
                className="w-full pl-7 pr-2 h-7 rounded bg-secondary/30 border border-border text-xs text-foreground outline-none focus:border-primary/50 placeholder:text-muted-foreground/50"
              />
            </div>

            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5">UI Components</p>
            <div className="space-y-0.5 mb-4">
              {filteredComponents.map((comp) => (
                <button
                  key={comp}
                  onClick={() => insertComponent(comp)}
                  className="w-full flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-primary/10 text-xs text-muted-foreground hover:text-primary cursor-pointer transition-colors group"
                >
                  <Component className="w-3 h-3 text-primary/60 group-hover:text-primary shrink-0" />
                  <span className="flex-1 text-left">{comp}</span>
                  <Plus className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>

            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">Design Tokens</p>
            <div className="space-y-1.5">
              {[
                { name: "Primary", color: "#8B5CF6" },
                { name: "Accent Cyan", color: "#06B6D4" },
                { name: "Success", color: "#10B981" },
                { name: "Warning", color: "#F59E0B" },
                { name: "Danger", color: "#EF4444" },
                { name: "Background", color: "#FAFAFA" },
                { name: "Surface", color: "#F0F0F5" },
                { name: "Border", color: "rgba(0,0,0,0.1)" },
                { name: "Text Primary", color: "#1A1A2E" },
                { name: "Text Muted", color: "#6B7280" },
              ].map(({ name, color }) => (
                <button
                  key={name}
                  onClick={() => {
                    // Apply color to selected element
                    const selectedId = state.selectedIds[0];
                    if (selectedId) {
                      dispatch({ type: "UPDATE_ELEMENT", id: selectedId, updates: { fill: color } });
                      toast.success(`Applied ${name} to selection`);
                    } else {
                      navigator.clipboard.writeText(color);
                      toast.success(`${name} copied: ${color}`);
                    }
                  }}
                  className="w-full flex items-center gap-2 px-1 py-1 rounded hover:bg-secondary/30 transition-colors group"
                  title={`Click to apply to selected, or copy color value`}
                >
                  <div
                    className="w-5 h-5 rounded-md shrink-0 border border-border"
                    style={{ background: color }}
                  />
                  <span className="flex-1 text-xs text-muted-foreground group-hover:text-foreground transition-colors text-left">{name}</span>
                  <span className="text-[9px] font-mono text-muted-foreground/50">{color.slice(0, 7)}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Pages tab */}
      {activeTab === "Pages" && (
        <div className="flex-1 overflow-auto p-3 space-y-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Pages</span>
            <button
              onClick={() => {
                const name = `Page ${pages.length + 1}`;
                addPage(name);
                toast.success(`"${name}" added`);
              }}
              className="p-0.5 rounded hover:bg-secondary/50 text-muted-foreground hover:text-foreground"
              title="Add page"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
          {pages.map((page, i) => (
            <div
              key={page.id}
              className={`group flex items-center gap-2 px-2 py-2 rounded-lg text-xs cursor-pointer transition-colors ${
                page.id === currentPageId
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
              }`}
              onClick={() => switchPage(page.id)}
            >
              <Frame className="w-3 h-3 shrink-0" />
              {renamingPageId === page.id ? (
                <input
                  value={renameVal}
                  onChange={(e) => setRenameVal(e.target.value)}
                  onBlur={() => {
                    if (renameVal.trim()) renamePage(page.id, renameVal.trim());
                    setRenamingPageId(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      if (renameVal.trim()) renamePage(page.id, renameVal.trim());
                      setRenamingPageId(null);
                    }
                    if (e.key === "Escape") setRenamingPageId(null);
                  }}
                  className="flex-1 bg-secondary/50 rounded px-1 text-xs outline-none border border-primary/40"
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span className="flex-1 truncate">{page.name}</span>
              )}
              <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity">
                <button
                  title="Rename page"
                  onClick={(e) => {
                    e.stopPropagation();
                    setRenamingPageId(page.id);
                    setRenameVal(page.name);
                  }}
                  className="p-0.5 rounded hover:bg-secondary/60"
                >
                  <Edit3 className="w-2.5 h-2.5" />
                </button>
                {pages.length > 1 && (
                  <button
                    title="Delete page"
                    onClick={(e) => {
                      e.stopPropagation();
                      removePage(page.id);
                      toast.success(`"${page.name}" deleted`);
                    }}
                    className="p-0.5 rounded hover:bg-destructive/20 hover:text-destructive"
                  >
                    <Trash2 className="w-2.5 h-2.5" />
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Page element count info */}
          {currentPage && (
            <div className="mt-4 p-2 rounded-lg bg-secondary/20 border border-border">
              <p className="text-[10px] text-muted-foreground">
                <span className="text-primary font-medium">{elements.length}</span> elements on this page
              </p>
            </div>
          )}
        </div>
      )}
    </aside>
  );
}
