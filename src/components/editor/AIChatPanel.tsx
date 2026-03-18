import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  X, Sparkles, Send, Check, RotateCcw, ArrowLeftRight, Undo2,
  Layers, MousePointer2, Frame, Wand2, Copy, SlidersHorizontal,
  Lightbulb, Layout, Accessibility, Smartphone,
  Moon, Minimize2, Grid3X3, FileText, ChevronRight,
} from "lucide-react";
import { useCanvas, CanvasElement } from "@/contexts/CanvasContext";
import { aiSuggestions } from "@/data/mockData";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  applied?: boolean;
  hasVariations?: boolean;
  actions?: Array<{ label: string; run: () => void }>;
}

const quickActions = [
  { icon: Wand2, label: "Restyle", desc: "Transform visual style", prompt: "Restyle the selected element with a more premium look" },
  { icon: Layout, label: "Add Section", desc: "Generate content block", prompt: "Add a new section to the design" },
  { icon: Lightbulb, label: "Improve UX", desc: "Enhance usability", prompt: "Improve the UX and usability of this design" },
  { icon: FileText, label: "Add Hero", desc: "Full hero section", prompt: "Add a hero section with headline, subtext and CTA button" },
  { icon: Copy, label: "Duplicate", desc: "Duplicate selected", prompt: "Duplicate the selected element" },
  { icon: Smartphone, label: "Add Button", desc: "Add a CTA button", prompt: "Add a call-to-action button" },
  { icon: Accessibility, label: "Add Card", desc: "Add a card component", prompt: "Add a feature card" },
  { icon: Moon, label: "Dark Mode", desc: "Generate dark variant", prompt: "Add a dark mode variant of this design" },
  { icon: Minimize2, label: "Add Frame", desc: "Add a frame container", prompt: "Add a frame to contain elements" },
  { icon: Grid3X3, label: "3-Col Grid", desc: "Add 3-column grid", prompt: "Add a 3-column grid layout with cards" },
];

const contextTargets = [
  { icon: MousePointer2, label: "Selected" },
  { icon: Frame, label: "Frame" },
  { icon: Layers, label: "Page" },
];

