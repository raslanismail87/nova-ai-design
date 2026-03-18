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
      <div className="absolute inset-0 nova-dot-grid opacity-30" />
      <div className="absolute top-[-40%] left-[-20%] w-[80%] h-[80%] rounded-full bg-primary/5 blur-[120px]" />
      <div className="absolute bottom-[-30%] right-[-10%] w-[60%] h-[60%] rounded-full bg-accent/5 blur-[100px]" />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg nova-gradient flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold tracking-tight text-foreground">Nova Studio</span>
        </div>
        <div className="flex items-center gap-6">
          <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</button>
          <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</button>
          <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">Docs</button>
          <Button size="sm" onClick={() => navigate("/dashboard")} className="nova-gradient border-0 text-primary-foreground hover:opacity-90">
            Get Started
          </Button>
        </div>
      </nav>

      {/* Hero + Auth */}
      <div className="relative z-10 max-w-7xl mx-auto px-8 pt-16 pb-24">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Hero */}
          <div className="space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-medium text-primary">
              <Zap className="w-3 h-3" />
              AI-Native Design Platform
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]">
              Design at the
              <br />
              <span className="nova-glow-text">speed of thought.</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-md leading-relaxed">
              Nova isn't a tool you use. It's a partner you direct. Create interfaces by editing visually or chatting naturally with AI.
            </p>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-3">
              {[
                { icon: Layers, label: "Visual Canvas" },
                { icon: MessageSquare, label: "AI Chat Editor" },
                { icon: Wand2, label: "Auto Generate" },
              ].map((f) => (
                <div key={f.label} className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-secondary/50 border border-border text-sm text-muted-foreground">
                  <f.icon className="w-3.5 h-3.5 text-primary" />
                  {f.label}
                </div>
              ))}
            </div>

            {/* Editor preview mockup */}
            <div className="relative mt-8 rounded-2xl overflow-hidden border border-border nova-glass p-1">
              <div className="rounded-xl bg-card overflow-hidden">
                {/* Mock toolbar */}
                <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-secondary/30">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-destructive/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="px-4 py-1 rounded-md bg-secondary/50 text-[10px] text-muted-foreground font-mono">
                      Landing Page — Nova Studio
                    </div>
                  </div>
                </div>
                {/* Mock canvas */}
                <div className="h-48 nova-dot-grid flex items-center justify-center relative">
                  <div className="absolute inset-4 rounded-lg border border-primary/30 bg-primary/5 flex items-center justify-center">
                    <div className="text-center space-y-2">
                      <div className="w-32 h-3 rounded bg-foreground/20 mx-auto" />
                      <div className="w-20 h-2 rounded bg-foreground/10 mx-auto" />
                      <div className="w-16 h-5 rounded-md nova-gradient mx-auto mt-3" />
                    </div>
                  </div>
                  {/* AI chat bubble */}
                  <div className="absolute bottom-3 right-3 px-3 py-1.5 rounded-lg bg-primary/20 border border-primary/30 text-[10px] text-primary font-medium animate-glow-pulse">
                    ✨ "Make it more modern"
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Auth */}
          <div className="flex justify-center lg:justify-end animate-slide-in-right">
            <div className="w-full max-w-sm">
              <div className="rounded-2xl nova-glass p-8 space-y-6">
                <div className="text-center space-y-2">
                  <h2 className="text-xl font-semibold">{isLogin ? "Welcome back" : "Create your account"}</h2>
                  <p className="text-sm text-muted-foreground">
                    {isLogin ? "Sign in to your workspace" : "Start designing with AI"}
                  </p>
                </div>

                {/* Social logins */}
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="h-11 bg-secondary/30 border-border hover:bg-secondary/50">
                    <Chrome className="w-4 h-4 mr-2" />
                    Google
                  </Button>
                  <Button variant="outline" className="h-11 bg-secondary/30 border-border hover:bg-secondary/50">
                    <Github className="w-4 h-4 mr-2" />
                    GitHub
                  </Button>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-2 bg-card text-muted-foreground">or continue with email</span>
                  </div>
                </div>

                <form onSubmit={handleAuth} className="space-y-4">
                  <Input
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 bg-secondary/30 border-border"
                  />
                  <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 bg-secondary/30 border-border"
                  />
                  <Button type="submit" className="w-full h-11 nova-gradient border-0 text-primary-foreground hover:opacity-90">
                    {isLogin ? "Sign In" : "Create Account"}
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </form>

                <p className="text-center text-xs text-muted-foreground">
                  {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                  <button
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-primary hover:underline font-medium"
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
