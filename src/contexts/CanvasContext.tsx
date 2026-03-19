import React, { createContext, useContext, useReducer, useCallback, useRef } from "react";

export type ElementType = "rectangle" | "ellipse" | "text" | "frame" | "line" | "image";

export interface CanvasElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
  opacity: number;
  cornerRadius: number;
  name: string;
  visible: boolean;
  locked: boolean;
  // Text
  textContent?: string;
  fontSize?: number;
  fontWeight?: string;
  fontFamily?: string;
  textAlign?: "left" | "center" | "right";
  lineHeight?: number;
  letterSpacing?: number;
  // Frame / group
  parentId?: string;
  isFrame?: boolean;
  // Effects
  shadowColor?: string;
  shadowX?: number;
  shadowY?: number;
  shadowBlur?: number;
  shadowSpread?: number;
  blur?: number;
  // Prototype
  linkTo?: string; // page name to navigate to on click
  protoInteractions?: { id: string; trigger: string; dest: string; animation: string; duration: number }[];
  protoAnimation?: string;
  protoAnimDuration?: number;
  // Stroke position
  strokePosition?: "inside" | "center" | "outside";
}

export interface PageState {
  id: string;
  name: string;
  elements: CanvasElement[];
}

interface CanvasState {
  elements: CanvasElement[];
  selectedIds: string[];
  activeTool: string;
  zoom: number;
  panX: number;
  panY: number;
  artboardWidth: number;
  artboardHeight: number;
  artboardName: string;
  past: CanvasElement[][];
  future: CanvasElement[][];
  showGrid: boolean;
  showRulers: boolean;
  clipboard: CanvasElement[];
  pages: PageState[];
  currentPageId: string;
}

type CanvasAction =
  | { type: "SET_TOOL"; tool: string }
  | { type: "ADD_ELEMENT"; element: CanvasElement }
  | { type: "ADD_ELEMENTS"; elements: CanvasElement[] }
  | { type: "UPDATE_ELEMENT"; id: string; updates: Partial<CanvasElement> }
  | { type: "DELETE_ELEMENTS"; ids: string[] }
  | { type: "SELECT"; ids: string[] }
  | { type: "SET_ZOOM"; zoom: number }
  | { type: "SET_PAN"; panX: number; panY: number }
  | { type: "UNDO" }
  | { type: "REDO" }
  | { type: "REORDER"; id: string; direction: "up" | "down" | "top" | "bottom" }
  | { type: "TOGGLE_VISIBLE"; id: string }
  | { type: "TOGGLE_LOCK"; id: string }
  | { type: "SET_ARTBOARD_NAME"; name: string }
  | { type: "SET_ARTBOARD_SIZE"; width: number; height: number }
  | { type: "TOGGLE_GRID" }
  | { type: "LOAD_ELEMENTS"; elements: CanvasElement[] }
  | { type: "COPY_ELEMENTS"; ids: string[] }
  | { type: "PASTE_ELEMENTS"; offsetX?: number; offsetY?: number }
  | { type: "DUPLICATE_ELEMENTS"; ids: string[] }
  | { type: "ADD_PAGE"; page: PageState }
  | { type: "REMOVE_PAGE"; id: string }
  | { type: "RENAME_PAGE"; id: string; name: string }
  | { type: "SWITCH_PAGE"; id: string }
  | { type: "LOAD_ALL_PAGES"; pages: PageState[]; currentPageId: string };

const MAX_HISTORY = 50;

function pushHistory(past: CanvasElement[][], elements: CanvasElement[]): CanvasElement[][] {
  const next = [...past, elements];
  return next.length > MAX_HISTORY ? next.slice(next.length - MAX_HISTORY) : next;
}

let globalIdCounter = 2000;
function makeId() {
  globalIdCounter += 1;
  return `el-${globalIdCounter}`;
}

