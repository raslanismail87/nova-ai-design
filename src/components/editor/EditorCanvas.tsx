import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, Maximize, Grid3X3 } from "lucide-react";
import CanvasAIBar from "./CanvasAIBar";
import ContextAIMenu from "./ContextAIMenu";
import AIContextualHUD from "./AIContextualHUD";
import { useCanvas, CanvasElement } from "@/contexts/CanvasContext";

interface Props {
  onOpenAI?: () => void;
}

type DragState =
  | { kind: "none" }
  | { kind: "drawing"; startX: number; startY: number; currentX: number; currentY: number }
  | { kind: "moving"; startX: number; startY: number; origPositions: Record<string, { x: number; y: number }> }
  | { kind: "resizing"; handle: string; startX: number; startY: number; origEl: CanvasElement }
  | { kind: "panning"; startScrollLeft: number; startScrollTop: number; startClientX: number; startClientY: number }
  | { kind: "selecting"; startX: number; startY: number; currentX: number; currentY: number };

const SNAP = 8; // snap grid size

function snapToGrid(val: number): number {
  return Math.round(val / SNAP) * SNAP;
}

// Parse SVG filter ID for shadow/blur
function getFilterId(el: CanvasElement): string | null {
  const hasShadow = el.shadowColor && (el.shadowX !== 0 || el.shadowY !== 0 || el.shadowBlur !== 0);
  const hasBlur = el.blur && el.blur > 0;
  if (hasShadow || hasBlur) return `filter-${el.id}`;
  return null;
}

