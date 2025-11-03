import {Button} from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";
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
import {useAtom} from "jotai";
import {Pen, Plus, Redo, RefreshCw, Trash, Undo} from "lucide-react";
import {useEffect, useState} from "react";
import {Separator} from "./ui/separator";

export function Header() {
  const [, undo] = useAtom(undoAtom);
  const [, redo] = useAtom(redoAtom);
  const [canUndo] = useAtom(canUndoAtom);
  const [canRedo] = useAtom(canRedoAtom);

  const [selectedNode] = useAtom(selectedNodeAtom);
  const [, addChildNode] = useAtom(addChildNodeAtom);
  const [, updateNodeLabel] = useAtom(updateNodeLabelAtom);
  const [, deleteNode] = useAtom(deleteNodeAtom);
  const [, resetMindMap] = useAtom(resetMindMapAtom);

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [newLabel, setNewLabel] = useState("");

  // キーボードショートカット
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "z") {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo]);

  const handleUpdateLabel = () => {
    if (selectedNode && newLabel.trim()) {
      updateNodeLabel({nodeId: selectedNode.id, newLabel});
    }
    setIsEditDialogOpen(false);
  };

  return (
    <header className="bg-muted border-b p-2 flex items-center justify-between">
      <div className="flex items-center">
        <h1 className="font-pixel text-foreground text-xl font-bold ml-12">
          My Mind-Map
        </h1>
      </div>

      <div className="py-2 px-4 rounded-md border-2 border-muted-foreground flex items-center gap-2">
        <Button
          onClick={() => selectedNode && addChildNode(selectedNode)}
          disabled={!selectedNode}
        >
          子要素の追加
          <Plus className="w-4 h-4" />
        </Button>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={!selectedNode}>
              編集
              <Pen className="w-4 h-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>✏️ 内容を更新：</DialogTitle>
              <DialogDescription>
                ノードのラベルを編集してください
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-4 items-center gap-2 mt-2">
              <Input
                id="node-label"
                defaultValue={(selectedNode?.data.label as string) || ""}
                className="col-span-3 bg-white"
                onChange={(e) => setNewLabel(e.target.value)}
                aria-label="ノードラベル"
              />
              <Button onClick={handleUpdateLabel}>保存</Button>
            </div>
          </DialogContent>
        </Dialog>

        <Button
          onClick={() => selectedNode && deleteNode(selectedNode.id)}
          disabled={!selectedNode}
        >
          削除
          <Trash className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex gap-2">
        {/* 既存のボタンの前に追加 */}
        <div className="flex gap-2">
          <Button
            onClick={undo}
            disabled={!canUndo}
            size="sm"
            variant="outline"
          >
            <Undo className="w-4 h-4" />
          </Button>
          <Button
            onClick={redo}
            disabled={!canRedo}
            size="sm"
            variant="outline"
          >
            <Redo className="w-4 h-4" />
          </Button>
        </div>
        <div className="px-2">
          <Separator orientation="vertical" />
        </div>
        <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="font-pixel text-xs flex items-center gap-1"
            >
              すべてリセット
              <RefreshCw className="w-4 h-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] space-y-2">
            <DialogTitle>すべてリセット</DialogTitle>
            <DialogDescription>初期状態にリセットしますか？</DialogDescription>
            <Button
              onClick={() => {
                resetMindMap();
                setIsResetDialogOpen(false);
              }}
            >
              削除
            </Button>
          </DialogContent>
        </Dialog>
      </div>
    </header>
  );
}
