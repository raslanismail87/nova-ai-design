

# Nova Studio — AI-Native UI/UX Design Workspace

## Overview
A premium, dark-themed, browser-based design tool where AI is a first-class citizen. The app will be built as a realistic, polished demo with mock data and believable interactions across 6 main screens.

---

## Screen 1: Landing / Authentication
- Dark hero section with H1: "Design at the speed of thought."
- Wide AI prompt input field as the hero CTA
- Background video-style animation of canvas elements assembling
- Minimalist auth card with Google/GitHub social login buttons (`bg-white/5`)
- Product tagline: "Nova isn't a tool you use. It's a partner you direct."
- Glassmorphic card styling with `backdrop-blur` and subtle inner strokes

## Screen 2: Dashboard / Workspace
- **Left sidebar** (240px, `bg-[#09090b]`): Recent, Drafts, Team Library, AI Generations nav
- **Project grid**: 16:9 cards with live preview thumbnails, collaborator avatars, timestamps
- Pre-populated with 5 sample projects (Fintech Mobile App, AI Assistant Dashboard, Creator Marketplace, Analytics Redesign, E-commerce Checkout Flow)
- Two-button CTA group: `[ + New File ]` (secondary) and `[ ✨ Start with AI ]` (violet primary)
- AI-generated projects marked with glowing violet dot badge
- Search bar, workspace switcher, templates section

## Screen 3: Main Editor (Centerpiece)
- **Top toolbar** (48px, translucent): Breadcrumbs left, tool switcher center (V/F/R/O/T/P icons), Share/Present/AI toggle right
- **Left sidebar** (280px): Pages list, layer tree with nested groups, assets panel, components library. Hover-reveal visibility/lock icons
- **Canvas** (`#121214` with dot grid): Pre-loaded sample artboard (e.g., a landing page design). Zoom controls, rulers, frame selection outlines with violet highlight
- **Right sidebar** (300px): Segmented `Design | Prototype | Inspect` tabs. Property inputs (X/Y/W/H) in monospace with scrubbable labels. Fill, stroke, shadow, typography, spacing, corner radius, export controls
- Realistic mock layer names, component instances, and design tokens
- Smart guides and snapping indicators (visual only)

## Screen 4: AI Chat Panel (Core Feature)
- 320px panel sliding from right, pushing properties panel
- Context header: `Context: Frame "Landing Page"`
- Conversational chat UI with markdown rendering
- Suggested action pills: `Clean up spacing`, `Generate Dark Mode`, `Make Responsive`, `Add Testimonials`
- Bottom-docked expanding text input: `[ Command Nova... ]`
- Pre-populated example conversation showing user prompts and AI responses with applied changes
- "Ghost Mode" diff view: Accept / Reject / Regenerate controls
- AI progress indicator: gradient line (`violet → cyan`) during generation
- History of AI edits with one-click revert

## Screen 5: AI Generation Flow
- Full-screen modal with blurred background triggered by "Start with AI"
- Step 1: "What are we building?" — text input with example suggestions
- Step 2: "Choose a visual direction" — 3 generated moodboard cards (Minimalist, High-Contrast, Glassmorphism)
- Step 3: "Generating..." — animated progress with artboards materializing (scale 0.95→1, opacity 0→1)

## Screen 6: Prototype & Collaboration
- Prototype mode: visual connectors between screens, interaction mapping panel, flow start indicator, preview/present button
- Collaboration: comment pins on canvas, collaborator presence avatars with colored rings, activity feed panel, version history with AI actions logged, share modal with permission controls

## Design System & Tokens
- Color palette: Deep Graphite background, Charcoal panels, Electric Violet primary, Cyan accent, subtle white borders
- Typography: Geist Sans (UI), Geist Mono (values/coordinates). Scale: 11/13/18/48px
- Motion: 200ms panel toggles, 400ms AI shifts, custom cubic-bezier(0.2, 0, 0, 1)
- Depth: Layered shadows, backdrop-blur(20px), inner strokes — no solid borders
- 8px spacing grid, 10-16px corner radius
- Auto-hiding thin scrollbars (`bg-white/10`)

## Technical Approach
- All screens as React routes with shared layout components
- Mock data for projects, layers, chat history, templates
- State management for panel toggles, tool selection, layer selection, AI chat
- Canvas implemented as a styled div with positioned mock elements (not a full rendering engine)
- Responsive desktop-first layout
- Smooth transitions and micro-interactions throughout

