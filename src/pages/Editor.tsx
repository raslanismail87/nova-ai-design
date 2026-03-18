import { useState } from "react";
import EditorToolbar from "@/components/editor/EditorToolbar";
import EditorLeftSidebar from "@/components/editor/EditorLeftSidebar";
import EditorCanvas from "@/components/editor/EditorCanvas";
import EditorRightSidebar from "@/components/editor/EditorRightSidebar";
import AIChatPanel from "@/components/editor/AIChatPanel";
import AIGenerationModal from "@/components/editor/AIGenerationModal";

const Editor = () => {
  const [activeTool, setActiveTool] = useState("move");
  const [selectedLayer, setSelectedLayer] = useState<string | null>("headline");
  const [showAI, setShowAI] = useState(false);
  const [rightTab, setRightTab] = useState<"design" | "prototype" | "inspect">("design");
  const [zoom, setZoom] = useState(100);
  const [showGenModal, setShowGenModal] = useState(false);

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <EditorToolbar
        activeTool={activeTool}
        onToolChange={setActiveTool}
        showAI={showAI}
        onToggleAI={() => setShowAI(!showAI)}
        zoom={zoom}
      />
      <div className="flex-1 flex overflow-hidden">
        <EditorLeftSidebar
          selectedLayer={selectedLayer}
          onSelectLayer={setSelectedLayer}
        />
        <EditorCanvas
          zoom={zoom}
          onZoomChange={setZoom}
          selectedLayer={selectedLayer}
          onSelectLayer={setSelectedLayer}
          onOpenAI={() => setShowAI(true)}
        />
        {showAI ? (
          <AIChatPanel onClose={() => setShowAI(false)} selectedLayer={selectedLayer} />
        ) : (
          <EditorRightSidebar
            activeTab={rightTab}
            onTabChange={setRightTab}
            selectedLayer={selectedLayer}
          />
        )}
      </div>
      <AIGenerationModal
        open={showGenModal}
        onClose={() => setShowGenModal(false)}
        onGenerate={() => {}}
      />
    </div>
  );
};

export default Editor;