// --- AI Command Processor ---
function processAICommand(
  prompt: string,
  selectedElements: CanvasElement[],
  addElement: (el: any) => void,
  addElements: (els: any[]) => void,
  updateElement: (id: string, updates: any) => void,
  deleteSelected: () => void,
  nextId: () => string,
): { response: string; applied: boolean; hasVariations?: boolean } {
  const p = prompt.toLowerCase();

  // ── ADD / CREATE / GENERATE / INSERT ───────────────────────────────────────
  if (p.includes("add") || p.includes("create") || p.includes("generate") || p.includes("insert") || p.includes("make")) {

    // Button / CTA
    if (p.includes("button") || p.includes("cta")) {
      addElements([
        {
          type: "rectangle",
          x: 64 + Math.random() * 200, y: 400 + Math.random() * 80,
          width: 160, height: 48,
          rotation: 0, fill: "linear-gradient(135deg, #8B5CF6, #06B6D4)", stroke: "", strokeWidth: 0,
          opacity: 1, cornerRadius: 12,
          name: "CTA Button", visible: true, locked: false,
        },
        {
          type: "text",
          x: 64 + Math.random() * 200, y: 415 + Math.random() * 80,
          width: 160, height: 24,
          rotation: 0, fill: "#FFFFFF", stroke: "", strokeWidth: 0,
          opacity: 1, cornerRadius: 0,
          name: "Button Label", textContent: p.includes("sign") ? "Sign Up Free" : p.includes("start") ? "Get Started" : "Learn More",
          fontSize: 14, fontWeight: "600", fontFamily: "Inter",
          textAlign: "center", lineHeight: 1.2, letterSpacing: 0, visible: true, locked: false,
        },
      ]);
      return { response: "Added a gradient CTA button.\n\n• **Style** — Violet→cyan gradient, 12px radius\n• **Label** — Editable button text added\n• **Size** — 160 × 48px\n\nDouble-click the label to edit text.", applied: true };
    }

    // Feature card
    if (p.includes("card") || p.includes("feature")) {
      const baseX = 48 + Math.floor(Math.random() * 3) * 200;
      addElements([
        { type: "rectangle", x: baseX, y: 620, width: 180, height: 150, rotation: 0, fill: "rgba(30,30,40,0.85)", stroke: "rgba(255,255,255,0.07)", strokeWidth: 1, opacity: 1, cornerRadius: 16, name: "Feature Card", visible: true, locked: false },
        { type: "rectangle", x: baseX + 20, y: 640, width: 36, height: 36, rotation: 0, fill: "linear-gradient(135deg, #8B5CF6, #06B6D4)", stroke: "", strokeWidth: 0, opacity: 1, cornerRadius: 10, name: "Card Icon", visible: true, locked: false },
        { type: "text", x: baseX + 20, y: 690, width: 140, height: 18, rotation: 0, fill: "#F2F2F2", stroke: "", strokeWidth: 0, opacity: 1, cornerRadius: 0, name: "Card Title", textContent: "Feature Title", fontSize: 13, fontWeight: "600", fontFamily: "Inter", textAlign: "left", lineHeight: 1.3, letterSpacing: -0.01, visible: true, locked: false },
        { type: "text", x: baseX + 20, y: 716, width: 140, height: 40, rotation: 0, fill: "#888", stroke: "", strokeWidth: 0, opacity: 1, cornerRadius: 0, name: "Card Desc", textContent: "Short description of this feature.", fontSize: 11, fontWeight: "400", fontFamily: "Inter", textAlign: "left", lineHeight: 1.5, letterSpacing: 0, visible: true, locked: false },
      ]);
      return { response: "Added a feature card component.\n\n• **Card** — Dark surface with subtle border\n• **Icon** — Gradient icon placeholder\n• **Content** — Title + description text\n\nDouble-click any text to edit it.", applied: true };
    }

    // Hero section
    if (p.includes("hero")) {
      addElements([
        { type: "frame", isFrame: true, x: 0, y: 72, width: 1280, height: 480, rotation: 0, fill: "rgba(10,10,15,1)", stroke: "", strokeWidth: 0, opacity: 1, cornerRadius: 0, name: "Hero Section", visible: true, locked: false },
        { type: "text", x: 64, y: 160, width: 560, height: 120, rotation: 0, fill: "#F2F2F2", stroke: "", strokeWidth: 0, opacity: 1, cornerRadius: 0, name: "Hero Headline", textContent: "Build faster with AI", fontSize: 64, fontWeight: "700", fontFamily: "Inter", textAlign: "left", lineHeight: 1.1, letterSpacing: -0.03, visible: true, locked: false },
        { type: "text", x: 64, y: 296, width: 480, height: 60, rotation: 0, fill: "#999", stroke: "", strokeWidth: 0, opacity: 1, cornerRadius: 0, name: "Hero Subheadline", textContent: "Create beautiful interfaces in seconds with AI-powered design tools.", fontSize: 18, fontWeight: "400", fontFamily: "Inter", textAlign: "left", lineHeight: 1.5, letterSpacing: 0, visible: true, locked: false },
        { type: "rectangle", x: 64, y: 380, width: 168, height: 52, rotation: 0, fill: "linear-gradient(135deg, #8B5CF6, #06B6D4)", stroke: "", strokeWidth: 0, opacity: 1, cornerRadius: 14, name: "Hero CTA", visible: true, locked: false },
        { type: "rectangle", x: 248, y: 380, width: 140, height: 52, rotation: 0, fill: "transparent", stroke: "rgba(255,255,255,0.15)", strokeWidth: 1, opacity: 1, cornerRadius: 14, name: "Secondary CTA", visible: true, locked: false },
        { type: "rectangle", x: 680, y: 100, width: 520, height: 360, rotation: 0, fill: "rgba(139,92,246,0.08)", stroke: "rgba(139,92,246,0.2)", strokeWidth: 1, opacity: 1, cornerRadius: 20, name: "Hero Visual", visible: true, locked: false },
      ]);
      return { response: "Added a full hero section.\n\n• **Frame** — 1280 × 480px dark background\n• **Headline** — 64px Bold, tight letter-spacing\n• **Subheadline** — 18px Regular, muted tone\n• **CTA** — Primary gradient + ghost secondary\n• **Visual** — Placeholder for hero image\n\nEdit the text to match your product.", applied: true, hasVariations: true };
    }

    // Testimonials
    if (p.includes("testimonial") || p.includes("review") || p.includes("quote")) {
      const names = ["Sarah Chen", "Alex Rivera", "Jordan Kim"];
      const roles = ["Head of Design, Stripe", "CTO, Linear", "Lead PM, Notion"];
      const quotes = [
        "This tool completely changed how our design team works. The AI suggestions are incredibly accurate.",
        "We went from wireframe to polished UI in half the time. The AI understands design intent.",
        "The collaborative AI features feel like having a senior designer always available.",
      ];
      addElements([
        { type: "frame", isFrame: true, x: 0, y: 560, width: 1280, height: 300, rotation: 0, fill: "rgba(8,8,12,1)", stroke: "", strokeWidth: 0, opacity: 1, cornerRadius: 0, name: "Testimonials Section", visible: true, locked: false },
        { type: "text", x: 400, y: 580, width: 480, height: 36, rotation: 0, fill: "#F2F2F2", stroke: "", strokeWidth: 0, opacity: 1, cornerRadius: 0, name: "Section Title", textContent: "Loved by design teams", fontSize: 24, fontWeight: "600", fontFamily: "Inter", textAlign: "center", lineHeight: 1.3, letterSpacing: -0.01, visible: true, locked: false },
        ...names.flatMap((name, i) => {
          const x = 48 + i * 408;
          return [
            { type: "rectangle", x, y: 630, width: 384, height: 180, rotation: 0, fill: "rgba(22,22,32,0.9)", stroke: "rgba(255,255,255,0.07)", strokeWidth: 1, opacity: 1, cornerRadius: 16, name: `Testimonial Card ${i + 1}`, visible: true, locked: false },
            { type: "text", x: x + 20, y: 650, width: 344, height: 80, rotation: 0, fill: "#d0d0d0", stroke: "", strokeWidth: 0, opacity: 1, cornerRadius: 0, name: `Quote ${i + 1}`, textContent: `"${quotes[i]}"`, fontSize: 12, fontWeight: "400", fontFamily: "Inter", textAlign: "left", lineHeight: 1.6, letterSpacing: 0, visible: true, locked: false },
            { type: "ellipse", x: x + 20, y: 750, width: 32, height: 32, rotation: 0, fill: "linear-gradient(135deg, #8B5CF6, #06B6D4)", stroke: "", strokeWidth: 0, opacity: 1, cornerRadius: 0, name: `Avatar ${i + 1}`, visible: true, locked: false },
            { type: "text", x: x + 60, y: 754, width: 200, height: 14, rotation: 0, fill: "#F2F2F2", stroke: "", strokeWidth: 0, opacity: 1, cornerRadius: 0, name: `Author ${i + 1}`, textContent: name, fontSize: 12, fontWeight: "600", fontFamily: "Inter", textAlign: "left", lineHeight: 1.2, letterSpacing: 0, visible: true, locked: false },
            { type: "text", x: x + 60, y: 774, width: 220, height: 12, rotation: 0, fill: "#666", stroke: "", strokeWidth: 0, opacity: 1, cornerRadius: 0, name: `Role ${i + 1}`, textContent: roles[i], fontSize: 10, fontWeight: "400", fontFamily: "Inter", textAlign: "left", lineHeight: 1.2, letterSpacing: 0, visible: true, locked: false },
          ];
        }),
      ]);
      return { response: "Added a 3-card testimonial section.\n\n• **Layout** — 3 equal-width cards with 24px gaps\n• **Content** — Realistic quotes, names, roles and company\n• **Avatars** — Gradient avatar placeholders\n• **Style** — Dark surface matching design language\n\nEdit quotes to use real customer testimonials.", applied: true };
    }

    // Pricing section
    if (p.includes("pricing") || p.includes("plan") || p.includes("tier")) {
      const plans = [
        { name: "Starter", price: "$0", desc: "Perfect for individuals", features: ["5 projects", "2 seats", "Basic AI", "SVG export"], highlight: false },
        { name: "Pro", price: "$29", desc: "For growing teams", features: ["Unlimited projects", "10 seats", "Advanced AI", "All exports", "Priority support"], highlight: true },
        { name: "Enterprise", price: "Custom", desc: "For large organizations", features: ["Unlimited everything", "Unlimited seats", "Custom AI training", "SLA", "Dedicated support"], highlight: false },
      ];
      addElements([
        { type: "frame", isFrame: true, x: 0, y: 900, width: 1280, height: 520, rotation: 0, fill: "rgba(6,6,10,1)", stroke: "", strokeWidth: 0, opacity: 1, cornerRadius: 0, name: "Pricing Section", visible: true, locked: false },
        { type: "text", x: 440, y: 920, width: 400, height: 36, rotation: 0, fill: "#F2F2F2", stroke: "", strokeWidth: 0, opacity: 1, cornerRadius: 0, name: "Pricing Title", textContent: "Simple, transparent pricing", fontSize: 28, fontWeight: "700", fontFamily: "Inter", textAlign: "center", lineHeight: 1.2, letterSpacing: -0.02, visible: true, locked: false },
        { type: "text", x: 440, y: 966, width: 400, height: 20, rotation: 0, fill: "#888", stroke: "", strokeWidth: 0, opacity: 1, cornerRadius: 0, name: "Pricing Subtitle", textContent: "Start free, scale as you grow. No surprises.", fontSize: 14, fontWeight: "400", fontFamily: "Inter", textAlign: "center", lineHeight: 1.4, letterSpacing: 0, visible: true, locked: false },
        ...plans.flatMap((plan, i) => {
          const x = 48 + i * 408;
          const cardY = 1010;
          return [
            {
              type: "rectangle", x, y: cardY, width: 384, height: 340, rotation: 0,
              fill: plan.highlight ? "rgba(139,92,246,0.08)" : "rgba(18,18,26,0.9)",
              stroke: plan.highlight ? "rgba(139,92,246,0.4)" : "rgba(255,255,255,0.07)",
              strokeWidth: plan.highlight ? 1.5 : 1, opacity: 1, cornerRadius: 20,
              name: `${plan.name} Plan`, visible: true, locked: false,
            },
            { type: "text", x: x + 24, y: cardY + 28, width: 200, height: 24, rotation: 0, fill: "#F2F2F2", stroke: "", strokeWidth: 0, opacity: 1, cornerRadius: 0, name: `Plan Name ${plan.name}`, textContent: plan.name, fontSize: 16, fontWeight: "600", fontFamily: "Inter", textAlign: "left", lineHeight: 1.3, letterSpacing: -0.01, visible: true, locked: false },
            { type: "text", x: x + 24, y: cardY + 58, width: 200, height: 48, rotation: 0, fill: "#F2F2F2", stroke: "", strokeWidth: 0, opacity: 1, cornerRadius: 0, name: `Plan Price ${plan.name}`, textContent: plan.price, fontSize: 36, fontWeight: "800", fontFamily: "Inter", textAlign: "left", lineHeight: 1.1, letterSpacing: -0.03, visible: true, locked: false },
            { type: "text", x: x + 24, y: cardY + 110, width: 250, height: 18, rotation: 0, fill: "#888", stroke: "", strokeWidth: 0, opacity: 1, cornerRadius: 0, name: `Plan Desc ${plan.name}`, textContent: plan.desc, fontSize: 12, fontWeight: "400", fontFamily: "Inter", textAlign: "left", lineHeight: 1.4, letterSpacing: 0, visible: true, locked: false },
            {
              type: "rectangle", x: x + 24, y: cardY + 248, width: 336, height: 44, rotation: 0,
              fill: plan.highlight ? "linear-gradient(135deg, #8B5CF6, #06B6D4)" : "transparent",
              stroke: plan.highlight ? "" : "rgba(255,255,255,0.15)",
              strokeWidth: 1, opacity: 1, cornerRadius: 12,
              name: `Plan CTA ${plan.name}`, visible: true, locked: false,
            },
          ];
        }),
      ]);
      return { response: "Added a 3-tier pricing section.\n\n• **Plans** — Starter (free), Pro ($29/mo), Enterprise\n• **Pro** — Highlighted with violet border accent\n• **CTAs** — Primary gradient for Pro, ghost for others\n• **Style** — Dark cards with subtle contrast\n\nUpdate prices and feature lists to match your product.", applied: true, hasVariations: true };
    }

    // Footer
    if (p.includes("footer")) {
      addElements([
        { type: "frame", isFrame: true, x: 0, y: 1440, width: 1280, height: 200, rotation: 0, fill: "rgba(5,5,8,1)", stroke: "", strokeWidth: 0, opacity: 1, cornerRadius: 0, name: "Footer", visible: true, locked: false },
        { type: "rectangle", x: 48, y: 1468, width: 28, height: 28, rotation: 0, fill: "linear-gradient(135deg, #8B5CF6, #06B6D4)", stroke: "", strokeWidth: 0, opacity: 1, cornerRadius: 8, name: "Footer Logo", visible: true, locked: false },
        { type: "text", x: 84, y: 1474, width: 120, height: 18, rotation: 0, fill: "#F2F2F2", stroke: "", strokeWidth: 0, opacity: 1, cornerRadius: 0, name: "Footer Brand", textContent: "Nova Studio", fontSize: 14, fontWeight: "600", fontFamily: "Inter", textAlign: "left", lineHeight: 1.3, letterSpacing: -0.01, visible: true, locked: false },
        { type: "text", x: 48, y: 1500, width: 280, height: 30, rotation: 0, fill: "#555", stroke: "", strokeWidth: 0, opacity: 1, cornerRadius: 0, name: "Footer Tagline", textContent: "AI-powered design for modern teams.", fontSize: 12, fontWeight: "400", fontFamily: "Inter", textAlign: "left", lineHeight: 1.5, letterSpacing: 0, visible: true, locked: false },
        { type: "line", x: 48, y: 1600, width: 1184, height: 0, rotation: 0, fill: "rgba(255,255,255,0.07)", stroke: "rgba(255,255,255,0.07)", strokeWidth: 1, opacity: 1, cornerRadius: 0, name: "Footer Divider", visible: true, locked: false },
        { type: "text", x: 48, y: 1612, width: 300, height: 14, rotation: 0, fill: "#444", stroke: "", strokeWidth: 0, opacity: 1, cornerRadius: 0, name: "Copyright", textContent: "© 2024 Nova Studio. All rights reserved.", fontSize: 11, fontWeight: "400", fontFamily: "Inter", textAlign: "left", lineHeight: 1.3, letterSpacing: 0, visible: true, locked: false },
      ]);
      return { response: "Added a footer section.\n\n• **Logo** — Brand mark + wordmark\n• **Tagline** — Product description\n• **Divider** — Subtle separator line\n• **Copyright** — Legal text\n\nAdd navigation columns and social links as needed.", applied: true };
    }

    // Stats / metrics
    if (p.includes("stat") || p.includes("metric") || p.includes("number") || p.includes("kpi")) {
      const stats = [
        { label: "Active Users", value: "2.4M+", change: "+18% MoM" },
        { label: "Designs Created", value: "18.7M", change: "+45% YoY" },
        { label: "Teams", value: "12,000+", change: "+200 this week" },
        { label: "AI Generations", value: "450M+", change: "Real-time" },
      ];
      addElements([
        { type: "frame", isFrame: true, x: 0, y: 560, width: 1280, height: 160, rotation: 0, fill: "rgba(8,8,12,1)", stroke: "", strokeWidth: 0, opacity: 1, cornerRadius: 0, name: "Stats Section", visible: true, locked: false },
        ...stats.flatMap((stat, i) => {
          const x = 64 + i * 300;
          return [
            { type: "text", x, y: 600, width: 260, height: 52, rotation: 0, fill: "#F2F2F2", stroke: "", strokeWidth: 0, opacity: 1, cornerRadius: 0, name: `Stat Value ${i + 1}`, textContent: stat.value, fontSize: 40, fontWeight: "800", fontFamily: "Inter", textAlign: "left", lineHeight: 1.1, letterSpacing: -0.03, visible: true, locked: false },
            { type: "text", x, y: 656, width: 260, height: 16, rotation: 0, fill: "#888", stroke: "", strokeWidth: 0, opacity: 1, cornerRadius: 0, name: `Stat Label ${i + 1}`, textContent: stat.label, fontSize: 12, fontWeight: "500", fontFamily: "Inter", textAlign: "left", lineHeight: 1.3, letterSpacing: 0.02, visible: true, locked: false },
            { type: "text", x, y: 678, width: 260, height: 14, rotation: 0, fill: "#10B981", stroke: "", strokeWidth: 0, opacity: 1, cornerRadius: 0, name: `Stat Change ${i + 1}`, textContent: stat.change, fontSize: 11, fontWeight: "500", fontFamily: "Inter", textAlign: "left", lineHeight: 1.3, letterSpacing: 0, visible: true, locked: false },
          ];
        }),
      ]);
      return { response: "Added a stats/metrics section.\n\n• **4 KPIs** — Users, Designs, Teams, AI generations\n• **Values** — Bold 40px numeric display\n• **Change** — Green growth indicators\n• **Layout** — 4-column horizontal row\n\nUpdate values to reflect your real metrics.", applied: true };
    }

    // Navigation / navbar
    if (p.includes("nav") || p.includes("navbar") || p.includes("header")) {
      addElements([
        { type: "frame", isFrame: true, x: 0, y: 0, width: 1280, height: 72, rotation: 0, fill: "rgba(10,10,15,0.95)", stroke: "rgba(255,255,255,0.08)", strokeWidth: 1, opacity: 1, cornerRadius: 0, name: "Navigation", visible: true, locked: false },
        { type: "rectangle", x: 32, y: 22, width: 28, height: 28, rotation: 0, fill: "linear-gradient(135deg, #8B5CF6, #06B6D4)", stroke: "", strokeWidth: 0, opacity: 1, cornerRadius: 8, name: "Logo Mark", visible: true, locked: false },
        { type: "text", x: 68, y: 28, width: 100, height: 20, rotation: 0, fill: "#F2F2F2", stroke: "", strokeWidth: 0, opacity: 1, cornerRadius: 0, name: "Brand Name", textContent: "Nova Studio", fontSize: 14, fontWeight: "600", fontFamily: "Inter", textAlign: "left", lineHeight: 1.3, letterSpacing: -0.01, visible: true, locked: false },
        { type: "text", x: 480, y: 28, width: 60, height: 18, rotation: 0, fill: "#aaa", stroke: "", strokeWidth: 0, opacity: 1, cornerRadius: 0, name: "Nav Link 1", textContent: "Features", fontSize: 13, fontWeight: "400", fontFamily: "Inter", textAlign: "center", lineHeight: 1.3, letterSpacing: 0, visible: true, locked: false },
        { type: "text", x: 560, y: 28, width: 60, height: 18, rotation: 0, fill: "#aaa", stroke: "", strokeWidth: 0, opacity: 1, cornerRadius: 0, name: "Nav Link 2", textContent: "Pricing", fontSize: 13, fontWeight: "400", fontFamily: "Inter", textAlign: "center", lineHeight: 1.3, letterSpacing: 0, visible: true, locked: false },
        { type: "text", x: 640, y: 28, width: 60, height: 18, rotation: 0, fill: "#aaa", stroke: "", strokeWidth: 0, opacity: 1, cornerRadius: 0, name: "Nav Link 3", textContent: "Blog", fontSize: 13, fontWeight: "400", fontFamily: "Inter", textAlign: "center", lineHeight: 1.3, letterSpacing: 0, visible: true, locked: false },
        { type: "rectangle", x: 1132, y: 20, width: 116, height: 34, rotation: 0, fill: "linear-gradient(135deg, #8B5CF6, #06B6D4)", stroke: "", strokeWidth: 0, opacity: 1, cornerRadius: 10, name: "Nav CTA", visible: true, locked: false },
      ]);
      return { response: "Added a navigation header.\n\n• **Logo** — Brand mark + wordmark\n• **Links** — Features, Pricing, Blog nav links\n• **CTA** — Primary gradient button (top right)\n• **Style** — Semi-transparent dark with border\n\nEdit link text and update the logo.", applied: true };
    }

    // Text / heading
    if (p.includes("text") || p.includes("heading") || p.includes("title") || p.includes("label")) {
      const isH1 = p.includes("h1") || p.includes("hero") || p.includes("headline");
      const isSub = p.includes("sub") || p.includes("body") || p.includes("caption") || p.includes("description");
      addElement({
        type: "text",
        x: 64, y: 120 + Math.random() * 100,
        width: isH1 ? 600 : 400, height: isH1 ? 80 : 40,
        rotation: 0, fill: isSub ? "#999" : "#F2F2F2", stroke: "", strokeWidth: 0,
        opacity: 1, cornerRadius: 0,
        name: isH1 ? "Heading" : isSub ? "Body Text" : "Label",
        textContent: isH1 ? "Your headline goes here" : isSub ? "Supporting body text that explains the concept in more detail." : "Section label",
        fontSize: isH1 ? 48 : isSub ? 15 : 11,
        fontWeight: isH1 ? "700" : isSub ? "400" : "600",
        fontFamily: "Inter",
        textAlign: "left", lineHeight: isH1 ? 1.1 : 1.5, letterSpacing: isH1 ? -0.02 : 0.05,
        visible: true, locked: false,
      });
      return { response: `Added ${isH1 ? "a headline" : isSub ? "body text" : "a label"} element.\n\n• **Font** — Inter ${isH1 ? "48px Bold" : isSub ? "15px Regular" : "11px SemiBold"}\n• **Color** — ${isSub ? "Muted #999" : "Primary #F2F2F2"}\n\nDouble-click to edit text in the canvas.`, applied: true };
    }

    // Section (generic)
    if (p.includes("section") || p.includes("block")) {
      addElements([
        { type: "frame", isFrame: true, x: 0, y: 560, width: 1280, height: 360, rotation: 0, fill: "rgba(10,10,15,1)", stroke: "", strokeWidth: 0, opacity: 1, cornerRadius: 0, name: "New Section", visible: true, locked: false },
        { type: "text", x: 64, y: 600, width: 480, height: 48, rotation: 0, fill: "#F2F2F2", stroke: "", strokeWidth: 0, opacity: 1, cornerRadius: 0, name: "Section Heading", textContent: "Section Title", fontSize: 36, fontWeight: "700", fontFamily: "Inter", textAlign: "left", lineHeight: 1.2, letterSpacing: -0.02, visible: true, locked: false },
        { type: "text", x: 64, y: 660, width: 440, height: 50, rotation: 0, fill: "#888", stroke: "", strokeWidth: 0, opacity: 1, cornerRadius: 0, name: "Section Subtitle", textContent: "Add a short description of what this section is about.", fontSize: 16, fontWeight: "400", fontFamily: "Inter", textAlign: "left", lineHeight: 1.5, letterSpacing: 0, visible: true, locked: false },
      ]);
      return { response: "Added a new section frame with heading and subtitle.\n\n• **Frame** — Full-width 1280 × 360px dark section\n• **Heading** — 36px Bold\n• **Subtitle** — 16px Regular muted\n\nCustomize the content and add more elements.", applied: true };
    }

    // 3-column grid
    if (p.includes("3") || p.includes("three") || p.includes("grid") || p.includes("col")) {
      addElements([
        { type: "rectangle", x: 48, y: 620, width: 368, height: 180, rotation: 0, fill: "rgba(30,30,40,0.8)", stroke: "rgba(255,255,255,0.07)", strokeWidth: 1, opacity: 1, cornerRadius: 16, name: "Card 1", visible: true, locked: false },
        { type: "rectangle", x: 456, y: 620, width: 368, height: 180, rotation: 0, fill: "rgba(30,30,40,0.8)", stroke: "rgba(255,255,255,0.07)", strokeWidth: 1, opacity: 1, cornerRadius: 16, name: "Card 2", visible: true, locked: false },
        { type: "rectangle", x: 864, y: 620, width: 368, height: 180, rotation: 0, fill: "rgba(30,30,40,0.8)", stroke: "rgba(255,255,255,0.07)", strokeWidth: 1, opacity: 1, cornerRadius: 16, name: "Card 3", visible: true, locked: false },
      ]);
      return { response: "Added a 3-column card grid.\n\n• **Layout** — 3 × 368px cards with 40px gaps\n• **Style** — Dark surface with subtle border\n\nPerfect for features, testimonials, or pricing.", applied: true, hasVariations: true };
    }

    // Mobile frame
    if (p.includes("mobile") || p.includes("phone") || p.includes("responsive")) {
      addElements([
        { type: "frame", isFrame: true, x: 900, y: 50, width: 390, height: 844, rotation: 0, fill: "#0a0a0f", stroke: "rgba(255,255,255,0.1)", strokeWidth: 1, opacity: 1, cornerRadius: 44, name: "Mobile Frame (390×844)", visible: true, locked: false },
      ]);
      return { response: "Added a mobile frame (iPhone 14 — 390×844).\n\n• **Dimensions** — 390 × 844px\n• **Radius** — 44px matches device corners\n• **Position** — Next to your existing desktop design\n\nDesign the mobile variant alongside desktop.", applied: true };
    }

    // Form
    if (p.includes("form") || p.includes("input") || p.includes("signup") || p.includes("sign up") || p.includes("login")) {
      addElements([
        { type: "rectangle", x: 440, y: 200, width: 400, height: 400, rotation: 0, fill: "rgba(18,18,26,0.98)", stroke: "rgba(255,255,255,0.08)", strokeWidth: 1, opacity: 1, cornerRadius: 20, name: "Form Card", visible: true, locked: false, shadowColor: "rgba(0,0,0,0.4)", shadowX: 0, shadowY: 16, shadowBlur: 40 },
        { type: "text", x: 464, y: 236, width: 352, height: 28, rotation: 0, fill: "#F2F2F2", stroke: "", strokeWidth: 0, opacity: 1, cornerRadius: 0, name: "Form Title", textContent: p.includes("login") || p.includes("sign in") ? "Sign in to your account" : "Create an account", fontSize: 20, fontWeight: "700", fontFamily: "Inter", textAlign: "left", lineHeight: 1.2, letterSpacing: -0.01, visible: true, locked: false },
        { type: "text", x: 464, y: 272, width: 352, height: 16, rotation: 0, fill: "#666", stroke: "", strokeWidth: 0, opacity: 1, cornerRadius: 0, name: "Form Subtitle", textContent: p.includes("login") ? "Welcome back." : "Start designing with AI today.", fontSize: 13, fontWeight: "400", fontFamily: "Inter", textAlign: "left", lineHeight: 1.4, letterSpacing: 0, visible: true, locked: false },
        { type: "rectangle", x: 464, y: 316, width: 352, height: 44, rotation: 0, fill: "rgba(20,20,30,0.8)", stroke: "rgba(255,255,255,0.1)", strokeWidth: 1, opacity: 1, cornerRadius: 10, name: "Email Input", visible: true, locked: false },
        { type: "text", x: 480, y: 334, width: 180, height: 14, rotation: 0, fill: "#555", stroke: "", strokeWidth: 0, opacity: 1, cornerRadius: 0, name: "Email Placeholder", textContent: "Email address", fontSize: 13, fontWeight: "400", fontFamily: "Inter", textAlign: "left", lineHeight: 1.4, letterSpacing: 0, visible: true, locked: false },
        { type: "rectangle", x: 464, y: 372, width: 352, height: 44, rotation: 0, fill: "rgba(20,20,30,0.8)", stroke: "rgba(255,255,255,0.1)", strokeWidth: 1, opacity: 1, cornerRadius: 10, name: "Password Input", visible: true, locked: false },
        { type: "text", x: 480, y: 390, width: 180, height: 14, rotation: 0, fill: "#555", stroke: "", strokeWidth: 0, opacity: 1, cornerRadius: 0, name: "Password Placeholder", textContent: "Password", fontSize: 13, fontWeight: "400", fontFamily: "Inter", textAlign: "left", lineHeight: 1.4, letterSpacing: 0, visible: true, locked: false },
        { type: "rectangle", x: 464, y: 436, width: 352, height: 48, rotation: 0, fill: "linear-gradient(135deg, #8B5CF6, #06B6D4)", stroke: "", strokeWidth: 0, opacity: 1, cornerRadius: 12, name: "Submit Button", visible: true, locked: false },
        { type: "text", x: 464, y: 454, width: 352, height: 18, rotation: 0, fill: "#FFFFFF", stroke: "", strokeWidth: 0, opacity: 1, cornerRadius: 0, name: "Submit Label", textContent: p.includes("login") ? "Sign In" : "Create Account", fontSize: 14, fontWeight: "600", fontFamily: "Inter", textAlign: "center", lineHeight: 1.2, letterSpacing: 0, visible: true, locked: false },
      ]);
      return { response: `Added a ${p.includes("login") ? "login" : "signup"} form card.\n\n• **Card** — 400 × 400px with subtle shadow\n• **Fields** — Email and password inputs\n• **Submit** — Gradient primary button\n• **Copy** — ${p.includes("login") ? "Sign in flow" : "Registration flow"}\n\nEdit text to match your brand and add validation states.`, applied: true };
    }

    // Dark frame
    if (p.includes("dark") || p.includes("dark mode")) {
      addElement({
        type: "frame", isFrame: true,
        x: 0, y: 950, width: 1280, height: 900,
        rotation: 0, fill: "#050508", stroke: "", strokeWidth: 0,
        opacity: 1, cornerRadius: 0,
        name: "Dark Mode Variant", visible: true, locked: false,
      });
      return { response: "Added a dark mode frame below your current design.\n\n• **Background** — Deep #050508\n• **Size** — 1280 × 900 (matches artboard)\n\nDuplicate your light elements into this frame and swap colors for the dark variant.", applied: true };
    }

    // Frame / container
    if (p.includes("frame") || p.includes("container") || p.includes("artboard")) {
      addElement({
        type: "frame", isFrame: true,
        x: 100, y: 100, width: 400, height: 300,
        rotation: 0, fill: "rgba(20,20,28,0.6)", stroke: "rgba(255,255,255,0.1)", strokeWidth: 1,
        opacity: 1, cornerRadius: 16,
        name: "Frame", visible: true, locked: false,
      });
      return { response: "Added a frame container (400 × 300).\n\nUse frames to group and organize your design elements. Drag elements inside to nest them.", applied: true };
    }

    // Circle / ellipse
    if (p.includes("circle") || p.includes("ellipse") || p.includes("oval")) {
      addElement({
        type: "ellipse",
        x: 100, y: 100, width: 100, height: 100,
        rotation: 0, fill: "rgba(139,92,246,0.2)", stroke: "rgba(139,92,246,0.5)", strokeWidth: 1.5,
        opacity: 1, cornerRadius: 0,
        name: "Ellipse", visible: true, locked: false,
      });
      return { response: "Added a circle element. Resize and recolor it in the properties panel.", applied: true };
    }
  }

  // ── RESTYLE / COLOR ─────────────────────────────────────────────────────────
  if ((p.includes("restyle") || p.includes("style") || p.includes("color") || p.includes("premium") || p.includes("theme")) && selectedElements.length > 0) {
    const el = selectedElements[0];
    const isVibrant = p.includes("vibrant") || p.includes("bold") || p.includes("bright");
    const isMinimal = p.includes("minimal") || p.includes("clean") || p.includes("simple");
    const fills = isVibrant
      ? ["linear-gradient(135deg, #F59E0B, #EF4444)", "linear-gradient(135deg, #10B981, #3B82F6)", "rgba(239,68,68,0.8)"]
      : isMinimal
      ? ["rgba(255,255,255,0.06)", "rgba(255,255,255,0.04)", "transparent"]
      : ["linear-gradient(135deg, #8B5CF6, #06B6D4)", "rgba(139,92,246,0.25)", "rgba(6,182,212,0.2)"];
    const newFill = fills[Math.floor(Math.random() * fills.length)];
    const newRadius = Math.max(el.cornerRadius, isMinimal ? 8 : 14);
    updateElement(el.id, { fill: newFill, cornerRadius: newRadius });
    return {
      response: `Restyled "${el.name}" — ${isVibrant ? "vibrant" : isMinimal ? "minimal" : "premium"} look.\n\n• **Fill** — ${newFill.startsWith("linear") ? "New gradient applied" : "Refined surface tone"}\n• **Radius** — Updated to ${newRadius}px\n\nCheck the right panel to fine-tune further.`,
      applied: true, hasVariations: true,
    };
  }

  // ── DUPLICATE ───────────────────────────────────────────────────────────────
  if ((p.includes("duplicate") || p.includes("copy")) && selectedElements.length > 0) {
    const el = selectedElements[0];
    addElement({ ...el, x: el.x + 24, y: el.y + 24, name: `${el.name} Copy` });
    return { response: `Duplicated "${el.name}" with a 24px offset.\n\nThe copy is now selected.`, applied: true };
  }

  // ── DELETE ──────────────────────────────────────────────────────────────────
  if ((p.includes("delete") || p.includes("remove")) && selectedElements.length > 0) {
    const names = selectedElements.map((e) => e.name).join(", ");
    deleteSelected();
    return { response: `Deleted ${selectedElements.length > 1 ? `${selectedElements.length} elements` : `"${names}"`}.\n\nUse ⌘Z to undo.`, applied: true };
  }

  // ── TYPOGRAPHY IMPROVEMENTS ─────────────────────────────────────────────────
  if (p.includes("typo") || p.includes("font") || p.includes("text style")) {
    const textEls = selectedElements.filter(e => e.type === "text");
    if (textEls.length > 0) {
      textEls.forEach(el => {
        updateElement(el.id, { fontFamily: "Inter", letterSpacing: -0.02, lineHeight: 1.4 });
      });
      return { response: "Refined typography on selected text elements.\n\n• **Font** — Inter (Premium modern typeface)\n• **Letter spacing** — −0.02em tight tracking\n• **Line height** — 1.4 for readability\n\nApplied to all selected text layers.", applied: true };
    }
  }

  // ── LAYOUT / ALIGN ──────────────────────────────────────────────────────────
  if (p.includes("align") || p.includes("spacing") || p.includes("layout") || p.includes("grid")) {
    if (selectedElements.length >= 2) {
      const els = [...selectedElements].sort((a, b) => a.x - b.x);
      const startX = els[0].x;
      const totalGap = 24;
      let curX = startX;
      els.forEach(el => {
        updateElement(el.id, { x: curX });
        curX += el.width + totalGap;
      });
      return { response: `Distributed ${els.length} elements horizontally with 24px gaps.\n\n• **Starting X** — ${Math.round(startX)}px\n• **Gap** — 24px between each element\n\nUse the position fields to fine-tune individual positions.`, applied: true };
    }
  }

  // ── IMPROVE / ENHANCE ────────────────────────────────────────────────────────
  if (p.includes("improve") || p.includes("enhance") || p.includes("better") || p.includes("refine") || p.includes("polish")) {
    const responses = [
      "Applied visual improvements:\n\n• **Spacing** — 8px grid rhythm applied throughout\n• **Typography** — Scale improved, letter-spacing refined\n• **Depth** — Enhanced layering with subtle shadow\n• **Alignment** — Elements snapped to optical grid\n\nUse ⌘Z to revert if needed.",
      "Here's what I enhanced:\n\n• **Color** — Contrast improved for WCAG AA\n• **Hierarchy** — Strengthened visual flow\n• **Whitespace** — Increased breathing room between sections\n• **Radius** — Corners unified to 12px system\n\n3 style variations are ready to compare.",
    ];
    return { response: responses[Math.floor(Math.random() * responses.length)], applied: true, hasVariations: true };
  }

  // ── VARIATIONS ──────────────────────────────────────────────────────────────
  if (p.includes("variation") || p.includes("version") || p.includes("option") || p.includes("alternative")) {
    return {
      response: "Generated 3 style variations for comparison.\n\n• **V1: Minimal Clean** — Reduced visual weight, more whitespace\n• **V2: Bold & Vibrant** — High contrast, stronger accent usage\n• **V3: Soft Premium** — Glass effects, subtle gradients\n\nClick \"View 3 variations\" to compare and apply.",
      applied: false, hasVariations: true,
    };
  }

  // ── GENERIC FALLBACK ─────────────────────────────────────────────────────────
  const responses = [
    { r: "Here's what I can help with. Try being more specific:\n\n• **\"Add [element]\"** — hero, testimonials, pricing, footer, form, stats, navbar, button, card\n• **\"Restyle [element]\"** — changes fill and styling\n• **\"Duplicate/Delete\"** — on selected elements\n• **\"Align elements\"** — distributes selected horizontally\n• **\"Make responsive/mobile\"** — adds mobile frame\n\nSelect an element first for targeted edits.", applied: false },
    { r: "I understand what you're going for. To apply precisely:\n\n1. Select the specific element you want to change\n2. Tell me what to modify\n3. Or use: \"Add pricing section\" / \"Add testimonials\" / \"Add hero\"\n\nI can also restyle, duplicate, align, or delete selected layers.", applied: false },
  ];
  const r = responses[Math.floor(Math.random() * responses.length)];
  return { response: r.r, applied: r.applied };
}

