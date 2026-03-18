import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import EditorToolbar from "@/components/editor/EditorToolbar";
import EditorLeftSidebar from "@/components/editor/EditorLeftSidebar";
import EditorCanvas from "@/components/editor/EditorCanvas";
import EditorRightSidebar from "@/components/editor/EditorRightSidebar";
import AIChatPanel from "@/components/editor/AIChatPanel";
import AIGenerationModal from "@/components/editor/AIGenerationModal";
import { CanvasProvider, useCanvas } from "@/contexts/CanvasContext";

const EditorInner = () => {
  const [showAI, setShowAI] = useState(false);
  const [rightTab, setRightTab] = useState<"design" | "prototype" | "inspect">("design");
  const [showGenModal, setShowGenModal] = useState(false);
  const [searchParams] = useSearchParams();

  const projectName = searchParams.get("name") || "Fintech Mobile App";
  const pageName = searchParams.get("page") || "Landing Page";

  const { dispatch, deleteSelected, undo, redo } = useCanvas();

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName.toLowerCase();
      const isInput = tag === "input" || tag === "textarea" || tag === "select";

      // Tool shortcuts (only when not typing in inputs)
      if (!isInput && !e.metaKey && !e.ctrlKey) {
        const toolMap: Record<string, string> = {
          v: "move", f: "frame", r: "rectangle", o: "ellipse",
          l: "line", p: "pen", t: "text", i: "image", c: "comment", h: "hand",
        };
        if (toolMap[e.key.toLowerCase()]) {
          dispatch({ type: "SET_TOOL", tool: toolMap[e.key.toLowerCase()] });
          return;
        }

        // Delete / Backspace
        if ((e.key === "Delete" || e.key === "Backspace") && !isInput) {
          deleteSelected();
          return;
        }

        // Escape → move tool, clear selection
        if (e.key === "Escape") {
          dispatch({ type: "SET_TOOL", tool: "move" });
          dispatch({ type: "SELECT", ids: [] });
          return;
        }
      }

      // Cmd/Ctrl + shortcuts
      if (e.metaKey || e.ctrlKey) {
        if (e.key === "z" && !e.shiftKey) { e.preventDefault(); undo(); return; }
        if (e.key === "z" && e.shiftKey) { e.preventDefault(); redo(); return; }
        if (e.key === "y") { e.preventDefault(); redo(); return; }
        if (e.key === "i") { e.preventDefault(); setShowAI((p) => !p); return; }
        // Zoom
        if (e.key === "=" || e.key === "+") { e.preventDefault(); dispatch({ type: "SET_ZOOM", zoom: 0 }); }
        if (e.key === "-") { e.preventDefault(); dispatch({ type: "SET_ZOOM", zoom: 0 }); }
        if (e.key === "0") { e.preventDefault(); dispatch({ type: "SET_ZOOM", zoom: 100 }); }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dispatch, deleteSelected, undo, redo]);

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <EditorToolbar
        showAI={showAI}
        onToggleAI={() => setShowAI(!showAI)}
        projectName={projectName}
        pageName={pageName}
      />
      <div className="flex-1 flex overflow-hidden">
        <EditorLeftSidebar />
        <EditorCanvas onOpenAI={() => setShowAI(true)} />
        {showAI ? (
          <AIChatPanel onClose={() => setShowAI(false)} />
        ) : (
          <EditorRightSidebar
            activeTab={rightTab}
            onTabChange={setRightTab}
          />
        )}
      </div>
      <AIGenerationModal
        open={showGenModal}
        onClose={() => setShowGenModal(false)}
        onGenerate={() => setShowGenModal(false)}
      />
    </div>
  );
};

const Editor = () => (
  <CanvasProvider>
    <EditorInner />
  </CanvasProvider>
);

export default Editor;
