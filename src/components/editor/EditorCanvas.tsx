import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, Maximize } from "lucide-react";
import CanvasAIBar from "./CanvasAIBar";
import ContextAIMenu from "./ContextAIMenu";

interface Props {
  zoom: number;
  onZoomChange: (z: number) => void;
  selectedLayer: string | null;
  onSelectLayer?: (id: string) => void;
  onOpenAI?: () => void;
}

const EditorCanvas = ({ zoom, onZoomChange, selectedLayer, onSelectLayer, onOpenAI }: Props) => {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; layer: string } | null>(null);

  const handleContextMenu = (e: React.MouseEvent, layerId: string, layerName: string) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY, layer: layerName });
  };

  const handleCanvasPrompt = (prompt: string) => {
    onOpenAI?.();
  };

  const handleLayerClick = (layerId: string) => {
    onSelectLayer?.(layerId);
  };

  return (
    <div className="flex-1 relative overflow-hidden bg-background">
      {/* Dot grid background */}
      <div className="absolute inset-0 nova-dot-grid" />

      {/* Rulers */}
      <div className="absolute top-0 left-8 right-0 h-6 bg-card/80 backdrop-blur-sm border-b border-border flex items-end px-2 z-10">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="flex-1 border-l border-border/20 relative">
            {i % 2 === 0 && (
              <span className="absolute -top-0.5 left-1 text-[8px] text-muted-foreground/40 font-mono select-none">{i * 100}</span>
            )}
          </div>
        ))}
      </div>
      <div className="absolute top-6 left-0 bottom-0 w-6 bg-card/80 backdrop-blur-sm border-r border-border z-10">
        {Array.from({ length: 15 }).map((_, i) => (
          <div key={i} className="h-16 border-t border-border/20 relative">
            {i % 2 === 0 && (
              <span className="absolute top-1 left-0.5 text-[7px] text-muted-foreground/40 font-mono select-none">{i * 100}</span>
            )}
          </div>
        ))}
      </div>

      {/* Canvas content area */}
      <div
        className="absolute inset-0 top-6 left-6 overflow-auto flex items-center justify-center"
        style={{ transform: `scale(${zoom / 100})`, transformOrigin: "center center" }}
      >
        {/* Artboard */}
        <div className="w-[1280px] h-[900px] bg-card rounded-xl shadow-2xl shadow-black/30 border border-border/50 relative">
          {/* Frame label */}
          <div className="absolute -top-7 left-0 flex items-center gap-2">
            <span className="text-[11px] text-primary font-medium">Landing Page</span>
            <span className="text-[10px] text-muted-foreground font-mono">1280 × 900</span>
          </div>

          {/* Mock landing page content */}
          <div className="p-0 h-full flex flex-col">
            {/* Nav bar */}
            <div
              onClick={() => handleLayerClick("nav-bar")}
              onContextMenu={(e) => handleContextMenu(e, "nav-bar", "Navigation")}
              className={`flex items-center justify-between px-8 py-4 border-b border-border/50 cursor-pointer transition-all hover:bg-primary/[0.02] ${
                selectedLayer === "nav-bar" ? "ring-2 ring-primary/60 ring-inset bg-primary/[0.03]" : ""
              }`}
            >
              <div
                onClick={(e) => { e.stopPropagation(); handleLayerClick("logo"); }}
                className={`flex items-center gap-2 transition-all ${selectedLayer === "logo" ? "ring-2 ring-primary rounded-md p-1 -m-1" : ""}`}
              >
                <div className="w-7 h-7 rounded-lg nova-gradient" />
                <div className="w-20 h-3.5 rounded bg-foreground/20" />
              </div>
              <div className="flex items-center gap-6">
                {["Features", "Pricing", "About"].map((link, i) => (
                  <div
                    key={link}
                    onClick={(e) => { e.stopPropagation(); handleLayerClick(`link-${i + 1}`); }}
                    className={`w-14 h-2.5 rounded bg-foreground/12 cursor-pointer hover:bg-foreground/20 transition-colors ${
                      selectedLayer === `link-${i + 1}` ? "ring-2 ring-primary" : ""
                    }`}
                  />
                ))}
                <div
                  onClick={(e) => { e.stopPropagation(); handleLayerClick("cta-btn"); }}
                  className={`w-24 h-9 rounded-xl nova-gradient cursor-pointer hover:opacity-90 transition-all ${
                    selectedLayer === "cta-btn" ? "ring-2 ring-primary ring-offset-2 ring-offset-card" : ""
                  }`}
                />
              </div>
            </div>

            {/* Hero */}
            <div
              onClick={() => handleLayerClick("hero-content")}
              onContextMenu={(e) => handleContextMenu(e, "hero-content", "Hero Content")}
              className={`flex-1 flex items-center px-16 gap-16 cursor-pointer transition-all hover:bg-primary/[0.02] ${
                selectedLayer === "hero-content" ? "ring-2 ring-primary/40 ring-inset m-1 rounded-xl bg-primary/[0.02]" : ""
              }`}
            >
              <div className="flex-1 space-y-6">
                <div
                  onClick={(e) => { e.stopPropagation(); handleLayerClick("headline"); }}
                  onContextMenu={(e) => handleContextMenu(e, "headline", "Headline")}
                  className={`space-y-2.5 cursor-pointer transition-all ${selectedLayer === "headline" ? "ring-2 ring-primary rounded-lg p-2 -m-2 bg-primary/[0.03]" : ""}`}
                >
                  <div className="w-[340px] h-9 rounded bg-foreground/18" />
                  <div className="w-[280px] h-9 rounded bg-foreground/12" />
                </div>
                <div
                  onClick={(e) => { e.stopPropagation(); handleLayerClick("subhead"); }}
                  className={`space-y-2 cursor-pointer transition-all ${selectedLayer === "subhead" ? "ring-2 ring-primary rounded-lg p-2 -m-2" : ""}`}
                >
                  <div className="w-[300px] h-3 rounded bg-foreground/8" />
                  <div className="w-[240px] h-3 rounded bg-foreground/8" />
                </div>
                <div className="flex items-center gap-3">
                  <div
                    onClick={(e) => { e.stopPropagation(); handleLayerClick("hero-cta"); }}
                    className={`w-40 h-12 rounded-xl nova-gradient cursor-pointer hover:opacity-90 shadow-lg shadow-primary/20 transition-all ${
                      selectedLayer === "hero-cta" ? "ring-2 ring-primary ring-offset-2 ring-offset-card" : ""
                    }`}
                  />
                  <div className="w-32 h-12 rounded-xl border border-border/50 bg-secondary/20 cursor-pointer hover:bg-secondary/30 transition-colors" />
                </div>
              </div>
              <div
                onClick={(e) => { e.stopPropagation(); handleLayerClick("hero-img"); }}
                onContextMenu={(e) => handleContextMenu(e, "hero-img", "Hero Image")}
                className={`w-[420px] h-[280px] rounded-2xl bg-secondary/30 border border-border/50 cursor-pointer transition-all hover:border-primary/20 ${
                  selectedLayer === "hero-img" ? "ring-2 ring-primary shadow-lg shadow-primary/10" : ""
                }`}
              >
                <div className="w-full h-full nova-dot-grid rounded-2xl flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 mx-auto rounded-xl bg-primary/10 flex items-center justify-center">
                      <div className="w-6 h-6 rounded-md bg-primary/20" />
                    </div>
                    <div className="text-[10px] text-muted-foreground">Hero Image</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Features section */}
            <div
              onClick={() => handleLayerClick("frame-features")}
              onContextMenu={(e) => handleContextMenu(e, "frame-features", "Features Section")}
              className={`px-16 py-14 border-t border-border/50 cursor-pointer transition-all hover:bg-primary/[0.02] ${
                selectedLayer === "frame-features" ? "ring-2 ring-primary/40 ring-inset bg-primary/[0.02]" : ""
              }`}
            >
              <div
                onClick={(e) => { e.stopPropagation(); handleLayerClick("section-title"); }}
                className={`w-56 h-5 rounded bg-foreground/12 mx-auto mb-10 cursor-pointer transition-all ${
                  selectedLayer === "section-title" ? "ring-2 ring-primary" : ""
                }`}
              />
              <div className="grid grid-cols-3 gap-6">
                {[1, 2, 3].map((n) => (
                  <div
                    key={n}
                    onClick={(e) => { e.stopPropagation(); handleLayerClick(`card-${n}`); }}
                    onContextMenu={(e) => handleContextMenu(e, `card-${n}`, `Feature Card ${n}`)}
                    className={`p-6 rounded-xl bg-secondary/20 border border-border/30 space-y-3 cursor-pointer transition-all hover:border-primary/15 hover:bg-primary/[0.03] ${
                      selectedLayer === `card-${n}` ? "ring-2 ring-primary border-primary/30 bg-primary/[0.03] shadow-lg shadow-primary/5" : ""
                    }`}
                  >
                    <div className="w-11 h-11 rounded-xl bg-primary/15 flex items-center justify-center">
                      <div className="w-5 h-5 rounded-md bg-primary/30" />
                    </div>
                    <div className="w-28 h-3.5 rounded bg-foreground/15" />
                    <div className="space-y-1.5">
                      <div className="w-full h-2 rounded bg-foreground/6" />
                      <div className="w-4/5 h-2 rounded bg-foreground/6" />
                      <div className="w-3/5 h-2 rounded bg-foreground/6" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Selection handles */}
          {selectedLayer && (
            <>
              {/* Smart guide lines */}
              {selectedLayer === "headline" && (
                <>
                  <div className="absolute left-[62px] top-[140px] right-[62px] h-px bg-primary/30" style={{ pointerEvents: "none" }} />
                  <div className="absolute left-[62px] top-0 w-px h-full bg-primary/10" style={{ pointerEvents: "none" }} />
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Canvas AI command bar */}
      <CanvasAIBar selectedLayer={selectedLayer} onSendPrompt={handleCanvasPrompt} />

      {/* Context AI menu */}
      {contextMenu && (
        <ContextAIMenu
          x={contextMenu.x}
          y={contextMenu.y}
          layerName={contextMenu.layer}
          onAction={(action) => { onOpenAI?.(); }}
          onClose={() => setContextMenu(null)}
        />
      )}

      {/* Zoom controls */}
      <div className="absolute bottom-4 right-4 flex items-center gap-1 nova-glass rounded-xl p-1 z-20">
        <button onClick={() => onZoomChange(Math.max(25, zoom - 25))} className="p-1.5 rounded-lg hover:bg-secondary/50 transition-colors">
          <ZoomOut className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
        <span className="text-[10px] font-mono text-muted-foreground px-2 min-w-[3rem] text-center">{zoom}%</span>
        <button onClick={() => onZoomChange(Math.min(400, zoom + 25))} className="p-1.5 rounded-lg hover:bg-secondary/50 transition-colors">
          <ZoomIn className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
        <div className="w-px h-4 bg-border mx-0.5" />
        <button onClick={() => onZoomChange(100)} className="p-1.5 rounded-lg hover:bg-secondary/50 transition-colors">
          <Maximize className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
};

export default EditorCanvas;