interface Props {
  onClose: () => void;
}

type ViewMode = "chat" | "variations" | "compare";

export default function AIChatPanel({ onClose }: Props) {
  const { state, addElement, addElements, updateElement, deleteSelected, selectedElements, nextId } = useCanvas();

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "user",
      content: "Make this landing page look more premium and modern",
      timestamp: "2:34 PM",
    },
    {
      id: "2",
      role: "assistant",
      content: "I've refined the landing page with several improvements:\n\n• **Typography** — Increased heading scale, tighter letter-spacing\n• **Spacing** — 8px grid system with generous padding\n• **Colors** — Violet-to-cyan gradient accent system\n• **Depth** — Layered panel shadows and glass effects\n• **Buttons** — Primary gradient with ghost secondary",
      timestamp: "2:34 PM",
      applied: true,
    },
  ]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("chat");
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [activeTarget, setActiveTarget] = useState(0);
  const [compareSlider, setCompareSlider] = useState(50);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isGenerating]);

  const contextLabel =
    selectedElements.length > 0
      ? `"${selectedElements[0].name}"`
      : "Landing Page";

  const addTypingMessage = useCallback((fullContent: string, applied: boolean, hasVariations?: boolean) => {
    const msgId = String(Date.now());
    setMessages((prev) => [
      ...prev,
      {
        id: msgId,
        role: "assistant",
        content: "",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        applied,
        hasVariations,
      },
    ]);

    let i = 0;
    const timer = setInterval(() => {
      i += 4;
      setMessages((prev) =>
        prev.map((m) =>
          m.id === msgId ? { ...m, content: fullContent.slice(0, i) } : m
        )
      );
      if (i >= fullContent.length) {
        clearInterval(timer);
        setMessages((prev) =>
          prev.map((m) => (m.id === msgId ? { ...m, content: fullContent } : m))
        );
        setIsGenerating(false);
      }
    }, 18);
  }, []);

  const handleSend = useCallback((text?: string) => {
    const content = (text || input).trim();
    if (!content) return;

    const userMsg: Message = {
      id: String(Date.now()),
      role: "user",
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsGenerating(true);
    setShowQuickActions(false);

    setTimeout(() => {
      const { response, applied, hasVariations } = processAICommand(
        content,
        selectedElements,
        addElement,
        addElements,
        updateElement,
        deleteSelected,
        nextId,
      );
      addTypingMessage(response, applied, hasVariations);
    }, 700 + Math.random() * 500);
  }, [input, selectedElements, addElement, addElements, updateElement, deleteSelected, nextId, addTypingMessage]);

  return (
    <aside className="w-[340px] border-l border-border bg-card flex flex-col shrink-0 animate-slide-in-right relative z-20">
      {/* Glowing top accent */}
      <div className="absolute top-0 left-0 right-0 h-px nova-gradient opacity-60" />

      {/* Header */}
      <div className="px-4 py-3 border-b border-border">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg nova-gradient flex items-center justify-center shadow-lg shadow-primary/20">
              <Sparkles className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <div>
              <span className="text-sm font-semibold">Nova AI</span>
              <div className="flex items-center gap-1 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-glow-pulse" />
                <span className="text-[10px] text-muted-foreground">Active · {state.elements.length} elements</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant={viewMode === "chat" ? "secondary" : "ghost"} size="icon" className="h-7 w-7" onClick={() => setViewMode("chat")} title="Chat">
              <Sparkles className="w-3 h-3" />
            </Button>
            <Button variant={viewMode === "variations" ? "secondary" : "ghost"} size="icon" className="h-7 w-7" onClick={() => setViewMode("variations")} title="Variations">
              <Copy className="w-3 h-3" />
            </Button>
            <Button variant={viewMode === "compare" ? "secondary" : "ghost"} size="icon" className="h-7 w-7" onClick={() => setViewMode("compare")} title="Before/After">
              <ArrowLeftRight className="w-3 h-3" />
            </Button>
            <div className="w-px h-4 bg-border mx-0.5" />
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
              <X className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* Context targeting */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-secondary/30">
          {contextTargets.map((target, i) => (
            <button
              key={target.label}
              onClick={() => setActiveTarget(i)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[10px] font-medium transition-all flex-1 justify-center ${
                activeTarget === i
                  ? "bg-primary/15 text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <target.icon className="w-3 h-3" />
              {target.label}
            </button>
          ))}
        </div>

        {/* Context badge */}
        <div className="flex items-center gap-1.5 mt-2 px-2 py-1.5 rounded-lg bg-secondary/20 border border-border/50">
          <Frame className="w-3 h-3 text-primary" />
          <span className="text-[10px] text-muted-foreground">Context:</span>
          <span className="text-[10px] text-primary font-medium truncate">{contextLabel}</span>
          {selectedElements.length > 0 && (
            <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">
              {selectedElements[0].type}
            </span>
          )}
        </div>
      </div>

      {/* Chat view */}
      {viewMode === "chat" && (
        <>
          <div className="flex-1 overflow-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`${msg.role === "user" ? "flex justify-end" : ""} animate-fade-in`}>
                <div
                  className={`max-w-[92%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                    msg.role === "user"
                      ? "bg-primary/15 text-foreground ml-4 rounded-br-sm"
                      : "bg-secondary/40 border border-border/50 text-foreground rounded-bl-sm"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <div className="space-y-1.5">
                      {msg.content.split("\n").map((line, i) => {
                        if (!line.trim()) return null;
                        const boldMatch = line.match(/^• \*\*(.*?)\*\* — (.*)/);
                        if (boldMatch) {
                          return (
                            <p key={i} className="flex items-start gap-1.5">
                              <span className="w-1 h-1 rounded-full bg-primary mt-1.5 shrink-0" />
                              <span>
                                <strong className="text-foreground">{boldMatch[1]}</strong>{" "}
                                <span className="text-muted-foreground">— {boldMatch[2]}</span>
                              </span>
                            </p>
                          );
                        }
                        if (line.match(/^\d+\./)) {
                          return <p key={i} className="text-muted-foreground pl-1">{line}</p>;
                        }
                        return <p key={i} className="leading-relaxed">{line}</p>;
                      })}

                      {msg.applied && (
                        <div className="mt-3 pt-3 border-t border-border/50 space-y-2">
                          <div className="flex items-center gap-1.5">
                            <Button size="sm" className="h-6 text-[10px] px-2.5 nova-gradient border-0 text-primary-foreground">
                              <Check className="w-3 h-3 mr-1" /> Accept
                            </Button>
                            <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2">
                              <Undo2 className="w-3 h-3 mr-1" /> Revert
                            </Button>
                            <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2">
                              <RotateCcw className="w-3 h-3 mr-1" /> Retry
                            </Button>
                          </div>
                          {msg.hasVariations && (
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => setViewMode("variations")}
                                className="flex items-center gap-1 px-2 py-1 rounded-md bg-primary/10 text-[10px] text-primary hover:bg-primary/15 transition-colors"
                              >
                                <Copy className="w-3 h-3" /> View 3 variations
                              </button>
                              <button
                                onClick={() => setViewMode("compare")}
                                className="flex items-center gap-1 px-2 py-1 rounded-md bg-secondary/50 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                              >
                                <ArrowLeftRight className="w-3 h-3" /> Before / After
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    msg.content
                  )}
                </div>
                <div className={`text-[9px] text-muted-foreground mt-1 px-1 ${msg.role === "user" ? "text-right" : ""}`}>
                  {msg.timestamp}
                </div>
              </div>
            ))}

            {isGenerating && (
              <div className="space-y-2 animate-fade-in">
                <div className="flex items-center gap-2 text-[10px] text-primary">
                  <Sparkles className="w-3 h-3 animate-glow-pulse" />
                  Nova is thinking...
                </div>
                <div className="h-1 rounded-full overflow-hidden bg-secondary">
                  <div className="h-full nova-gradient animate-shimmer rounded-full" style={{ backgroundSize: "200% 100%", width: "70%" }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick actions */}
          {showQuickActions && (
            <div className="border-t border-border bg-card/95 p-3 animate-fade-in">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Quick Actions</span>
                <button onClick={() => setShowQuickActions(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-3 h-3" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {quickActions.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => { setShowQuickActions(false); handleSend(action.prompt); }}
                    className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-secondary/30 border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all text-left group"
                  >
                    <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors shrink-0">
                      <action.icon className="w-3 h-3 text-primary" />
                    </div>
                    <div>
                      <div className="text-[10px] font-medium text-foreground">{action.label}</div>
                      <div className="text-[9px] text-muted-foreground">{action.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Suggestion pills */}
          {!showQuickActions && (
            <div className="px-4 pb-2">
              <div className="flex flex-wrap gap-1.5">
                {aiSuggestions.slice(0, 4).map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSend(s)}
                    className="px-2.5 py-1.5 rounded-full bg-secondary/40 border border-border/50 text-[10px] text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-primary/5 transition-all"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-3 border-t border-border">
            <div className="flex items-center gap-2 rounded-xl bg-secondary/20 border border-border/50 px-3 py-2.5 focus-within:border-primary/40 focus-within:shadow-[0_0_0_3px_hsl(263_70%_58%/0.08)] transition-all">
              <button
                onClick={() => setShowQuickActions(!showQuickActions)}
                className={`p-1 rounded-md transition-colors shrink-0 ${showQuickActions ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-primary hover:bg-primary/10"}`}
                title="Quick actions"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
              </button>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                placeholder={selectedElements.length > 0 ? `Edit "${selectedElements[0].name}"...` : "Ask Nova to design something..."}
                className="flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground"
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isGenerating}
                className="p-1.5 rounded-lg nova-gradient text-primary-foreground disabled:opacity-30 transition-all hover:shadow-md hover:shadow-primary/20 disabled:bg-none disabled:text-muted-foreground"
              >
                <Send className="w-3 h-3" />
              </button>
            </div>
            <div className="flex items-center justify-center gap-3 mt-2">
              <span className="text-[9px] text-muted-foreground">⌘K Command</span>
              <span className="text-[9px] text-muted-foreground">Tab Quick actions</span>
            </div>
          </div>
        </>
      )}

      {/* Variations view */}
      {viewMode === "variations" && (
        <div className="flex-1 overflow-auto p-4 space-y-3 animate-fade-in">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium">3 Variations Generated</span>
            <button onClick={() => setViewMode("chat")} className="text-[10px] text-primary hover:underline flex items-center gap-1">
              <ChevronRight className="w-3 h-3" /> Back to chat
            </button>
          </div>
          {[
            { label: "Minimal Clean", desc: "Reduced visual weight, generous whitespace, refined typography" },
            { label: "Bold & Vibrant", desc: "Strong contrast, saturated accents, impactful hierarchy" },
            { label: "Soft Premium", desc: "Glass effects, subtle gradients, elegant depth layers" },
          ].map((variation, i) => (
            <div
              key={i}
              className={`rounded-xl border transition-all cursor-pointer group ${
                i === 0
                  ? "border-primary/40 bg-primary/5 shadow-lg shadow-primary/5"
                  : "border-border/50 bg-secondary/20 hover:border-primary/20 hover:bg-primary/5"
              }`}
            >
              <div className="h-28 rounded-t-xl nova-dot-grid relative overflow-hidden m-1.5 mb-0 rounded-b-none">
                <div className="absolute inset-3 rounded-lg bg-card/80 backdrop-blur-sm border border-border/50 flex flex-col items-center justify-center gap-1.5">
                  <div className={`w-20 h-2.5 rounded ${i === 0 ? "bg-foreground/15" : i === 1 ? "bg-primary/30" : "bg-foreground/10"}`} />
                  <div className={`w-14 h-1.5 rounded ${i === 0 ? "bg-foreground/10" : i === 1 ? "bg-primary/20" : "bg-foreground/8"}`} />
                  <div className={`w-12 h-5 rounded-md mt-1 ${i === 0 ? "bg-foreground/15" : i === 1 ? "nova-gradient" : "bg-primary/20"}`} />
                </div>
                {i === 0 && <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md bg-primary/20 text-[8px] text-primary font-medium">Selected</div>}
              </div>
              <div className="p-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium">{variation.label}</span>
                  <span className="text-[10px] text-muted-foreground">V{i + 1}</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5">{variation.desc}</p>
                <div className="flex items-center gap-1.5 mt-2">
                  <Button size="sm" className={`h-6 text-[10px] px-2.5 ${i === 0 ? "nova-gradient border-0 text-primary-foreground" : ""}`} variant={i === 0 ? "default" : "outline"}>
                    {i === 0 ? <><Check className="w-3 h-3 mr-1" /> Applied</> : "Apply"}
                  </Button>
                  <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2">
                    <RotateCcw className="w-3 h-3 mr-1" /> Regen
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Compare view */}
      {viewMode === "compare" && (
        <div className="flex-1 overflow-auto p-4 space-y-4 animate-fade-in">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium">Before / After</span>
            <button onClick={() => setViewMode("chat")} className="text-[10px] text-primary hover:underline flex items-center gap-1">
              <ChevronRight className="w-3 h-3" /> Back
            </button>
          </div>

          <div className="rounded-xl border border-border overflow-hidden relative h-52">
            <div className="absolute inset-0 nova-dot-grid">
              <div className="absolute inset-4 rounded-lg bg-card/60 border border-border/30 flex flex-col items-center justify-center gap-2">
                <div className="w-24 h-3 rounded bg-foreground/10" />
                <div className="w-16 h-2 rounded bg-foreground/8" />
                <div className="w-14 h-6 rounded bg-muted/50 mt-1" />
                <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[8px] bg-secondary text-muted-foreground">Before</div>
              </div>
            </div>
            <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 ${100 - compareSlider}% 0 0)` }}>
              <div className="absolute inset-0 nova-dot-grid">
                <div className="absolute inset-4 rounded-lg bg-card/80 backdrop-blur-sm border border-primary/20 flex flex-col items-center justify-center gap-2 shadow-lg shadow-primary/5">
                  <div className="w-28 h-4 rounded bg-foreground/20" />
                  <div className="w-20 h-2 rounded bg-foreground/12" />
                  <div className="w-16 h-7 rounded-lg nova-gradient mt-1" />
                  <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[8px] bg-primary/20 text-primary font-medium">After</div>
                </div>
              </div>
            </div>
            <div className="absolute top-0 bottom-0 w-0.5 bg-primary z-10 cursor-col-resize" style={{ left: `${compareSlider}%` }}>
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-primary border-2 border-primary-foreground shadow-lg flex items-center justify-center">
                <ArrowLeftRight className="w-3 h-3 text-primary-foreground" />
              </div>
            </div>
            <input type="range" min={0} max={100} value={compareSlider} onChange={(e) => setCompareSlider(Number(e.target.value))} className="absolute inset-0 w-full h-full opacity-0 cursor-col-resize z-20" />
          </div>

          <div className="rounded-xl border border-border bg-secondary/20 p-3 space-y-2">
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Changes Applied</span>
            {[
              { prop: "Heading size", from: "32px", to: "64px" },
              { prop: "Spacing", from: "16px", to: "24px" },
              { prop: "Corner radius", from: "4px", to: "14px" },
              { prop: "Shadow", from: "none", to: "lg/primary" },
              { prop: "Accent", from: "#666", to: "violet-500" },
            ].map((change) => (
              <div key={change.prop} className="flex items-center justify-between text-[10px]">
                <span className="text-muted-foreground">{change.prop}</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-muted-foreground/60 line-through font-mono">{change.from}</span>
                  <span className="text-foreground">→</span>
                  <span className="text-primary font-mono">{change.to}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" className="flex-1 h-8 nova-gradient border-0 text-primary-foreground text-xs">
              <Check className="w-3.5 h-3.5 mr-1.5" /> Accept
            </Button>
            <Button variant="outline" size="sm" className="h-8 text-xs border-border">
              <Undo2 className="w-3.5 h-3.5 mr-1.5" /> Revert
            </Button>
          </div>
        </div>
      )}
    </aside>
  );
}
