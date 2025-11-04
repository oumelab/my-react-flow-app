import {Button} from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {Input} from "@/components/ui/input";
import {
  exportAtom,
  importFromJSONAtom,
  importFromMarkdownAtom,
} from "@/store/export-import-store";
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
import {
  DropdownMenuPortal,
  DropdownMenuSubContent,
} from "@radix-ui/react-dropdown-menu";
import {useAtom} from "jotai";
import {
  Download,
  MoreVertical,
  Pen,
  Plus,
  Redo,
  RefreshCw,
  Trash,
  Undo,
  Upload,
} from "lucide-react";
import {useEffect, useRef, useState} from "react";
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

  const [, exportData] = useAtom(exportAtom);
  const [, importJSON] = useAtom(importFromJSONAtom);
  const [, importMarkdown] = useAtom(importFromMarkdownAtom);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importFormat, setImportFormat] = useState<"json" | "markdown">("json");
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [pendingImportFile, setPendingImportFile] = useState<File | null>(null);

  // キーボードショートカット
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 入力フィールドにフォーカスがある時はショートカットを無効化
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
      // Shiftキー押下時の大文字対応
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

  const handleUpdateLabel = () => {
    if (selectedNode && newLabel.trim()) {
      updateNodeLabel({nodeId: selectedNode.id, newLabel});
    }
    setIsEditDialogOpen(false);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 確認ダイアログを表示
    setPendingImportFile(file);
    setIsImportDialogOpen(true);

    // input をリセット
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const confirmImport = () => {
    if (!pendingImportFile) return;

    if (importFormat === "json") {
      importJSON(pendingImportFile);
    } else {
      importMarkdown(pendingImportFile);
    }

    setIsImportDialogOpen(false);
    setPendingImportFile(null);
  };

  return (
    <header className="bg-muted border-b p-2 flex items-center justify-between">
      <div className="flex items-center">
        <h1 className="font-pixel text-foreground text-xl font-bold ml-4">
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
            size="icon"
            variant="outline"
          >
            <Undo className="w-4 h-4" />
            <span className="sr-only">元に戻す</span>
          </Button>
          <Button
            onClick={redo}
            disabled={!canRedo}
            size="icon"
            variant="outline"
          >
            <Redo className="w-4 h-4" />
            <span className="sr-only">やり直す</span>
          </Button>
        </div>
        <div className="px-1">
          <Separator orientation="vertical" />
        </div>
        <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              disabled={!canUndo}
              className="font-pixel flex items-center gap-1"
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

        {/* その他メニュー */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-popover data-[state=open]:bg-popover"
            >
              <MoreVertical className="w-4 h-4" />
              <span className="sr-only">その他のメニュー</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            sideOffset={4}
            side="bottom"
            alignOffset={0}
          >
            {/* エクスポート */}
            <DropdownMenuGroup>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="gap-6">
                  <span className="flex gap-2 items-center">
                    <Download className="size-4" />
                    エクスポート
                  </span>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent
                    className="z-60 bg-popover text-popover-foreground border rounded-md p-1 shadow-md"
                    sideOffset={4}
                    alignOffset={-4}
                  >
                    <DropdownMenuItem onClick={() => exportData("json")}>
                      JSON 形式
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => exportData("markdown")}>
                      Markdown 形式
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            {/* インポート */}
            <DropdownMenuGroup>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="gap-6">
                  <span className="flex gap-2 items-center">
                    <Upload className="size-4" />
                    インポート
                  </span>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent
                    className="z-60 bg-popover text-popover-foreground border rounded-md p-1 shadow-md"
                    sideOffset={4}
                    alignOffset={-4}
                  >
                    <DropdownMenuItem
                      onClick={() => {
                        setImportFormat("json");
                        fileInputRef.current?.click();
                      }}
                    >
                      JSON 形式
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setImportFormat("markdown");
                        fileInputRef.current?.click();
                      }}
                    >
                      Markdown 形式
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json,.md"
          onChange={handleImport}
          className="hidden"
        />
        {/* インポート確認ダイアログ（リセットダイアログの近くに追加） */}
        <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
          <DialogContent className="sm:max-w-[425px] space-y-2">
            <DialogTitle>データをインポート</DialogTitle>
            <DialogDescription>
              既存のマインドマップが上書きされます。よろしいですか？
            </DialogDescription>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setIsImportDialogOpen(false)}
              >
                キャンセル
              </Button>
              <Button onClick={confirmImport}>インポート</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </header>
  );
}