// Render a single canvas element as SVG
const SvgElement = ({
  el,
  isSelected,
  onPointerDown,
  onDoubleClick,
  editingTextId,
  onTextChange,
}: {
  el: CanvasElement;
  isSelected: boolean;
  onPointerDown: (e: React.PointerEvent, id: string) => void;
  onDoubleClick: (e: React.MouseEvent, id: string) => void;
  editingTextId: string | null;
  onTextChange: (id: string, val: string) => void;
}) => {
  if (!el.visible) return null;

  const isGradient = el.fill.startsWith("linear-gradient");
  const gradId = `grad-${el.id}`;
  const filterId = getFilterId(el);

  // Parse linear-gradient to get colors
  let fillRef = el.fill;
  let gradDef: React.ReactNode = null;
  if (isGradient) {
    const match = el.fill.match(/#[0-9a-fA-F]{6}|rgba?\([^)]+\)/g);
    const colors = match || ["#8B5CF6", "#06B6D4"];
    gradDef = (
      <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor={colors[0]} />
        <stop offset="100%" stopColor={colors[1] || colors[0]} />
      </linearGradient>
    );
    fillRef = `url(#${gradId})`;
  }

  // Build SVG filter for shadow/blur
  let filterDef: React.ReactNode = null;
  if (filterId) {
    const hasShadow = el.shadowColor && (el.shadowX !== undefined || el.shadowY !== undefined || el.shadowBlur !== undefined);
    const hasBlur = el.blur && el.blur > 0;
    filterDef = (
      <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
        {hasBlur && <feGaussianBlur stdDeviation={el.blur} />}
        {hasShadow && (
          <>
            <feFlood floodColor={el.shadowColor || "rgba(0,0,0,0.5)"} result="flood" />
            <feComposite in="flood" in2="SourceAlpha" operator="in" result="shadow" />
            <feOffset dx={el.shadowX || 0} dy={el.shadowY || 4} result="offsetShadow" />
            <feGaussianBlur in="offsetShadow" stdDeviation={el.shadowBlur || 8} result="blurredShadow" />
            <feMerge>
              <feMergeNode in="blurredShadow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </>
        )}
      </filter>
    );
  }

  const commonProps = {
    fill: fillRef,
    stroke: el.stroke || "none",
    strokeWidth: el.strokeWidth,
    opacity: el.opacity,
    filter: filterId ? `url(#${filterId})` : undefined,
    style: { cursor: el.locked ? "default" : "move" },
    onPointerDown: (e: React.PointerEvent) => !el.locked && onPointerDown(e, el.id),
    onDoubleClick: (e: React.MouseEvent) => onDoubleClick(e, el.id),
  };

  const transform = el.rotation
    ? `rotate(${el.rotation}, ${el.x + el.width / 2}, ${el.y + el.height / 2})`
    : undefined;

  return (
    <g transform={transform}>
      <defs>
        {gradDef}
        {filterDef}
      </defs>
      {el.type === "rectangle" || el.type === "frame" || el.type === "image" ? (
        <rect
          x={el.x}
          y={el.y}
          width={Math.max(1, el.width)}
          height={Math.max(1, el.height)}
          rx={el.cornerRadius}
          ry={el.cornerRadius}
          {...commonProps}
        />
      ) : el.type === "ellipse" ? (
        <ellipse
          cx={el.x + el.width / 2}
          cy={el.y + el.height / 2}
          rx={Math.max(1, el.width / 2)}
          ry={Math.max(1, el.height / 2)}
          {...commonProps}
        />
      ) : el.type === "line" ? (
        <line
          x1={el.x}
          y1={el.y}
          x2={el.x + el.width}
          y2={el.y + el.height}
          stroke={el.stroke || el.fill}
          strokeWidth={Math.max(1, el.strokeWidth || 2)}
          opacity={el.opacity}
          style={commonProps.style}
          onPointerDown={commonProps.onPointerDown}
          onDoubleClick={commonProps.onDoubleClick}
        />
      ) : el.type === "text" ? (
        editingTextId === el.id ? (
          <foreignObject x={el.x} y={el.y} width={el.width} height={Math.max(el.height, 40)}>
            <textarea
              style={{
                width: "100%",
                height: "100%",
                background: "transparent",
                border: "none",
                outline: "none",
                color: el.fill,
                fontSize: `${el.fontSize || 16}px`,
                fontWeight: el.fontWeight || "400",
                fontFamily: el.fontFamily || "Inter, sans-serif",
                lineHeight: el.lineHeight || 1.4,
                letterSpacing: el.letterSpacing ? `${el.letterSpacing}em` : "normal",
                textAlign: el.textAlign || "left",
                resize: "none",
                padding: "0",
              }}
              defaultValue={el.textContent || ""}
              onBlur={(e) => onTextChange(el.id, e.target.value)}
              autoFocus
            />
          </foreignObject>
        ) : (
          <text
            x={el.textAlign === "center" ? el.x + el.width / 2 : el.textAlign === "right" ? el.x + el.width : el.x}
            y={el.y}
            fill={fillRef}
            fontSize={el.fontSize || 16}
            fontWeight={el.fontWeight || "400"}
            fontFamily={el.fontFamily || "Inter, sans-serif"}
            dominantBaseline="hanging"
            textAnchor={el.textAlign === "center" ? "middle" : el.textAlign === "right" ? "end" : "start"}
            style={{
              letterSpacing: el.letterSpacing ? `${el.letterSpacing}em` : "normal",
              userSelect: "none",
              cursor: el.locked ? "default" : "move",
            }}
            opacity={el.opacity}
            onPointerDown={(e) => !el.locked && onPointerDown(e, el.id)}
            onDoubleClick={(e) => onDoubleClick(e, el.id)}
          >
            {(el.textContent || "").split("\n").map((line, i) => (
              <tspan
                key={i}
                x={el.textAlign === "center" ? el.x + el.width / 2 : el.textAlign === "right" ? el.x + el.width : el.x}
                dy={i === 0 ? 0 : (el.fontSize || 16) * (el.lineHeight || 1.4)}
              >
                {line}
              </tspan>
            ))}
          </text>
        )
      ) : null}

      {/* Frame label */}
      {el.isFrame && (
        <text
          x={el.x}
          y={el.y - 10}
          fill="#8B5CF6"
          fontSize={11}
          fontFamily="Inter, sans-serif"
          fontWeight="500"
          style={{ userSelect: "none", pointerEvents: "none" }}
        >
          {el.name}
        </text>
      )}
    </g>
  );
};

// Selection handles
const SelectionHandles = ({
  el,
  onHandlePointerDown,
}: {
  el: CanvasElement;
  onHandlePointerDown: (e: React.PointerEvent, handle: string, el: CanvasElement) => void;
}) => {
  const { x, y, width, height } = el;
  const handles = [
    { id: "nw", cx: x, cy: y },
    { id: "n", cx: x + width / 2, cy: y },
    { id: "ne", cx: x + width, cy: y },
    { id: "e", cx: x + width, cy: y + height / 2 },
    { id: "se", cx: x + width, cy: y + height },
    { id: "s", cx: x + width / 2, cy: y + height },
    { id: "sw", cx: x, cy: y + height },
    { id: "w", cx: x, cy: y + height / 2 },
  ];
  const cursorMap: Record<string, string> = {
    nw: "nw-resize", n: "n-resize", ne: "ne-resize", e: "e-resize",
    se: "se-resize", s: "s-resize", sw: "sw-resize", w: "w-resize",
  };

  return (
    <g>
      {/* Bounding box */}
      <rect
        x={x - 0.5}
        y={y - 0.5}
        width={width + 1}
        height={height + 1}
        fill="none"
        stroke="#8B5CF6"
        strokeWidth={1}
        strokeDasharray={el.isFrame ? "4 2" : undefined}
        style={{ pointerEvents: "none" }}
      />
      {/* Resize handles */}
      {handles.map((h) => (
        <rect
          key={h.id}
          x={h.cx - 4}
          y={h.cy - 4}
          width={8}
          height={8}
          rx={1}
          fill="white"
          stroke="#8B5CF6"
          strokeWidth={1.5}
          style={{ cursor: cursorMap[h.id], pointerEvents: "all" }}
          onPointerDown={(e) => onHandlePointerDown(e, h.id, el)}
        />
      ))}
    </g>
  );
};

const ARTBOARD_PADDING = 80;

const EditorCanvas = ({ onOpenAI }: Props) => {
  const { state, dispatch, addElement, updateElement, selectById, clearSelection, deleteSelected, selectedElements } = useCanvas();
  const { elements, selectedIds, activeTool, zoom, panX, panY, artboardWidth, artboardHeight, artboardName, showGrid } = state;

  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const spaceDownRef = useRef(false);

  const [dragState, setDragState] = useState<DragState>({ kind: "none" });
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; name: string } | null>(null);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);

  const scale = zoom / 100;

  const svgWidth = artboardWidth + ARTBOARD_PADDING * 2;
  const svgHeight = artboardHeight + ARTBOARD_PADDING * 2;
  const artX = ARTBOARD_PADDING;
  const artY = ARTBOARD_PADDING;

  const screenToArtboard = useCallback((clientX: number, clientY: number): { x: number; y: number } => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    const svgX = (clientX - rect.left) / scale;
    const svgY = (clientY - rect.top) / scale;
    return { x: svgX - artX, y: svgY - artY };
  }, [scale, artX, artY]);

  // Wheel zoom
  const handleWheel = useCallback((e: WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = -e.deltaY * 0.5;
      dispatch({ type: "SET_ZOOM", zoom: state.zoom + delta });
    }
  }, [state.zoom, dispatch]);

  useEffect(() => {
    const el = scrollAreaRef.current;
    if (!el) return;
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [handleWheel]);

  // Space key for panning mode
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && !spaceDownRef.current) {
        const tag = (e.target as HTMLElement).tagName.toLowerCase();
        if (tag !== "input" && tag !== "textarea") {
          spaceDownRef.current = true;
          if (containerRef.current) containerRef.current.style.cursor = "grab";
        }
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        spaceDownRef.current = false;
        if (containerRef.current) containerRef.current.style.cursor = "";
      }
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  const handleCanvasPointerDown = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    if (e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);

    // Space + drag = pan
    if (spaceDownRef.current || activeTool === "hand") {
      const scrollEl = scrollAreaRef.current;
      if (scrollEl) {
        setDragState({
          kind: "panning",
          startScrollLeft: scrollEl.scrollLeft,
          startScrollTop: scrollEl.scrollTop,
          startClientX: e.clientX,
          startClientY: e.clientY,
        });
        if (containerRef.current) containerRef.current.style.cursor = "grabbing";
      }
      return;
    }

    const { x, y } = screenToArtboard(e.clientX, e.clientY);

    if (activeTool === "move") {
      clearSelection();
      // Start rubber-band selection
      setDragState({ kind: "selecting", startX: x, startY: y, currentX: x, currentY: y });
      return;
    }

    if (["rectangle", "ellipse", "frame", "line", "image"].includes(activeTool)) {
      setDragState({ kind: "drawing", startX: x, startY: y, currentX: x, currentY: y });
    } else if (activeTool === "text") {
      const snappedX = snapToGrid(x);
      const snappedY = snapToGrid(y);
      addElement({
        type: "text",
        x: snappedX, y: snappedY, width: 200, height: 40,
        rotation: 0, fill: "#F2F2F2", stroke: "", strokeWidth: 0,
        opacity: 1, cornerRadius: 0, name: "Text",
        textContent: "Double click to edit",
        fontSize: 16, fontWeight: "400", fontFamily: "Inter",
        textAlign: "left", lineHeight: 1.4, letterSpacing: 0,
        visible: true, locked: false,
      });
      dispatch({ type: "SET_TOOL", tool: "move" });
    }
  }, [activeTool, screenToArtboard, clearSelection, addElement, dispatch]);

  const handleElementPointerDown = useCallback((e: React.PointerEvent, id: string) => {
    e.stopPropagation();
    if (activeTool !== "move") return;

    if (editingTextId) setEditingTextId(null);

    selectById(id, e.shiftKey || e.metaKey || e.ctrlKey);

    const allSelected = e.shiftKey || e.metaKey || e.ctrlKey
      ? [...(selectedIds.includes(id) ? selectedIds.filter(i => i !== id) : [...selectedIds, id])]
      : [id];

    const origPositions: Record<string, { x: number; y: number }> = {};
    allSelected.forEach((sid) => {
      const el = elements.find((el) => el.id === sid);
      if (el) origPositions[sid] = { x: el.x, y: el.y };
    });
    if (!origPositions[id]) {
      const el = elements.find((el) => el.id === id);
      if (el) origPositions[id] = { x: el.x, y: el.y };
    }

    const { x: startX, y: startY } = screenToArtboard(e.clientX, e.clientY);
    setDragState({ kind: "moving", startX, startY, origPositions });
    (e.currentTarget as Element).closest("svg")?.setPointerCapture(e.pointerId);
  }, [activeTool, editingTextId, selectById, selectedIds, elements, screenToArtboard]);

  const handleHandlePointerDown = useCallback((e: React.PointerEvent, handle: string, el: CanvasElement) => {
    e.stopPropagation();
    const { x: startX, y: startY } = screenToArtboard(e.clientX, e.clientY);
    setDragState({ kind: "resizing", handle, startX, startY, origEl: { ...el } });
    (e.currentTarget as Element).closest("svg")?.setPointerCapture(e.pointerId);
  }, [screenToArtboard]);

  const handlePointerMove = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    if (dragState.kind === "none") return;

    if (dragState.kind === "panning") {
      const dx = e.clientX - dragState.startClientX;
      const dy = e.clientY - dragState.startClientY;
      const scrollEl = scrollAreaRef.current;
      if (scrollEl) {
        scrollEl.scrollLeft = dragState.startScrollLeft - dx;
        scrollEl.scrollTop = dragState.startScrollTop - dy;
      }
      return;
    }

    const { x: cx, y: cy } = screenToArtboard(e.clientX, e.clientY);

    if (dragState.kind === "drawing") {
      setDragState((prev) => prev.kind === "drawing" ? { ...prev, currentX: cx, currentY: cy } : prev);
    } else if (dragState.kind === "selecting") {
      setDragState((prev) => prev.kind === "selecting" ? { ...prev, currentX: cx, currentY: cy } : prev);
    } else if (dragState.kind === "moving") {
      const dx = cx - dragState.startX;
      const dy = cy - dragState.startY;
      Object.entries(dragState.origPositions).forEach(([id, orig]) => {
        const el = elements.find((e) => e.id === id);
        if (el && !el.locked) {
          const newX = snapToGrid(orig.x + dx);
          const newY = snapToGrid(orig.y + dy);
          updateElement(id, { x: newX, y: newY });
        }
      });
    } else if (dragState.kind === "resizing") {
      const { handle, startX, startY, origEl } = dragState;
      const dx = cx - startX;
      const dy = cy - startY;
      let { x, y, width, height } = origEl;

      if (handle.includes("e")) width = Math.max(10, snapToGrid(origEl.width + dx));
      if (handle.includes("s")) height = Math.max(10, snapToGrid(origEl.height + dy));
      if (handle.includes("w")) { x = snapToGrid(origEl.x + dx); width = Math.max(10, snapToGrid(origEl.width - dx)); }
      if (handle.includes("n")) { y = snapToGrid(origEl.y + dy); height = Math.max(10, snapToGrid(origEl.height - dy)); }

      updateElement(origEl.id, { x, y, width, height });
    }
  }, [dragState, screenToArtboard, elements, updateElement]);

  const handlePointerUp = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    if (dragState.kind === "drawing") {
      const { startX, startY, currentX, currentY } = dragState;
      const x = snapToGrid(Math.min(startX, currentX));
      const y = snapToGrid(Math.min(startY, currentY));
      const w = snapToGrid(Math.abs(currentX - startX));
      const h = snapToGrid(Math.abs(currentY - startY));

      if (w > 5 && h > 5) {
        const typeMap: Record<string, string> = {
          rectangle: "Rectangle", ellipse: "Ellipse", frame: "Frame", line: "Line", image: "Image",
        };
        addElement({
          type: activeTool as any,
          x, y, width: w, height: h,
          rotation: 0,
          fill: activeTool === "frame" ? "rgba(20,20,28,0.5)" : "rgba(139,92,246,0.2)",
          stroke: activeTool === "frame" ? "rgba(255,255,255,0.12)" : "rgba(139,92,246,0.5)",
          strokeWidth: 1,
          opacity: 1, cornerRadius: activeTool === "frame" ? 12 : 8,
          name: typeMap[activeTool] || activeTool,
          visible: true, locked: false,
          isFrame: activeTool === "frame",
        });
        dispatch({ type: "SET_TOOL", tool: "move" });
      }
    } else if (dragState.kind === "selecting") {
      // Rubber-band: select all elements within selection rect
      const { startX, startY, currentX, currentY } = dragState;
      const selX = Math.min(startX, currentX);
      const selY = Math.min(startY, currentY);
      const selW = Math.abs(currentX - startX);
      const selH = Math.abs(currentY - startY);

      if (selW > 4 && selH > 4) {
        const inBox = elements.filter((el) => {
          if (!el.visible || el.locked) return false;
          return el.x < selX + selW && el.x + el.width > selX &&
            el.y < selY + selH && el.y + el.height > selY;
        });
        if (inBox.length > 0) {
          dispatch({ type: "SELECT", ids: inBox.map(e => e.id) });
        }
      }
    } else if (dragState.kind === "panning") {
      if (containerRef.current) containerRef.current.style.cursor = spaceDownRef.current ? "grab" : "";
    }
    setDragState({ kind: "none" });
  }, [dragState, activeTool, addElement, dispatch, elements]);

  const handleElementDoubleClick = useCallback((e: React.MouseEvent, id: string) => {
    const el = elements.find((el) => el.id === id);
    if (el?.type === "text") {
      setEditingTextId(id);
    }
  }, [elements]);

  const handleTextChange = useCallback((id: string, val: string) => {
    updateElement(id, { textContent: val });
    setEditingTextId(null);
  }, [updateElement]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const first = selectedIds[0];
    const el = first ? elements.find((el) => el.id === first) : null;
    if (el) {
      setContextMenu({ x: e.clientX, y: e.clientY, name: el.name });
    }
  }, [selectedIds, elements]);

  // Drawing / rubber-band preview
  const drawingPreview = (() => {
    if (dragState.kind !== "drawing") return null;
    const { startX, startY, currentX, currentY } = dragState;
    const x = Math.min(startX, currentX);
    const y = Math.min(startY, currentY);
    const w = Math.abs(currentX - startX);
    const h = Math.abs(currentY - startY);
    if (w < 2 && h < 2) return null;

    const style = { fill: "rgba(139,92,246,0.15)", stroke: "#8B5CF6", strokeWidth: 1, strokeDasharray: "4 2", pointerEvents: "none" as const };
    if (activeTool === "ellipse") {
      return <ellipse cx={x + w / 2} cy={y + h / 2} rx={w / 2} ry={h / 2} {...style} />;
    }
    if (activeTool === "line") {
      return <line x1={startX} y1={startY} x2={currentX} y2={currentY} stroke="#8B5CF6" strokeWidth={2} strokeDasharray="4 2" style={{ pointerEvents: "none" }} />;
    }
    return <rect x={x} y={y} width={w} height={h} rx={8} {...style} />;
  })();

  const rubberBandPreview = (() => {
    if (dragState.kind !== "selecting") return null;
    const { startX, startY, currentX, currentY } = dragState;
    const x = Math.min(startX, currentX);
    const y = Math.min(startY, currentY);
    const w = Math.abs(currentX - startX);
    const h = Math.abs(currentY - startY);
    if (w < 2 && h < 2) return null;
    return (
      <rect
        x={x} y={y} width={w} height={h}
        fill="rgba(139,92,246,0.06)"
        stroke="#8B5CF6"
        strokeWidth={1}
        strokeDasharray="3 2"
        style={{ pointerEvents: "none" }}
      />
    );
  })();

  const cursorMap: Record<string, string> = {
    move: "default",
    hand: "grab",
    rectangle: "crosshair",
    ellipse: "crosshair",
    frame: "crosshair",
    line: "crosshair",
    text: "text",
    image: "crosshair",
    pen: "crosshair",
    comment: "default",
  };

  // Zoom presets
  const zoomPresets = [25, 50, 75, 100, 150, 200];

  return (
    <div
      ref={containerRef}
      className="flex-1 relative overflow-hidden bg-background"
      onContextMenu={handleContextMenu}
    >
      {/* Dot grid background */}
      <div className="absolute inset-0 nova-dot-grid pointer-events-none" />

      {/* Ruler (horizontal) */}
      <div className="absolute top-0 left-8 right-0 h-6 bg-card/80 backdrop-blur-sm border-b border-border flex items-end px-2 z-10 pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="flex-1 border-l border-border/20 relative">
            {i % 2 === 0 && (
              <span className="absolute -top-0.5 left-1 text-[8px] text-muted-foreground/40 font-mono select-none">
                {Math.round((i * (svgWidth / 20)) / scale)}
              </span>
            )}
          </div>
        ))}
      </div>
      {/* Ruler (vertical) */}
      <div className="absolute top-6 left-0 bottom-0 w-8 bg-card/80 backdrop-blur-sm border-r border-border z-10 pointer-events-none">
        {Array.from({ length: 15 }).map((_, i) => (
          <div key={i} className="h-16 border-t border-border/20 relative">
            {i % 2 === 0 && (
              <span className="absolute top-1 left-0.5 text-[7px] text-muted-foreground/40 font-mono select-none">
                {Math.round((i * (svgHeight / 15)) / scale)}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Canvas scroll area */}
      <div ref={scrollAreaRef} className="absolute inset-0 top-6 left-8 overflow-auto">
        <div
          style={{
            width: svgWidth * scale,
            height: svgHeight * scale,
            minWidth: "100%",
            minHeight: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg
            ref={svgRef}
            width={svgWidth * scale}
            height={svgHeight * scale}
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            style={{
              cursor: dragState.kind === "panning" ? "grabbing" : spaceDownRef.current ? "grab" : cursorMap[activeTool] || "default",
              display: "block",
            }}
            onPointerDown={handleCanvasPointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
            {/* Grid */}
            {showGrid && (
              <defs>
                <pattern id="grid-small" width="8" height="8" patternUnits="userSpaceOnUse">
                  <path d="M 8 0 L 0 0 0 8" fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="0.5" />
                </pattern>
                <pattern id="grid-large" width="80" height="80" patternUnits="userSpaceOnUse">
                  <rect width="80" height="80" fill="url(#grid-small)" />
                  <path d="M 80 0 L 0 0 0 80" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
                </pattern>
              </defs>
            )}
            {showGrid && (
              <rect x={0} y={0} width={svgWidth} height={svgHeight} fill="url(#grid-large)" style={{ pointerEvents: "none" }} />
            )}

            {/* Artboard shadow */}
            <filter id="artboard-shadow">
              <feDropShadow dx="0" dy="8" stdDeviation="24" floodColor="rgba(0,0,0,0.6)" />
            </filter>

            {/* Artboard background */}
            <rect
              x={artX}
              y={artY}
              width={artboardWidth}
              height={artboardHeight}
              fill="#0a0a0f"
              rx={4}
              filter="url(#artboard-shadow)"
            />

            {/* Artboard label */}
            <text
              x={artX}
              y={artY - 14}
              fill="#8B5CF6"
              fontSize={12}
              fontFamily="Inter, sans-serif"
              fontWeight="500"
              style={{ userSelect: "none", pointerEvents: "none" }}
            >
              {artboardName}
            </text>
            <text
              x={artX + artboardWidth / 2}
              y={artY - 14}
              fill="rgba(255,255,255,0.25)"
              fontSize={10}
              fontFamily="JetBrains Mono, monospace"
              textAnchor="middle"
              style={{ userSelect: "none", pointerEvents: "none" }}
            >
              {artboardWidth} × {artboardHeight}
            </text>

            {/* Clip artboard content */}
            <defs>
              <clipPath id="artboard-clip">
                <rect x={artX} y={artY} width={artboardWidth} height={artboardHeight} rx={4} />
              </clipPath>
            </defs>

            <g clipPath="url(#artboard-clip)">
              <g transform={`translate(${artX}, ${artY})`}>
                {elements.map((el) => (
                  <SvgElement
                    key={el.id}
                    el={el}
                    isSelected={selectedIds.includes(el.id)}
                    onPointerDown={handleElementPointerDown}
                    onDoubleClick={handleElementDoubleClick}
                    editingTextId={editingTextId}
                    onTextChange={handleTextChange}
                  />
                ))}

                {/* Drawing preview */}
                {drawingPreview}
                {rubberBandPreview}

                {/* Selection handles */}
                {selectedElements.map((el) => (
                  <SelectionHandles
                    key={`sel-${el.id}`}
                    el={el}
                    onHandlePointerDown={handleHandlePointerDown}
                  />
                ))}

                {/* Multi-selection bounding box */}
                {selectedElements.length > 1 && (() => {
                  const xs = selectedElements.map(e => e.x);
                  const ys = selectedElements.map(e => e.y);
                  const x2s = selectedElements.map(e => e.x + e.width);
                  const y2s = selectedElements.map(e => e.y + e.height);
                  const bx = Math.min(...xs);
                  const by = Math.min(...ys);
                  const bw = Math.max(...x2s) - bx;
                  const bh = Math.max(...y2s) - by;
                  return (
                    <rect
                      x={bx - 4}
                      y={by - 4}
                      width={bw + 8}
                      height={bh + 8}
                      fill="none"
                      stroke="#8B5CF6"
                      strokeWidth={1}
                      strokeDasharray="4 2"
                      rx={4}
                      style={{ pointerEvents: "none" }}
                    />
                  );
                })()}
              </g>
            </g>

            {/* Artboard border */}
            <rect
              x={artX}
              y={artY}
              width={artboardWidth}
              height={artboardHeight}
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth={1}
              rx={4}
              style={{ pointerEvents: "none" }}
            />
          </svg>
        </div>
      </div>

      {/* Contextual AI HUD – appears above CanvasAIBar when element is selected */}
      <AIContextualHUD
        element={selectedElements[0] ?? null}
        onSendPrompt={() => {}}
        onOpenChat={() => onOpenAI?.()}
      />

      {/* Canvas AI command bar */}
      <CanvasAIBar
        selectedLayer={selectedIds[0] || null}
        onSendPrompt={() => onOpenAI?.()}
        onOpenChat={() => onOpenAI?.()}
      />

      {/* Context AI menu */}
      {contextMenu && (
        <ContextAIMenu
          x={contextMenu.x}
          y={contextMenu.y}
          layerName={contextMenu.name}
          onAction={() => { onOpenAI?.(); setContextMenu(null); }}
          onClose={() => setContextMenu(null)}
        />
      )}

      {/* Zoom controls */}
      <div className="absolute bottom-4 right-4 flex items-center gap-0.5 nova-glass rounded-xl p-1 z-20">
        <button
          onClick={() => dispatch({ type: "SET_ZOOM", zoom: state.zoom - 10 })}
          className="p-1.5 rounded-lg hover:bg-white/[0.06] active:bg-white/[0.1] transition-all duration-100"
          title="Zoom out (Ctrl −)"
        >
          <ZoomOut className="w-3.5 h-3.5 text-muted-foreground/70" />
        </button>
        <select
          value={zoom}
          onChange={(e) => dispatch({ type: "SET_ZOOM", zoom: Number(e.target.value) })}
          className="text-[10px] font-mono text-muted-foreground/70 bg-transparent outline-none cursor-pointer min-w-[3.5rem] text-center"
          title="Zoom level"
        >
          {zoomPresets.map((z) => (
            <option key={z} value={z}>{z}%</option>
          ))}
          {!zoomPresets.includes(zoom) && <option value={zoom}>{zoom}%</option>}
        </select>
        <button
          onClick={() => dispatch({ type: "SET_ZOOM", zoom: state.zoom + 10 })}
          className="p-1.5 rounded-lg hover:bg-white/[0.06] active:bg-white/[0.1] transition-all duration-100"
          title="Zoom in (Ctrl +)"
        >
          <ZoomIn className="w-3.5 h-3.5 text-muted-foreground/70" />
        </button>
        <div className="w-px h-4 bg-border/50 mx-0.5" />
        <button
          onClick={() => dispatch({ type: "SET_ZOOM", zoom: 100 })}
          className="p-1.5 rounded-lg hover:bg-white/[0.06] active:bg-white/[0.1] transition-all duration-100"
          title="Fit to screen"
        >
          <Maximize className="w-3.5 h-3.5 text-muted-foreground/70" />
        </button>
        <div className="w-px h-4 bg-border/50 mx-0.5" />
        <button
          onClick={() => dispatch({ type: "TOGGLE_GRID" })}
          className={`p-1.5 rounded-lg transition-all duration-100 ${showGrid ? "text-primary bg-primary/10" : "text-muted-foreground/70 hover:bg-white/[0.06]"}`}
          title="Toggle grid (⌘')"
        >
          <Grid3X3 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Tool hints */}
      {activeTool !== "move" && activeTool !== "hand" && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3.5 py-2 rounded-full nova-glass text-xs text-muted-foreground z-20 pointer-events-none animate-fade-in">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          {activeTool === "text" ? "Click to place text" : `Click and drag to draw ${activeTool}`}
          <kbd className="kbd ml-0.5">Esc</kbd>
        </div>
      )}

      {/* Selection info */}
      {selectedElements.length > 0 && (
        <div className="absolute bottom-4 left-8 flex items-center gap-2 px-3 py-1.5 rounded-lg nova-glass text-[10px] text-muted-foreground/80 z-20 pointer-events-none">
          <span className="text-primary font-medium tabular-nums">{selectedElements.length}</span>
          {selectedElements.length === 1 ? "element" : "elements"} selected
          {selectedElements.length === 1 && (
            <span className="text-muted-foreground/50 font-mono tabular-nums">
              · {Math.round(selectedElements[0].width)} × {Math.round(selectedElements[0].height)}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default EditorCanvas;
