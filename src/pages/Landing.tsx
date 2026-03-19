import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Github, Chrome, ArrowRight, Zap, Layers, MessageSquare, Wand2 } from "lucide-react";

const Landing = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 nova-dot-grid opacity-20" />
      <div className="absolute top-[-40%] left-[-20%] w-[80%] h-[80%] rounded-full bg-primary/4 blur-[140px]" />
      <div className="absolute bottom-[-30%] right-[-10%] w-[60%] h-[60%] rounded-full bg-accent/3 blur-[120px]" />

      {/* Nav */}
      <nav className="relative z-10 nav-frosted sticky top-0">
        <div className="flex items-center justify-between px-8 py-3.5 max-w-7xl mx-auto">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg nova-gradient flex items-center justify-center shadow-md shadow-primary/20">
              <Sparkles className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="text-[15px] font-semibold tracking-tight text-foreground">Nova Studio</span>
          </div>
          <div className="flex items-center gap-1">
            {["Features", "Pricing", "Docs"].map((item) => (
              <button
                key={item}
                className="px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-white/4 transition-all duration-150"
              >
                {item}
              </button>
            ))}
            <div className="w-px h-5 bg-border/50 mx-2" />
            <Button
              size="sm"
              onClick={() => navigate("/dashboard")}
              className="nova-gradient border-0 text-primary-foreground hover:opacity-90 shadow-md shadow-primary/15 press-scale h-8"
            >
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero + Auth */}
      <div className="relative z-10 max-w-7xl mx-auto px-8 pt-20 pb-24">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Hero */}
          <div className="space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/8 border border-primary/15 text-xs font-medium text-primary">
              <Zap className="w-3 h-3" />
              AI-Native Design Platform
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold tracking-tight leading-[1.08]">
              Design at the
              <br />
              <span className="text-gradient-brand">speed of thought.</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-md leading-relaxed">
              Nova isn't a tool you use. It's a partner you direct. Create interfaces by editing visually or chatting naturally with AI.
            </p>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-2.5">
              {[
                { icon: Layers, label: "Visual Canvas" },
                { icon: MessageSquare, label: "AI Chat Editor" },
                { icon: Wand2, label: "Auto Generate" },
              ].map((f) => (
                <div key={f.label} className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-secondary/30 border border-border/60 text-sm text-muted-foreground hover:text-foreground/80 hover:border-border transition-all duration-200">
                  <f.icon className="w-3.5 h-3.5 text-primary/80" />
                  {f.label}
                </div>
              ))}
            </div>

            {/* Editor preview mockup */}
            <div className="relative mt-8 rounded-2xl overflow-hidden border border-border/60 nova-glass p-1 hover-lift">
              <div className="rounded-xl bg-card overflow-hidden">
                {/* Mock toolbar */}
                <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border/50 bg-secondary/20">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-destructive/50" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="px-4 py-1 rounded-md bg-secondary/40 text-[10px] text-muted-foreground/70 font-mono">
                      Landing Page — Nova Studio
                    </div>
                  </div>
                </div>
                {/* Mock canvas */}
                <div className="h-48 nova-dot-grid flex items-center justify-center relative">
                  <div className="absolute inset-4 rounded-lg border border-primary/20 bg-primary/3 flex items-center justify-center">
                    <div className="text-center space-y-2">
                      <div className="w-32 h-3 rounded bg-foreground/15 mx-auto" />
                      <div className="w-20 h-2 rounded bg-foreground/8 mx-auto" />
                      <div className="w-16 h-5 rounded-md nova-gradient mx-auto mt-3 opacity-80" />
                    </div>
                  </div>
                  {/* AI chat bubble */}
                  <div className="absolute bottom-3 right-3 px-3 py-1.5 rounded-lg bg-primary/15 border border-primary/20 text-[10px] text-primary font-medium animate-glow-pulse">
                    ✨ "Make it more modern"
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Auth */}
          <div className="flex justify-center lg:justify-end animate-slide-in-right">
            <div className="w-full max-w-sm">
              <div className="rounded-2xl nova-glass noise-overlay p-8 space-y-6 border-shine">
                <div className="text-center space-y-2">
                  <h2 className="text-xl font-semibold tracking-tight">{isLogin ? "Welcome back" : "Create your account"}</h2>
                  <p className="text-sm text-muted-foreground">
                    {isLogin ? "Sign in to your workspace" : "Start designing with AI"}
                  </p>
                </div>

                {/* Social logins */}
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="h-11 bg-secondary/20 border-border/70 hover:bg-secondary/40 hover:border-border press-scale">
                    <Chrome className="w-4 h-4 mr-2" />
                    Google
                  </Button>
                  <Button variant="outline" className="h-11 bg-secondary/20 border-border/70 hover:bg-secondary/40 hover:border-border press-scale">
                    <Github className="w-4 h-4 mr-2" />
                    GitHub
                  </Button>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border/50" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-3 bg-[hsl(240_6%_8%)] text-muted-foreground/70">or continue with email</span>
                  </div>
                </div>

                <form onSubmit={handleAuth} className="space-y-3.5">
                  <Input
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 bg-secondary/20 border-border/60 focus:border-primary/40 focus:bg-secondary/30 transition-all"
                  />
                  <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 bg-secondary/20 border-border/60 focus:border-primary/40 focus:bg-secondary/30 transition-all"
                  />
                  <Button type="submit" className="w-full h-11 nova-gradient border-0 text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/15 press-scale">
                    {isLogin ? "Sign In" : "Create Account"}
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>
                </form>

                <p className="text-center text-xs text-muted-foreground/70">
                  {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                  <button
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-primary hover:text-primary/80 font-medium transition-colors"
                  >
                    {isLogin ? "Sign up" : "Sign in"}
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
