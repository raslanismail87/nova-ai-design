import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, X, ArrowRight, ArrowLeft, Wand2, Zap, Layers, Check } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  onGenerate: (prompt?: string) => void;
}

const projectTypes = [
  { label: "SaaS Dashboard", emoji: "📊" },
  { label: "Mobile App", emoji: "📱" },
  { label: "Landing Page", emoji: "🚀" },
  { label: "E-commerce", emoji: "🛒" },
  { label: "Portfolio", emoji: "🎨" },
  { label: "Admin Panel", emoji: "⚙️" },
  { label: "Social App", emoji: "💬" },
  { label: "Fintech App", emoji: "💳" },
];

const styleDirections = [
  {
    label: "Minimalist",
    desc: "Clean lines, generous whitespace, subtle depth",
    colors: ["#f8f9fa", "#e9ecef", "#6c63ff", "#2d3436"],
  },
  {
    label: "Bold & Vibrant",
    desc: "High contrast, saturated colors, strong hierarchy",
    colors: ["#0f0f0f", "#ff6b6b", "#ffd93d", "#6bcb77"],
  },
  {
    label: "Glass Premium",
    desc: "Frosted panels, soft gradients, elegant layering",
    colors: ["#1a1a2e", "#7c3aed", "#06d6a0", "#f8f9fa"],
  },
];

const AIGenerationModal = ({ open, onClose, onGenerate }: Props) => {
  const [step, setStep] = useState(1);
  const [prompt, setPrompt] = useState("");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<number | null>(null);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  if (!open) return null;

  const handleGenerate = () => {
    setGenerating(true);
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            onGenerate(prompt || selectedType || undefined);
            onClose();
          }, 500);
          return 100;
        }
        return p + Math.random() * 15;
      });
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-2xl" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-2xl mx-4 animate-fade-in">
        {/* Glow effect */}
        <div className="absolute -inset-1 rounded-3xl nova-gradient opacity-20 blur-xl" />

        <div className="relative rounded-2xl border border-border/50 bg-card shadow-2xl shadow-black/50 overflow-hidden noise-overlay border-shine">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl nova-gradient flex items-center justify-center shadow-lg shadow-primary/20">
                <Sparkles className="w-4 h-4 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-sm font-semibold">Generate with Nova AI</h2>
                <p className="text-[10px] text-muted-foreground">Step {step} of 3</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Progress bar */}
          <div className="h-0.5 bg-secondary">
            <div
              className="h-full nova-gradient transition-all duration-500"
              style={{ width: generating ? `${Math.min(progress, 100)}%` : `${(step / 3) * 100}%` }}
            />
          </div>

          {/* Content */}
          <div className="p-6 min-h-[400px]">
            {/* Step 1: What to build */}
            {step === 1 && !generating && (
              <div className="space-y-6 animate-fade-in">
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-semibold">What are we building?</h3>
                  <p className="text-sm text-muted-foreground">Describe your project or pick a starting point</p>
                </div>

                <div className="relative">
                  <Wand2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                  <input
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="A fintech dashboard with analytics, user management, and transaction history..."
                    className="w-full h-12 pl-11 pr-4 rounded-xl bg-secondary/30 border border-border text-sm outline-none focus:border-primary/40 focus:shadow-[0_0_0_3px_hsl(263_70%_58%/0.08)] transition-all placeholder:text-muted-foreground/50"
                  />
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-3">Or start with a template:</p>
                  <div className="grid grid-cols-4 gap-2">
                    {projectTypes.map((type) => (
                      <button
                        key={type.label}
                        onClick={() => { setSelectedType(type.label); setPrompt(type.label); }}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${
                          selectedType === type.label
                            ? "border-primary/40 bg-primary/10 shadow-md shadow-primary/5"
                            : "border-border/50 bg-secondary/20 hover:border-primary/20 hover:bg-primary/5"
                        }`}
                      >
                        <span className="text-lg">{type.emoji}</span>
                        <span className="text-[10px] font-medium text-center">{type.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Visual direction */}
            {step === 2 && !generating && (
              <div className="space-y-6 animate-fade-in">
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-semibold">Choose a visual direction</h3>
                  <p className="text-sm text-muted-foreground">Pick a style or let Nova decide</p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {styleDirections.map((style, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedStyle(i)}
                      className={`rounded-xl border transition-all text-left group ${
                        selectedStyle === i
                          ? "border-primary/40 bg-primary/5 shadow-lg shadow-primary/10 scale-[1.02]"
                          : "border-border/50 bg-secondary/20 hover:border-primary/20"
                      }`}
                    >
                      {/* Color preview */}
                      <div className="h-20 rounded-t-xl flex items-end p-2 gap-1 overflow-hidden relative" style={{ background: style.colors[0] }}>
                        {style.colors.slice(1).map((c, j) => (
                          <div key={j} className="w-6 h-6 rounded-md shadow-md" style={{ background: c }} />
                        ))}
                        {selectedStyle === i && (
                          <div className="absolute top-2 right-2 w-5 h-5 rounded-full nova-gradient flex items-center justify-center">
                            <Check className="w-3 h-3 text-primary-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <p className="text-xs font-medium">{style.label}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{style.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Generating */}
            {(step === 3 || generating) && (
              <div className="flex flex-col items-center justify-center h-[350px] space-y-6 animate-fade-in">
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl nova-gradient flex items-center justify-center shadow-2xl shadow-primary/30 animate-glow-pulse">
                    <Sparkles className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <div className="absolute -inset-4 rounded-3xl nova-gradient opacity-20 blur-xl animate-glow-pulse" />
                </div>

                <div className="text-center space-y-1.5">
                  <h3 className="text-lg font-semibold">
                    {progress < 30 ? "Analyzing your brief..." : progress < 60 ? "Generating layout..." : progress < 85 ? "Refining components..." : "Almost ready..."}
                  </h3>
                  <p className="text-sm text-muted-foreground">Nova is creating your design</p>
                </div>

                <div className="w-64 space-y-2">
                  <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                    <div
                      className="h-full nova-gradient rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground text-center font-mono">{Math.min(Math.round(progress), 100)}%</p>
                </div>

                {/* Materializing artboards */}
                <div className="flex items-center gap-3 mt-4">
                  {["Home", "Dashboard", "Settings"].map((screen, i) => (
                    <div
                      key={screen}
                      className={`w-20 h-14 rounded-lg border border-border bg-secondary/30 flex items-center justify-center transition-all duration-500 ${
                        progress > (i + 1) * 25
                          ? "opacity-100 scale-100"
                          : "opacity-20 scale-95"
                      }`}
                    >
                      <span className="text-[8px] text-muted-foreground">{screen}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          {!generating && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-border">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep(Math.max(1, step - 1))}
                disabled={step === 1}
                className="text-xs"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                Back
              </Button>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3].map((s) => (
                  <div key={s} className={`w-1.5 h-1.5 rounded-full transition-colors ${s <= step ? "bg-primary" : "bg-border"}`} />
                ))}
              </div>
              {step < 3 ? (
                <Button
                  size="sm"
                  onClick={() => setStep(step + 1)}
                  disabled={step === 1 && !prompt.trim()}
                  className="text-xs nova-gradient border-0 text-primary-foreground"
                >
                  Next
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={handleGenerate}
                  className="text-xs nova-gradient border-0 text-primary-foreground"
                >
                  <Zap className="w-3.5 h-3.5 mr-1.5" />
                  Generate
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIGenerationModal;
