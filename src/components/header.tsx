import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  addChildNodeAtom,
  deleteNodeAtom,
  resetMindMapAtom,
  selectedNodeAtom,
  updateNodeLabelAtom,
} from "@/store/mind-map-store";
import { useAtom } from "jotai";
import { Pen, Plus, RefreshCw, Trash } from "lucide-react";
import { useState } from "react";

export function Header() {
  const [selectedNode] = useAtom(selectedNodeAtom);
  const [, addChildNode] = useAtom(addChildNodeAtom);
  const [, updateNodeLabel] = useAtom(updateNodeLabelAtom);
  const [, deleteNode] = useAtom(deleteNodeAtom);
  const [, resetMindMap] = useAtom(resetMindMapAtom);

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [newLabel, setNewLabel] = useState("");

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
            <Button 
            disabled={!selectedNode} 
            >
              編集
              <Pen className="w-4 h-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>✏️ 内容を更新：</DialogTitle>
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
            <DialogTitle>初期状態にリセットしますか？</DialogTitle>
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
