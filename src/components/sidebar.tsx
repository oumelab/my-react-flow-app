import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Kbd, KbdGroup } from "@/components/ui/kbd"
import { Type } from "lucide-react";
import { addTextBlockAtom } from "@/store/mind-map-store";
import { useAtom } from "jotai";

// テキストブロック作成コンポーネント
const TextBlockCreator = () => {
  const [text, setText] = useState<string>("");
  const [, onAddBlock] = useAtom(addTextBlockAtom);

  const handleAddTextBlock = () => {
    if (text.trim()) {
      onAddBlock(text);
      setText("");
    }
  };


  return (
    <aside className="bg-white rounded-lg p-3 border-2">
      <h3 className="font-pixel text-sm mb-2 flex items-center">
        <Type className="w-4 h-4 mr-1" /> アイデア
      </h3>
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="ideas here..."
        className="border-2 h-20 text-sm mb-2 font-pixel"
      />
      <Button
        onClick={handleAddTextBlock}
        className="w-full font-pixel text-xs"
        disabled={!text.trim()}
      >
        追加する
      </Button>
    </aside>
  );
};

// 使い方コンポーネント
const Instructions = () => (
  <div className="bg-white rounded-lg p-3 border-2">
    <h3 className="font-pixel text-sm mb-2">使い方</h3>
    <ol className="text-xs space-y-2 list-disc pl-5">
      <li>ブロックをクリックして選択</li>
      <li>ブロックをドラッグして移動</li>
      <li>新規ブロックはサイドバーで作成</li>
      <li><KbdGroup>
        <Kbd>Ctrl</Kbd>
        <span>+</span>
        <Kbd>Z</Kbd>
      </KbdGroup> で操作を戻す</li>
        <li><KbdGroup>
        <Kbd>Ctrl</Kbd>
        <span>+</span>
        <Kbd>Shift</Kbd>
        <span>+</span>
        <Kbd>Z</Kbd>
      </KbdGroup> でやり直し</li>
      <li>ブロックをつなげてマインドマップを構築しましょう！</li>
      <li>ダブルクリックでズームできます</li>
    </ol>
  </div>
);

// メインのサイドバーコンポーネント
export function Sidebar() {
  return (
    <div className="w-64 h-full bg-muted border-l flex flex-col overflow-auto">
      <div className="p-4 border-b">
        <h2 className="font-pixel text-lg">
          新規ブロックを追加
        </h2>
      </div>

      <div className="p-4 flex flex-col gap-4">
        <TextBlockCreator />
        <Separator className="h-0.5" />
        <Instructions />
      </div>
    </div>
  );
}