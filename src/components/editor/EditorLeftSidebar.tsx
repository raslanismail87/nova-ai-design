import { useState } from "react";
import { ChevronRight, ChevronDown, Eye, EyeOff, Lock, Unlock, Frame, Type, Image, Layers, Component, FolderOpen } from "lucide-react";
import { sampleLayers } from "@/data/mockData";

interface LayerItem {
  id: string;
  name: string;
  type: "frame" | "group" | "component" | "text" | "image";
  visible: boolean;
  locked: boolean;
  children?: LayerItem[];
}

interface Props {
  selectedLayer: string | null;
  onSelectLayer: (id: string) => void;
}

const typeIcons: Record<string, any> = {
  frame: Frame, group: FolderOpen, component: Component, text: Type, image: Image,
};

const LayerRow = ({
  layer, depth, selectedLayer, onSelectLayer,
}: {
  layer: LayerItem; depth: number; selectedLayer: string | null; onSelectLayer: (id: string) => void;
}) => {
  const [expanded, setExpanded] = useState(depth < 2);
  const Icon = typeIcons[layer.type] || Layers;
  const hasChildren = layer.children && layer.children.length > 0;
  const isSelected = selectedLayer === layer.id;

  return (
    <>
      <button
        onClick={() => onSelectLayer(layer.id)}
        className={`group w-full flex items-center gap-1 px-2 py-1 text-xs transition-colors ${
          isSelected ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
        }`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        {hasChildren ? (
          <button onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }} className="shrink-0">
            {expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          </button>
        ) : (
          <span className="w-3" />
        )}
        <Icon className="w-3 h-3 shrink-0" />
        <span className="truncate flex-1 text-left">{layer.name}</span>
        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity">
          {layer.visible ? (
            <Eye className="w-3 h-3 text-muted-foreground" />
          ) : (
            <EyeOff className="w-3 h-3 text-muted-foreground" />
          )}
          {layer.locked ? (
            <Lock className="w-3 h-3 text-muted-foreground" />
          ) : (
            <Unlock className="w-3 h-3 text-muted-foreground" />
          )}
        </div>
      </button>
      {hasChildren && expanded && layer.children!.map((child) => (
        <LayerRow key={child.id} layer={child} depth={depth + 1} selectedLayer={selectedLayer} onSelectLayer={onSelectLayer} />
      ))}
    </>
  );
};

const tabs = ["Layers", "Assets", "Pages"];

const EditorLeftSidebar = ({ selectedLayer, onSelectLayer }: Props) => {
  const [activeTab, setActiveTab] = useState("Layers");

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

      {/* Layer tree */}
      <div className="flex-1 overflow-auto py-1">
        {activeTab === "Layers" && sampleLayers.map((layer) => (
          <LayerRow key={layer.id} layer={layer} depth={0} selectedLayer={selectedLayer} onSelectLayer={onSelectLayer} />
        ))}
        {activeTab === "Assets" && (
          <div className="p-4 space-y-3">
            <p className="text-xs text-muted-foreground">Components</p>
            {["Button", "Card", "Input", "Avatar", "Badge", "Modal"].map((comp) => (
              <div key={comp} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-secondary/50 text-xs text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
                <Component className="w-3 h-3 text-primary" />
                {comp}
              </div>
            ))}
          </div>
        )}
        {activeTab === "Pages" && (
          <div className="p-4 space-y-1">
            {["Landing Page", "Dashboard", "Settings", "Profile", "Onboarding"].map((page, i) => (
              <div key={page} className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                i === 0 ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
              }`}>
                <Frame className="w-3 h-3" />
                {page}
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
};

export default EditorLeftSidebar;
