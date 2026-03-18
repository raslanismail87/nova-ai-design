import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { ChevronDown } from "lucide-react";

interface Props {
  activeTab: "design" | "prototype" | "inspect";
  onTabChange: (tab: "design" | "prototype" | "inspect") => void;
  selectedLayer: string | null;
}

const PropertyRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center gap-2">
    <span className="text-[10px] text-muted-foreground w-5 font-mono">{label}</span>
    <Input
      value={value}
      readOnly
      className="h-7 text-xs font-mono bg-secondary/30 border-border px-2"
    />
  </div>
);

const SectionHeader = ({ title, open = true }: { title: string; open?: boolean }) => (
  <button className="w-full flex items-center justify-between py-2 text-xs font-medium text-foreground">
    {title}
    <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform ${open ? "" : "-rotate-90"}`} />
  </button>
);

const EditorRightSidebar = ({ activeTab, onTabChange, selectedLayer }: Props) => {
  const tabs = ["design", "prototype", "inspect"] as const;

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

      <div className="flex-1 overflow-auto p-4 space-y-4">
        {activeTab === "design" && (
          <>
            {/* Position & Size */}
            <div>
              <SectionHeader title="Position & Size" />
              <div className="grid grid-cols-2 gap-2">
                <PropertyRow label="X" value="64" />
                <PropertyRow label="Y" value="128" />
                <PropertyRow label="W" value="380" />
                <PropertyRow label="H" value="48" />
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <PropertyRow label="R" value="0°" />
                <PropertyRow label="" value="" />
              </div>
            </div>

            {/* Spacing */}
            <div>
              <SectionHeader title="Auto Layout" />
              <div className="grid grid-cols-2 gap-2">
                <PropertyRow label="↔" value="16" />
                <PropertyRow label="↕" value="12" />
              </div>
              <div className="grid grid-cols-4 gap-2 mt-2">
                <PropertyRow label="T" value="24" />
                <PropertyRow label="R" value="32" />
                <PropertyRow label="B" value="24" />
                <PropertyRow label="L" value="32" />
              </div>
            </div>

            {/* Typography */}
            <div>
              <SectionHeader title="Typography" />
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-7 px-2 rounded-md bg-secondary/30 border border-border flex items-center text-xs">
                    Inter
                    <ChevronDown className="w-3 h-3 ml-auto text-muted-foreground" />
                  </div>
                  <Input value="Semi Bold" readOnly className="h-7 w-24 text-xs font-mono bg-secondary/30 border-border px-2" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <PropertyRow label="Sz" value="48" />
                  <PropertyRow label="Ln" value="56" />
                  <PropertyRow label="Lt" value="-0.02" />
                  <PropertyRow label="Pg" value="0" />
                </div>
              </div>
            </div>

            {/* Fill */}
            <div>
              <SectionHeader title="Fill" />
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-foreground border border-border shrink-0" />
                <Input value="#F2F2F2" readOnly className="h-7 text-xs font-mono bg-secondary/30 border-border px-2" />
                <Input value="100%" readOnly className="h-7 w-14 text-xs font-mono bg-secondary/30 border-border px-2" />
              </div>
            </div>

            {/* Stroke */}
            <div>
              <SectionHeader title="Stroke" open={false} />
            </div>

            {/* Effects */}
            <div>
              <SectionHeader title="Effects" />
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="flex-1">Drop Shadow</span>
                  <Slider defaultValue={[20]} max={100} className="w-20" />
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="flex-1">Blur</span>
                  <Slider defaultValue={[0]} max={50} className="w-20" />
                </div>
              </div>
            </div>

            {/* Corner Radius */}
            <div>
              <SectionHeader title="Corner Radius" />
              <div className="grid grid-cols-4 gap-2">
                <PropertyRow label="TL" value="12" />
                <PropertyRow label="TR" value="12" />
                <PropertyRow label="BL" value="12" />
                <PropertyRow label="BR" value="12" />
              </div>
            </div>

            {/* Export */}
            <div>
              <SectionHeader title="Export" open={false} />
            </div>
          </>
        )}

        {activeTab === "prototype" && (
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground">Select a layer and add interactions</p>
            <div className="p-4 rounded-xl border border-dashed border-border text-center">
              <p className="text-xs text-muted-foreground">No interactions yet</p>
              <button className="text-xs text-primary mt-2 hover:underline">+ Add interaction</button>
            </div>
          </div>
        )}

        {activeTab === "inspect" && (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground mb-3">CSS</p>
            <div className="rounded-lg bg-secondary/30 border border-border p-3 font-mono text-[11px] text-muted-foreground space-y-1">
              <p><span className="text-primary">width</span>: 380px;</p>
              <p><span className="text-primary">height</span>: 48px;</p>
              <p><span className="text-primary">font-size</span>: 48px;</p>
              <p><span className="text-primary">font-weight</span>: 600;</p>
              <p><span className="text-primary">line-height</span>: 56px;</p>
              <p><span className="text-primary">letter-spacing</span>: -0.02em;</p>
              <p><span className="text-primary">color</span>: #F2F2F2;</p>
              <p><span className="text-primary">border-radius</span>: 12px;</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default EditorRightSidebar;
