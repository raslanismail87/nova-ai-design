import { Wand2, Copy, Layout, Type, Palette, Smartphone, Trash2, Sparkles, ArrowUpDown, Shuffle } from "lucide-react";

interface Props {
  x: number;
  y: number;
  layerName: string;
  onAction: (action: string) => void;
  onClose: () => void;
}

const primaryActions = [
  { icon: Sparkles,    label: "Ask Nova AI",         kbd: "⌘I"  },
  { icon: Wand2,       label: "Restyle element",      kbd: null  },
  { icon: Shuffle,     label: "Create 3 variations",  kbd: null  },
];

const editActions = [
  { icon: Layout,      label: "Improve layout",       kbd: null  },
  { icon: Type,        label: "Rewrite copy",          kbd: null  },
  { icon: Palette,     label: "Refine colors",         kbd: null  },
  { icon: ArrowUpDown, label: "Fix spacing",           kbd: null  },
  { icon: Smartphone,  label: "Make responsive",       kbd: null  },
];

const ContextAIMenu = ({ x, y, layerName, onAction, onClose }: Props) => {
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />

      <div
        className="fixed z-50 animate-scale-in"
        style={{ left: x, top: y }}
      >
        <div className="w-[200px] nova-glass rounded-[10px] py-1.5 overflow-hidden">
          {/* Layer header */}
          <div className="px-3 pt-1 pb-2.5 border-b border-border/50">
            <p className="text-[10px] text-muted-foreground/55 mb-0.5 uppercase tracking-wider font-medium">Element</p>
            <p className="text-[13px] font-medium text-foreground/85 truncate leading-tight">{layerName}</p>
          </div>

          {/* Primary AI actions */}
          <div className="py-1">
            {primaryActions.map((action, i) => (
              <button
                key={action.label}
                onClick={() => { onAction(action.label); onClose(); }}
                className={`w-full flex items-center gap-2.5 px-3 py-[7px] text-[13px] transition-colors duration-75 ${
                  i === 0
                    ? "text-primary/90 hover:bg-primary/8 hover:text-primary"
                    : "text-foreground/70 hover:bg-foreground/[0.05] hover:text-foreground/90"
                }`}
              >
                <action.icon className={`w-3.5 h-3.5 shrink-0 ${i === 0 ? "text-primary/80" : "text-muted-foreground/60"}`} />
                <span className="flex-1 text-left">{action.label}</span>
                {action.kbd && (
                  <span className="text-[10px] font-mono text-muted-foreground/40 ml-auto">{action.kbd}</span>
                )}
              </button>
            ))}
          </div>

          {/* Edit actions */}
          <div className="border-t border-white/6 py-1">
            {editActions.map((action) => (
              <button
                key={action.label}
                onClick={() => { onAction(action.label); onClose(); }}
                className="w-full flex items-center gap-2.5 px-3 py-[7px] text-[13px] text-foreground/60 hover:bg-white/5 hover:text-foreground/85 transition-colors duration-75"
              >
                <action.icon className="w-3.5 h-3.5 shrink-0 text-muted-foreground/50" />
                <span className="flex-1 text-left">{action.label}</span>
              </button>
            ))}
          </div>

          {/* Destructive */}
          <div className="border-t border-white/6 py-1">
            <button
              onClick={() => { onAction("delete"); onClose(); }}
              className="w-full flex items-center gap-2.5 px-3 py-[7px] text-[13px] text-destructive/70 hover:text-destructive hover:bg-destructive/6 transition-colors duration-75"
            >
              <Trash2 className="w-3.5 h-3.5 shrink-0" />
              Delete
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContextAIMenu;