function canvasReducer(state: CanvasState, action: CanvasAction): CanvasState {
  switch (action.type) {
    case "SET_TOOL":
      return { ...state, activeTool: action.tool, selectedIds: [] };

    case "ADD_ELEMENT":
      return {
        ...state,
        elements: [...state.elements, action.element],
        selectedIds: [action.element.id],
        past: pushHistory(state.past, state.elements),
        future: [],
      };

    case "ADD_ELEMENTS":
      return {
        ...state,
        elements: [...state.elements, ...action.elements],
        selectedIds: action.elements.map((e) => e.id),
        past: pushHistory(state.past, state.elements),
        future: [],
      };

    case "UPDATE_ELEMENT": {
      const elements = state.elements.map((el) =>
        el.id === action.id ? { ...el, ...action.updates } : el
      );
      return {
        ...state,
        elements,
        past: pushHistory(state.past, state.elements),
        future: [],
      };
    }

    case "DELETE_ELEMENTS": {
      const ids = new Set(action.ids);
      return {
        ...state,
        elements: state.elements.filter((el) => !ids.has(el.id)),
        selectedIds: state.selectedIds.filter((id) => !ids.has(id)),
        past: pushHistory(state.past, state.elements),
        future: [],
      };
    }

    case "SELECT":
      return { ...state, selectedIds: action.ids };

    case "SET_ZOOM":
      return { ...state, zoom: Math.max(10, Math.min(500, action.zoom)) };

    case "SET_PAN":
      return { ...state, panX: action.panX, panY: action.panY };

    case "UNDO": {
      if (state.past.length === 0) return state;
      const past = [...state.past];
      const prev = past.pop()!;
      return {
        ...state,
        elements: prev,
        past,
        future: [state.elements, ...state.future],
        selectedIds: [],
      };
    }

    case "REDO": {
      if (state.future.length === 0) return state;
      const [next, ...future] = state.future;
      return {
        ...state,
        elements: next,
        past: pushHistory(state.past, state.elements),
        future,
        selectedIds: [],
      };
    }

    case "REORDER": {
      const idx = state.elements.findIndex((el) => el.id === action.id);
      if (idx === -1) return state;
      const els = [...state.elements];
      const [el] = els.splice(idx, 1);
      if (action.direction === "up" && idx < els.length) els.splice(idx + 1, 0, el);
      else if (action.direction === "down" && idx > 0) els.splice(idx - 1, 0, el);
      else if (action.direction === "top") els.push(el);
      else els.unshift(el);
      return { ...state, elements: els };
    }

    case "TOGGLE_VISIBLE":
      return {
        ...state,
        elements: state.elements.map((el) =>
          el.id === action.id ? { ...el, visible: !el.visible } : el
        ),
      };

    case "TOGGLE_LOCK":
      return {
        ...state,
        elements: state.elements.map((el) =>
          el.id === action.id ? { ...el, locked: !el.locked } : el
        ),
      };

    case "SET_ARTBOARD_NAME":
      return { ...state, artboardName: action.name };

    case "SET_ARTBOARD_SIZE":
      return { ...state, artboardWidth: action.width, artboardHeight: action.height };

    case "TOGGLE_GRID":
      return { ...state, showGrid: !state.showGrid };

    case "LOAD_ELEMENTS":
      return {
        ...state,
        elements: action.elements,
        selectedIds: [],
        past: [],
        future: [],
      };

    case "COPY_ELEMENTS": {
      const ids = new Set(action.ids);
      const copied = state.elements.filter((el) => ids.has(el.id));
      return { ...state, clipboard: copied };
    }

    case "PASTE_ELEMENTS": {
      if (state.clipboard.length === 0) return state;
      const offsetX = action.offsetX ?? 24;
      const offsetY = action.offsetY ?? 24;
      const newEls = state.clipboard.map((el) => ({
        ...el,
        id: makeId(),
        x: el.x + offsetX,
        y: el.y + offsetY,
        name: `${el.name} Copy`,
      }));
      return {
        ...state,
        elements: [...state.elements, ...newEls],
        selectedIds: newEls.map((e) => e.id),
        past: pushHistory(state.past, state.elements),
        future: [],
      };
    }

    case "DUPLICATE_ELEMENTS": {
      const ids = new Set(action.ids);
      const toDup = state.elements.filter((el) => ids.has(el.id));
      const newEls = toDup.map((el) => ({
        ...el,
        id: makeId(),
        x: el.x + 24,
        y: el.y + 24,
        name: `${el.name} Copy`,
      }));
      return {
        ...state,
        elements: [...state.elements, ...newEls],
        selectedIds: newEls.map((e) => e.id),
        past: pushHistory(state.past, state.elements),
        future: [],
      };
    }

    case "ADD_PAGE": {
      // Save current page elements first
      const updatedPages = state.pages.map((p) =>
        p.id === state.currentPageId ? { ...p, elements: state.elements } : p
      );
      return {
        ...state,
        pages: [...updatedPages, action.page],
        elements: action.page.elements,
        currentPageId: action.page.id,
        selectedIds: [],
        past: [],
        future: [],
      };
    }

    case "REMOVE_PAGE": {
      if (state.pages.length <= 1) return state;
      const remaining = state.pages.filter((p) => p.id !== action.id);
      const newCurrent = state.currentPageId === action.id ? remaining[0] : state.pages.find(p => p.id === state.currentPageId)!;
      return {
        ...state,
        pages: remaining,
        currentPageId: newCurrent.id,
        elements: newCurrent.elements,
        selectedIds: [],
        past: [],
        future: [],
      };
    }

    case "RENAME_PAGE":
      return {
        ...state,
        pages: state.pages.map((p) => p.id === action.id ? { ...p, name: action.name } : p),
        artboardName: state.currentPageId === action.id ? action.name : state.artboardName,
      };

    case "SWITCH_PAGE": {
      if (action.id === state.currentPageId) return state;
      // Save current page elements
      const updatedPages = state.pages.map((p) =>
        p.id === state.currentPageId ? { ...p, elements: state.elements } : p
      );
      const targetPage = updatedPages.find((p) => p.id === action.id);
      if (!targetPage) return state;
      return {
        ...state,
        pages: updatedPages,
        elements: targetPage.elements,
        currentPageId: action.id,
        artboardName: targetPage.name,
        selectedIds: [],
        past: [],
        future: [],
      };
    }

    case "LOAD_ALL_PAGES": {
      const currentPage = action.pages.find(p => p.id === action.currentPageId) || action.pages[0];
      return {
        ...state,
        pages: action.pages,
        currentPageId: currentPage.id,
        elements: currentPage.elements,
        artboardName: currentPage.name,
        selectedIds: [],
        past: [],
        future: [],
      };
    }

    default:
      return state;
  }
}

