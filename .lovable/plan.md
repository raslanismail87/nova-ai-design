

# Fix: Consolidate Floating AI Elements

## Problem
The canvas currently renders **4 separate floating AI elements** simultaneously:
1. `CanvasAIBar` — bottom-center command bar (always visible)
2. `AIContextualHUD` — floating above the bar when element selected
3. `ContextAIMenu` — right-click popup menu
4. `AIInvitePill` — bottom-right "Ask Nova" button (when AI panel closed)

These overlap and clutter the canvas, as seen in the screenshot.

## Solution
Consolidate into **2 elements** with clear, non-overlapping roles:

1. **Keep `CanvasAIBar`** as the single bottom-center AI input — but only show it when an element is selected. Merge the contextual HUD actions (Restyle, Scale up, etc.) directly into the CanvasAIBar as quick-action chips, replacing the separate `AIContextualHUD`.

2. **Keep `ContextAIMenu`** for right-click only (it's contextual and dismisses itself).

3. **Remove `AIContextualHUD`** entirely — its actions merge into `CanvasAIBar`.

4. **Remove `AIInvitePill`** — the AI toggle in the toolbar (`⌘I`) is sufficient. The invite pill adds visual noise.

## Changes

### `EditorCanvas.tsx`
- Remove `AIContextualHUD` import and rendering
- Only render `CanvasAIBar` when there's a selected element (hide when nothing selected to reduce clutter)
- Keep `ContextAIMenu` as-is (right-click only)

### `CanvasAIBar.tsx`
- Add contextual quick-action chips based on element type (merged from AIContextualHUD logic) — e.g., for text: "Restyle", "Scale up"; for rectangles: "Gradient", "Shadow"
- Show element name + type indicator at top
- Cleaner, more compact layout — single floating bar instead of two stacked

### `Editor.tsx`
- Remove `AIInvitePill` component and its rendering

### `AIContextualHUD.tsx`
- Delete this file (functionality merged into CanvasAIBar)

