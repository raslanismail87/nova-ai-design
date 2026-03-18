import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, Maximize } from "lucide-react";

interface Props {
  zoom: number;
  onZoomChange: (z: number) => void;
  selectedLayer: string | null;
}

const EditorCanvas = ({ zoom, onZoomChange, selectedLayer }: Props) => {
  return (
    <div className="flex-1 relative overflow-hidden bg-background">
      {/* Dot grid background */}
      <div className="absolute inset-0 nova-dot-grid" />

      {/* Rulers */}
      <div className="absolute top-0 left-8 right-0 h-6 bg-card/80 border-b border-border flex items-end px-2 z-10">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="flex-1 border-l border-border/30 relative">
            <span className="absolute -top-0.5 left-1 text-[8px] text-muted-foreground/50 font-mono">{i * 100}</span>
          </div>
        ))}
      </div>
      <div className="absolute top-6 left-0 bottom-0 w-6 bg-card/80 border-r border-border z-10">
        {Array.from({ length: 15 }).map((_, i) => (
          <div key={i} className="h-16 border-t border-border/30 relative">
            <span className="absolute top-1 left-1 text-[8px] text-muted-foreground/50 font-mono rotate-0">{i * 100}</span>
          </div>
        ))}
      </div>

      {/* Canvas content area */}
      <div className="absolute inset-0 top-6 left-6 overflow-auto flex items-center justify-center"
        style={{ transform: `scale(${zoom / 100})`, transformOrigin: "center center" }}
      >
        {/* Artboard */}
        <div className="w-[1280px] h-[900px] bg-card rounded-lg shadow-2xl shadow-black/20 border border-border relative">
          {/* Frame label */}
          <div className="absolute -top-6 left-0 text-[11px] text-primary font-medium">
            Landing Page — 1280 × 900
          </div>

          {/* Mock landing page content */}
          <div className="p-0 h-full flex flex-col">
            {/* Nav bar */}
            <div className={`flex items-center justify-between px-8 py-4 border-b border-border ${selectedLayer === "nav-bar" ? "ring-2 ring-primary ring-offset-0" : ""}`}>
              <div className={`flex items-center gap-2 ${selectedLayer === "logo" ? "ring-2 ring-primary rounded p-1" : ""}`}>
                <div className="w-6 h-6 rounded bg-primary/30" />
                <div className="w-16 h-3 rounded bg-foreground/20" />
              </div>
              <div className="flex items-center gap-6">
                {["Features", "Pricing", "About"].map((link, i) => (
                  <div key={link} className={`w-14 h-2.5 rounded bg-foreground/15 ${selectedLayer === `link-${i + 1}` ? "ring-2 ring-primary" : ""}`} />
                ))}
                <div className={`w-20 h-8 rounded-lg nova-gradient ${selectedLayer === "cta-btn" ? "ring-2 ring-primary ring-offset-2 ring-offset-card" : ""}`} />
              </div>
            </div>

            {/* Hero */}
            <div className={`flex-1 flex items-center px-16 gap-12 ${selectedLayer === "hero-content" ? "ring-2 ring-primary ring-offset-0 m-2 rounded-lg" : ""}`}>
              <div className="flex-1 space-y-5">
                <div className={`space-y-2 ${selectedLayer === "headline" ? "ring-2 ring-primary rounded p-1" : ""}`}>
                  <div className="w-80 h-8 rounded bg-foreground/20" />
                  <div className="w-64 h-8 rounded bg-foreground/15" />
                </div>
                <div className={`space-y-1.5 ${selectedLayer === "subhead" ? "ring-2 ring-primary rounded p-1" : ""}`}>
                  <div className="w-72 h-3 rounded bg-foreground/10" />
                  <div className="w-56 h-3 rounded bg-foreground/10" />
                </div>
                <div className={`w-36 h-11 rounded-xl nova-gradient ${selectedLayer === "hero-cta" ? "ring-2 ring-primary ring-offset-2 ring-offset-card" : ""}`} />
              </div>
              <div className={`w-96 h-64 rounded-2xl bg-secondary/50 border border-border ${selectedLayer === "hero-img" ? "ring-2 ring-primary" : ""}`}>
                <div className="w-full h-full nova-dot-grid rounded-2xl flex items-center justify-center">
                  <div className="text-xs text-muted-foreground">Hero Image</div>
                </div>
              </div>
            </div>

            {/* Features section */}
            <div className={`px-16 py-12 border-t border-border ${selectedLayer === "frame-features" ? "ring-2 ring-primary ring-offset-0" : ""}`}>
              <div className={`w-48 h-5 rounded bg-foreground/15 mx-auto mb-8 ${selectedLayer === "section-title" ? "ring-2 ring-primary" : ""}`} />
              <div className="grid grid-cols-3 gap-6">
                {[1, 2, 3].map((n) => (
                  <div key={n} className={`p-6 rounded-xl bg-secondary/30 border border-border space-y-3 ${selectedLayer === `card-${n}` ? "ring-2 ring-primary" : ""}`}>
                    <div className="w-10 h-10 rounded-lg bg-primary/20" />
                    <div className="w-24 h-3 rounded bg-foreground/15" />
                    <div className="space-y-1.5">
                      <div className="w-full h-2 rounded bg-foreground/8" />
                      <div className="w-3/4 h-2 rounded bg-foreground/8" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Selection handles (if headline selected) */}
          {selectedLayer === "headline" && (
            <>
              <div className="absolute top-[140px] left-[62px] w-2 h-2 rounded-full bg-primary border-2 border-card" />
              <div className="absolute top-[140px] left-[442px] w-2 h-2 rounded-full bg-primary border-2 border-card" />
              <div className="absolute top-[180px] left-[62px] w-2 h-2 rounded-full bg-primary border-2 border-card" />
              <div className="absolute top-[180px] left-[442px] w-2 h-2 rounded-full bg-primary border-2 border-card" />
            </>
          )}
        </div>
      </div>

      {/* Zoom controls */}
      <div className="absolute bottom-4 right-4 flex items-center gap-1 nova-glass rounded-lg p-1 z-20">
        <button onClick={() => onZoomChange(Math.max(25, zoom - 25))} className="p-1.5 rounded hover:bg-secondary/50 transition-colors">
          <ZoomOut className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
        <span className="text-xs font-mono text-muted-foreground px-2 min-w-[3rem] text-center">{zoom}%</span>
        <button onClick={() => onZoomChange(Math.min(400, zoom + 25))} className="p-1.5 rounded hover:bg-secondary/50 transition-colors">
          <ZoomIn className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
        <div className="w-px h-4 bg-border mx-0.5" />
        <button onClick={() => onZoomChange(100)} className="p-1.5 rounded hover:bg-secondary/50 transition-colors">
          <Maximize className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
};

export default EditorCanvas;