// Default initial elements (landing page design)
const defaultElements: CanvasElement[] = [
  // Navigation frame
  {
    id: "nav-frame",
    type: "frame",
    isFrame: true,
    x: 0, y: 0, width: 1280, height: 72,
    rotation: 0, fill: "rgba(15,15,20,0.95)", stroke: "rgba(255,255,255,0.08)", strokeWidth: 1,
    opacity: 1, cornerRadius: 0, name: "Navigation", visible: true, locked: false,
  },
  // Logo
  {
    id: "logo-mark",
    type: "rectangle",
    x: 32, y: 22, width: 28, height: 28,
    rotation: 0, fill: "linear-gradient(135deg, #8B5CF6, #06B6D4)", stroke: "", strokeWidth: 0,
    opacity: 1, cornerRadius: 8, name: "Logo Mark", visible: true, locked: false,
  },
  // Nav CTA Button
  {
    id: "nav-cta",
    type: "rectangle",
    x: 1152, y: 20, width: 96, height: 32,
    rotation: 0, fill: "linear-gradient(135deg, #8B5CF6, #06B6D4)", stroke: "", strokeWidth: 0,
    opacity: 1, cornerRadius: 10, name: "Get Started", visible: true, locked: false,
  },
  // Hero section
  {
    id: "hero-frame",
    type: "frame",
    isFrame: true,
    x: 0, y: 72, width: 1280, height: 480,
    rotation: 0, fill: "rgba(10,10,15,1)", stroke: "", strokeWidth: 0,
    opacity: 1, cornerRadius: 0, name: "Hero Section", visible: true, locked: false,
  },
  // Headline text
  {
    id: "headline",
    type: "text",
    x: 64, y: 160, width: 520, height: 120,
    rotation: 0, fill: "#F2F2F2", stroke: "", strokeWidth: 0,
    opacity: 1, cornerRadius: 0, name: "Headline",
    textContent: "Design with AI.", fontSize: 64, fontWeight: "700", fontFamily: "Inter",
    textAlign: "left", lineHeight: 1.1, letterSpacing: -0.03,
    visible: true, locked: false,
  },
  // Subheadline
  {
    id: "subheadline",
    type: "text",
    x: 64, y: 296, width: 480, height: 60,
    rotation: 0, fill: "#999", stroke: "", strokeWidth: 0,
    opacity: 1, cornerRadius: 0, name: "Subheadline",
    textContent: "Create interfaces by editing visually or chatting naturally with AI.", fontSize: 18, fontWeight: "400", fontFamily: "Inter",
    textAlign: "left", lineHeight: 1.5, letterSpacing: 0,
    visible: true, locked: false,
  },
  // CTA Button
  {
    id: "hero-cta",
    type: "rectangle",
    x: 64, y: 380, width: 180, height: 52,
    rotation: 0, fill: "linear-gradient(135deg, #8B5CF6, #06B6D4)", stroke: "", strokeWidth: 0,
    opacity: 1, cornerRadius: 14, name: "Get Started Button", visible: true, locked: false,
  },
  // Secondary button
  {
    id: "hero-secondary",
    type: "rectangle",
    x: 260, y: 380, width: 140, height: 52,
    rotation: 0, fill: "transparent", stroke: "rgba(255,255,255,0.15)", strokeWidth: 1,
    opacity: 1, cornerRadius: 14, name: "Watch Demo", visible: true, locked: false,
  },
  // Hero image placeholder
  {
    id: "hero-image",
    type: "rectangle",
    x: 680, y: 100, width: 520, height: 360,
    rotation: 0, fill: "rgba(139,92,246,0.08)", stroke: "rgba(139,92,246,0.2)", strokeWidth: 1,
    opacity: 1, cornerRadius: 20, name: "Hero Image", visible: true, locked: false,
  },
  // Features section
  {
    id: "features-frame",
    type: "frame",
    isFrame: true,
    x: 0, y: 552, width: 1280, height: 340,
    rotation: 0, fill: "rgba(8,8,12,1)", stroke: "", strokeWidth: 0,
    opacity: 1, cornerRadius: 0, name: "Features Section", visible: true, locked: false,
  },
  // Feature cards
  {
    id: "card-1",
    type: "rectangle",
    x: 48, y: 620, width: 368, height: 200,
    rotation: 0, fill: "rgba(30,30,40,0.8)", stroke: "rgba(255,255,255,0.07)", strokeWidth: 1,
    opacity: 1, cornerRadius: 16, name: "Feature Card 1", visible: true, locked: false,
  },
  {
    id: "card-2",
    type: "rectangle",
    x: 456, y: 620, width: 368, height: 200,
    rotation: 0, fill: "rgba(30,30,40,0.8)", stroke: "rgba(255,255,255,0.07)", strokeWidth: 1,
    opacity: 1, cornerRadius: 16, name: "Feature Card 2", visible: true, locked: false,
  },
  {
    id: "card-3",
    type: "rectangle",
    x: 864, y: 620, width: 368, height: 200,
    rotation: 0, fill: "rgba(30,30,40,0.8)", stroke: "rgba(255,255,255,0.07)", strokeWidth: 1,
    opacity: 1, cornerRadius: 16, name: "Feature Card 3", visible: true, locked: false,
  },
  // Section title
  {
    id: "features-title",
    type: "text",
    x: 400, y: 572, width: 480, height: 40,
    rotation: 0, fill: "#F2F2F2", stroke: "", strokeWidth: 0,
    opacity: 1, cornerRadius: 0, name: "Features Title",
    textContent: "Everything you need to design faster", fontSize: 24, fontWeight: "600", fontFamily: "Inter",
    textAlign: "center", lineHeight: 1.3, letterSpacing: -0.01,
    visible: true, locked: false,
  },
];

