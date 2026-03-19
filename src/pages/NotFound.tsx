import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Sparkles, ArrowLeft, Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 nova-dot-grid opacity-20" />
      <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] rounded-full bg-primary/4 blur-[120px]" />
      <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-accent/3 blur-[100px]" />

      <div className="relative z-10 text-center space-y-8 px-6 animate-fade-in">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-2xl nova-gradient flex items-center justify-center shadow-2xl shadow-primary/25">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
        </div>

        {/* 404 text */}
        <div className="space-y-3">
          <p className="text-7xl font-bold tracking-tighter text-gradient-brand">404</p>
          <h1 className="text-xl font-semibold text-foreground tracking-tight">
            This page doesn't exist
          </h1>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
            The page at <span className="font-mono text-xs text-foreground/60 bg-secondary/40 px-1.5 py-0.5 rounded">{location.pathname}</span> couldn't be found.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 h-9 px-4 rounded-xl border border-border/70 bg-secondary/20 text-sm text-muted-foreground hover:text-foreground hover:border-border hover:bg-secondary/40 transition-all duration-150 press-scale"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Go back
          </button>
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 h-9 px-4 rounded-xl nova-gradient text-sm font-medium text-white hover:opacity-90 shadow-lg shadow-primary/20 transition-all duration-150 press-scale"
          >
            <Home className="w-3.5 h-3.5" />
            Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
