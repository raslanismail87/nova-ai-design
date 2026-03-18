export const sampleProjects = [
  {
    id: "1",
    name: "Fintech Mobile App",
    thumbnail: "fintech",
    updatedAt: "2 hours ago",
    collaborators: ["A", "M", "S"],
    screens: 12,
    aiGenerated: false,
  },
  {
    id: "2",
    name: "AI Assistant Dashboard",
    thumbnail: "ai-dashboard",
    updatedAt: "5 hours ago",
    collaborators: ["J", "K"],
    screens: 8,
    aiGenerated: true,
  },
  {
    id: "3",
    name: "Creator Marketplace",
    thumbnail: "marketplace",
    updatedAt: "1 day ago",
    collaborators: ["A", "R", "T", "N"],
    screens: 15,
    aiGenerated: false,
  },
  {
    id: "4",
    name: "Analytics Redesign",
    thumbnail: "analytics",
    updatedAt: "2 days ago",
    collaborators: ["M"],
    screens: 6,
    aiGenerated: true,
  },
  {
    id: "5",
    name: "E-commerce Checkout Flow",
    thumbnail: "ecommerce",
    updatedAt: "3 days ago",
    collaborators: ["A", "S"],
    screens: 9,
    aiGenerated: false,
  },
];

export const sampleLayers = [
  {
    id: "frame-hero",
    name: "Hero Section",
    type: "frame" as const,
    visible: true,
    locked: false,
    children: [
      { id: "nav-bar", name: "Navigation", type: "group" as const, visible: true, locked: false, children: [
        { id: "logo", name: "Logo", type: "component" as const, visible: true, locked: false },
        { id: "nav-links", name: "Nav Links", type: "group" as const, visible: true, locked: false, children: [
          { id: "link-1", name: "Features", type: "text" as const, visible: true, locked: false },
          { id: "link-2", name: "Pricing", type: "text" as const, visible: true, locked: false },
          { id: "link-3", name: "About", type: "text" as const, visible: true, locked: false },
        ]},
        { id: "cta-btn", name: "CTA Button", type: "component" as const, visible: true, locked: false },
      ]},
      { id: "hero-content", name: "Hero Content", type: "group" as const, visible: true, locked: false, children: [
        { id: "headline", name: "Headline", type: "text" as const, visible: true, locked: false },
        { id: "subhead", name: "Subheadline", type: "text" as const, visible: true, locked: false },
        { id: "hero-cta", name: "Get Started Button", type: "component" as const, visible: true, locked: false },
        { id: "hero-img", name: "Hero Image", type: "image" as const, visible: true, locked: false },
      ]},
    ],
  },
  {
    id: "frame-features",
    name: "Features Section",
    type: "frame" as const,
    visible: true,
    locked: false,
    children: [
      { id: "section-title", name: "Section Title", type: "text" as const, visible: true, locked: false },
      { id: "feature-grid", name: "Feature Grid", type: "group" as const, visible: true, locked: false, children: [
        { id: "card-1", name: "Feature Card 1", type: "component" as const, visible: true, locked: false },
        { id: "card-2", name: "Feature Card 2", type: "component" as const, visible: true, locked: false },
        { id: "card-3", name: "Feature Card 3", type: "component" as const, visible: true, locked: false },
      ]},
    ],
  },
  {
    id: "frame-pricing",
    name: "Pricing Section",
    type: "frame" as const,
    visible: false,
    locked: true,
    children: [
      { id: "pricing-title", name: "Pricing Title", type: "text" as const, visible: true, locked: false },
      { id: "pricing-cards", name: "Pricing Cards", type: "group" as const, visible: true, locked: false },
    ],
  },
];

export const sampleChatMessages = [
  {
    id: "1",
    role: "user" as const,
    content: "Make this landing page look more premium and modern",
    timestamp: "2:34 PM",
  },
  {
    id: "2",
    role: "assistant" as const,
    content: "I've refined the landing page with several improvements:\n\n• **Typography** — Increased heading scale, added tighter letter-spacing\n• **Spacing** — Applied 8px grid system with more generous padding\n• **Colors** — Introduced a softer accent system with violet-to-cyan gradients\n• **Depth** — Added layered panel shadows and subtle glass effects\n• **Buttons** — Refined hierarchy with primary gradient and ghost secondary",
    timestamp: "2:34 PM",
    applied: true,
  },
  {
    id: "3",
    role: "user" as const,
    content: "Add a testimonial section under the hero",
    timestamp: "2:36 PM",
  },
  {
    id: "4",
    role: "assistant" as const,
    content: "Done! I've added a 3-card testimonial section that matches the existing design language. Each card includes:\n\n• Avatar and name\n• Role and company\n• Quote with refined typography\n• Subtle glass card styling\n\nThe section sits between the hero and features, with proper spacing.",
    timestamp: "2:36 PM",
    applied: true,
  },
];

export const aiSuggestions = [
  "Clean up spacing",
  "Generate dark mode",
  "Make responsive",
  "Add testimonials",
  "Improve hierarchy",
  "Simplify layout",
  "Create variations",
  "Restyle premium",
];

export const editorTools = [
  { id: "move", label: "Move", shortcut: "V", icon: "MousePointer2" },
  { id: "frame", label: "Frame", shortcut: "F", icon: "Frame" },
  { id: "rectangle", label: "Rectangle", shortcut: "R", icon: "Square" },
  { id: "ellipse", label: "Ellipse", shortcut: "O", icon: "Circle" },
  { id: "line", label: "Line", shortcut: "L", icon: "Minus" },
  { id: "pen", label: "Pen", shortcut: "P", icon: "Pen" },
  { id: "text", label: "Text", shortcut: "T", icon: "Type" },
  { id: "image", label: "Image", shortcut: "I", icon: "Image" },
  { id: "comment", label: "Comment", shortcut: "C", icon: "MessageSquare" },
  { id: "hand", label: "Hand", shortcut: "H", icon: "Hand" },
] as const;

export const templateCategories = [
  "All", "Landing Pages", "Dashboards", "Mobile Apps", "E-commerce", "SaaS", "Portfolio",
];

export const templates = [
  { id: "t1", name: "SaaS Landing", category: "Landing Pages", screens: 4 },
  { id: "t2", name: "Admin Dashboard", category: "Dashboards", screens: 8 },
  { id: "t3", name: "Social App", category: "Mobile Apps", screens: 12 },
  { id: "t4", name: "Product Store", category: "E-commerce", screens: 6 },
  { id: "t5", name: "AI Platform", category: "SaaS", screens: 5 },
  { id: "t6", name: "Creative Portfolio", category: "Portfolio", screens: 3 },
];
