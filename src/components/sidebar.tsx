import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Type } from "lucide-react";

// テキストブロック作成コンポーネント
const TextBlockCreator = () => {
  const [text, setText] = useState<string>("");

  const handleAddTextBlock = () => {
    // 後で実装
    console.log("テキストブロック追加:", text);
    setText("");
  };

  return (
    <div className="bg-white rounded-lg p-3 border-2">
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
    </div>
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
      <li>ブロックをつなげてマインドマップを構築しましょう！</li>
      <li>ダブルクリックでズームできますよ😎</li>
    </ol>
  </div>
);

// メインのサイドバーコンポーネント
export function Sidebar() {
  return (
    <div className="w-64 h-full bg-muted border-l flex flex-col overflow-auto">
      <div className="p-4 border-b">
        <h2 className="font-pixel text-lg mb-2">
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