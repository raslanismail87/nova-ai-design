import { Wand2, Copy, Layout, Type, Palette, Smartphone, Trash2, Sparkles, ArrowUpDown } from "lucide-react";

interface Props {
  x: number;
  y: number;
  layerName: string;
  onAction: (action: string) => void;
  onClose: () => void;
}

const actions = [
  { icon: Sparkles, label: "Ask Nova AI", primary: true },
  { icon: Wand2, label: "Restyle element" },
  { icon: Copy, label: "Create 3 variations" },
  { icon: Layout, label: "Improve layout" },
  { icon: Type, label: "Rewrite copy" },
  { icon: Palette, label: "Refine colors" },
  { icon: ArrowUpDown, label: "Fix spacing" },
  { icon: Smartphone, label: "Make responsive" },
];

const ContextAIMenu = ({ x, y, layerName, onAction, onClose }: Props) => {
  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Menu */}
      <div
        className="absolute z-50 animate-fade-in"
        style={{ left: x, top: y }}
      >
        <div className="w-52 nova-glass rounded-xl shadow-2xl shadow-black/40 py-1.5 overflow-hidden">
          {/* Header */}
          <div className="px-3 py-1.5 border-b border-border/30 mb-1">
            <span className="text-[10px] text-muted-foreground">AI Actions for</span>
            <p className="text-xs font-medium text-foreground truncate">{layerName}</p>
          </div>

          {actions.map((action) => (
            <button
              key={action.label}
              onClick={() => { onAction(action.label); onClose(); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs transition-colors ${
                action.primary
                  ? "text-primary hover:bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              }`}
            >
              <action.icon className={`w-3.5 h-3.5 ${action.primary ? "text-primary" : ""}`} />
              {action.label}
            </button>
          ))}

          <div className="border-t border-border/30 mt-1 pt-1">
            <button
              onClick={() => { onAction("delete"); onClose(); }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-destructive/70 hover:text-destructive hover:bg-destructive/5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete element
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContextAIMenu;
