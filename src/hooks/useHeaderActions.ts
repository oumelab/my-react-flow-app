import {
  addChildNodeAtom,
  canRedoAtom,
  canUndoAtom,
  deleteNodeAtom,
  redoAtom,
  resetMindMapAtom,
  selectedNodeAtom,
  undoAtom,
  updateNodeLabelAtom,
} from "@/store/mind-map-store";
import { useAtom } from "jotai";
import { useEffect } from "react";

export function useHeaderActions() {
  const [, undo] = useAtom(undoAtom);
  const [, redo] = useAtom(redoAtom);
  const [canUndo] = useAtom(canUndoAtom);
  const [canRedo] = useAtom(canRedoAtom);

  const [selectedNode] = useAtom(selectedNodeAtom);
  const [, addChildNode] = useAtom(addChildNodeAtom);
  const [, updateNodeLabel] = useAtom(updateNodeLabelAtom);
  const [, deleteNode] = useAtom(deleteNodeAtom);
  const [, resetMindMap] = useAtom(resetMindMapAtom);

  // キーボードショートカット
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      if (
        (e.ctrlKey || e.metaKey) &&
        e.shiftKey &&
        (e.key === "z" || e.key === "Z")
      ) {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo]);

  return {
    undo,
    redo,
    canUndo,
    canRedo,
    selectedNode,
    addChildNode,
    updateNodeLabel,
    deleteNode,
    resetMindMap,
  };
}