const defaultPage: PageState = {
  id: "page-1",
  name: "Landing Page",
  elements: defaultElements,
};

interface CanvasContextValue {
  state: CanvasState;
  dispatch: React.Dispatch<CanvasAction>;
  addElement: (el: Omit<CanvasElement, "id">) => void;
  addElements: (els: Omit<CanvasElement, "id">[]) => void;
  updateElement: (id: string, updates: Partial<CanvasElement>) => void;
  deleteSelected: () => void;
  selectById: (id: string, multi?: boolean) => void;
  clearSelection: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  selectedElements: CanvasElement[];
  getElement: (id: string) => CanvasElement | undefined;
  nextId: () => string;
  copySelected: () => void;
  paste: () => void;
  duplicateSelected: () => void;
  addPage: (name: string) => void;
  removePage: (id: string) => void;
  renamePage: (id: string, name: string) => void;
  switchPage: (id: string) => void;
}

const CanvasContext = createContext<CanvasContextValue | null>(null);

let idCounter = 1000;

export const CanvasProvider: React.FC<{ children: React.ReactNode; projectKey?: string }> = ({ children, projectKey }) => {
  const counterRef = useRef(idCounter);

  const nextId = useCallback(() => {
    counterRef.current += 1;
    return `el-${counterRef.current}`;
  }, []);

  const getInitialState = (): CanvasState => {
    if (projectKey) {
      try {
        const saved = localStorage.getItem(`nova-canvas-${projectKey}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.pages && parsed.currentPageId) {
            const currentPage = parsed.pages.find((p: PageState) => p.id === parsed.currentPageId) || parsed.pages[0];
            return {
              elements: currentPage.elements || [],
              selectedIds: [],
              activeTool: "move",
              zoom: 70,
              panX: 0,
              panY: 0,
              artboardWidth: parsed.artboardWidth || 1280,
              artboardHeight: parsed.artboardHeight || 900,
              artboardName: currentPage.name,
              past: [],
              future: [],
              showGrid: true,
              showRulers: true,
              clipboard: [],
              pages: parsed.pages,
              currentPageId: parsed.currentPageId,
            };
          }
        }
      } catch {}
    }
    return {
      elements: defaultElements,
      selectedIds: [],
      activeTool: "move",
      zoom: 70,
      panX: 0,
      panY: 0,
      artboardWidth: 1280,
      artboardHeight: 900,
      artboardName: "Landing Page",
      past: [],
      future: [],
      showGrid: true,
      showRulers: true,
      clipboard: [],
      pages: [defaultPage],
      currentPageId: "page-1",
    };
  };

  const [state, dispatch] = useReducer(canvasReducer, undefined, getInitialState);

  // Auto-save to localStorage (respects nova-settings autoSave preference)
  React.useEffect(() => {
    if (!projectKey) return;
    try {
      const settings = JSON.parse(localStorage.getItem("nova-settings") || "{}");
      if (settings.autoSave === false) return;
    } catch {}
    const toSave = {
      pages: state.pages.map((p) =>
        p.id === state.currentPageId ? { ...p, elements: state.elements } : p
      ),
      currentPageId: state.currentPageId,
      artboardWidth: state.artboardWidth,
      artboardHeight: state.artboardHeight,
    };
    localStorage.setItem(`nova-canvas-${projectKey}`, JSON.stringify(toSave));
  }, [state.elements, state.pages, state.currentPageId, state.artboardWidth, state.artboardHeight, projectKey]);

  const addElement = useCallback((el: Omit<CanvasElement, "id">) => {
    dispatch({ type: "ADD_ELEMENT", element: { ...el, id: nextId() } });
  }, [nextId]);

  const addElements = useCallback((els: Omit<CanvasElement, "id">[]) => {
    dispatch({
      type: "ADD_ELEMENTS",
      elements: els.map((el) => ({ ...el, id: nextId() })),
    });
  }, [nextId]);

  const updateElement = useCallback((id: string, updates: Partial<CanvasElement>) => {
    dispatch({ type: "UPDATE_ELEMENT", id, updates });
  }, []);

  const deleteSelected = useCallback(() => {
    if (state.selectedIds.length > 0) {
      dispatch({ type: "DELETE_ELEMENTS", ids: state.selectedIds });
    }
  }, [state.selectedIds]);

  const selectById = useCallback((id: string, multi = false) => {
    if (multi) {
      const ids = state.selectedIds.includes(id)
        ? state.selectedIds.filter((i) => i !== id)
        : [...state.selectedIds, id];
      dispatch({ type: "SELECT", ids });
    } else {
      dispatch({ type: "SELECT", ids: [id] });
    }
  }, [state.selectedIds]);

  const clearSelection = useCallback(() => {
    dispatch({ type: "SELECT", ids: [] });
  }, []);

  const undo = useCallback(() => dispatch({ type: "UNDO" }), []);
  const redo = useCallback(() => dispatch({ type: "REDO" }), []);

  const copySelected = useCallback(() => {
    if (state.selectedIds.length > 0) {
      dispatch({ type: "COPY_ELEMENTS", ids: state.selectedIds });
    }
  }, [state.selectedIds]);

  const paste = useCallback(() => {
    dispatch({ type: "PASTE_ELEMENTS" });
  }, []);

  const duplicateSelected = useCallback(() => {
    if (state.selectedIds.length > 0) {
      dispatch({ type: "DUPLICATE_ELEMENTS", ids: state.selectedIds });
    }
  }, [state.selectedIds]);

  const addPage = useCallback((name: string) => {
    const id = `page-${Date.now()}`;
    dispatch({
      type: "ADD_PAGE",
      page: { id, name, elements: [] },
    });
  }, []);

  const removePage = useCallback((id: string) => {
    dispatch({ type: "REMOVE_PAGE", id });
  }, []);

  const renamePage = useCallback((id: string, name: string) => {
    dispatch({ type: "RENAME_PAGE", id, name });
  }, []);

  const switchPage = useCallback((id: string) => {
    dispatch({ type: "SWITCH_PAGE", id });
  }, []);

  const selectedElements = state.elements.filter((el) => state.selectedIds.includes(el.id));
  const getElement = (id: string) => state.elements.find((el) => el.id === id);

  return (
    <CanvasContext.Provider
      value={{
        state,
        dispatch,
        addElement,
        addElements,
        updateElement,
        deleteSelected,
        selectById,
        clearSelection,
        undo,
        redo,
        canUndo: state.past.length > 0,
        canRedo: state.future.length > 0,
        selectedElements,
        getElement,
        nextId,
        copySelected,
        paste,
        duplicateSelected,
        addPage,
        removePage,
        renamePage,
        switchPage,
      }}
    >
      {children}
    </CanvasContext.Provider>
  );
};

export const useCanvas = () => {
  const ctx = useContext(CanvasContext);
  if (!ctx) throw new Error("useCanvas must be used within CanvasProvider");
  return ctx;
};
