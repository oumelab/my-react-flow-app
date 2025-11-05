import {atom} from "jotai";
import {type Node, type Edge} from "@xyflow/react";
import {
  nodesAtom,
  edgesAtom,
  selectedNodeAtom,
  saveToHistoryAtom,
} from "./mind-map-store";

// エクスポートデータの型定義
type ExportFormat = "json" | "markdown";

// JSON エクスポート
const exportToJSONAtom = atom(null, (get) => {
  const nodes = get(nodesAtom);
  const edges = get(edgesAtom);

  const data = {
    version: "1.0",
    createdAt: new Date().toISOString(),
    nodes,
    edges,
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `mindmap-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
});

// Markdown エクスポート
const exportToMarkdownAtom = atom(null, (get) => {
  const nodes = get(nodesAtom);
  const edges = get(edgesAtom);

  // ツリー構造を構築
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const childrenMap = new Map<string, string[]>();

  edges.forEach((edge) => {
    const children = childrenMap.get(edge.source) || [];
    children.push(edge.target);
    childrenMap.set(edge.source, children);
  });

  // 再帰的にマークダウンを生成
  const buildMarkdown = (nodeId: string, level: number): string => {
    const node = nodeMap.get(nodeId);
    if (!node) return "";

    const indent = "  ".repeat(level);
    const prefix = level === 0 ? "# " : "- ";
    let markdown = `${indent}${prefix}${node.data.label}\n`;

    const children = childrenMap.get(nodeId) || [];
    children.forEach((childId) => {
      markdown += buildMarkdown(childId, level + 1);
    });

    return markdown;
  };

  const markdown = buildMarkdown("root", 0);

  const blob = new Blob([markdown], {type: "text/markdown"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `mindmap-${Date.now()}.md`;
  a.click();
  URL.revokeObjectURL(url);
});

// 統合エクスポートアトム
export const exportAtom = atom(null, (_, set, format: ExportFormat) => {
  if (format === "json") {
    set(exportToJSONAtom);
  } else {
    set(exportToMarkdownAtom);
  }
});

// JSON インポート
export const importFromJSONAtom = atom(null, (_, set, file: File) => {
  // ファイル拡張子をチェック
  if (!file.name.toLowerCase().endsWith(".json")) {
    alert("JSON形式のファイルを選択してください");
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      // インポート前に履歴保存
      set(saveToHistoryAtom);

      const result = e.target?.result as string;
      const data = JSON.parse(result);

      // バリデーション強化
      if (!data.nodes || !data.edges) {
        throw new Error("Invalid JSON format");
      }

      // 配列かどうかチェック
      if (!Array.isArray(data.nodes) || !Array.isArray(data.edges)) {
        throw new Error("Invalid JSON format: nodes and edges must be arrays");
      }

      // 必須プロパティのチェック
      if (
        data.nodes.some((node: Node) => !node.id || !node.data || !node.position)
      ) {
        throw new Error(
          "Invalid JSON format: nodes must have id, data, and position"
        );
      }

      set(nodesAtom, data.nodes);
      set(edgesAtom, data.edges);
      set(selectedNodeAtom, null);
    } catch (error) {
      console.error("Import error:", error);
      alert(
        "ファイルの読み込みに失敗しました。正しいJSON形式のファイルを選択してください。"
      );
    }
  };
  reader.readAsText(file);
});

// Markdown インポート
export const importFromMarkdownAtom = atom(
  null, (_, set, file: File) => {
  // ファイル拡張子をチェック
const lowerName = file.name.toLowerCase();
if (!lowerName.endsWith('.md') && !lowerName.endsWith('.markdown')) {
    alert('Markdown形式のファイルを選択してください');
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      // インポート前に履歴保存
      set(saveToHistoryAtom);

      const result = e.target?.result as string;

      // 空ファイルチェック
      if (!result.trim()) {
        throw new Error('Empty markdown file');
      }

      // タブを2スペースに変換（一貫したインデント処理のため）
      const normalizedResult = result.replace(/\t/g, '  ');
      const lines = normalizedResult .split("\n").filter((line) => line.trim());

      const newNodes: Node[] = [];
      const newEdges: Edge[] = [];
      const nodeStack: {id: string; level: number}[] = [];
      let nodeId = 0;

      lines.forEach((line) => {
        // インデントレベルを計算
        const level = Math.floor((line.search(/\S/) || 0) / 2);
        const text = line.replace(/^[\s#\-*]+/, "").trim();

        if (!text) return;

        const id = nodeId === 0 ? "root" : `node-${nodeId}`;

        // ノードを作成
        newNodes.push({
          id,
          type: "mindMapNode",
          position: {x: level * 200, y: nodeId * 80},
          data: {label: text},
        });

        // 親ノードを見つけてエッジを作成
        if (level > 0) {
          while (
            nodeStack.length > 0 &&
            nodeStack[nodeStack.length - 1].level >= level
          ) {
            nodeStack.pop();
          }
          if (nodeStack.length > 0) {
            newEdges.push({
              id: `edge-${nodeId}`,
              source: nodeStack[nodeStack.length - 1].id,
              target: id,
              animated: true,
              style: {stroke: "#ccc", strokeWidth: 3},
            });
          }
        }

        nodeStack.push({id, level});
        nodeId++;
      });

      // 有効なノードが1つも見つからなかったらエラー
      if (newNodes.length === 0) {
        throw new Error('No valid nodes found in Markdown file');
      }

      set(nodesAtom, newNodes);
      set(edgesAtom, newEdges);
      set(selectedNodeAtom, null);
    } catch (error) {
      console.error("Import error:", error);
      alert("ファイルの読み込みに失敗しました。正しいMarkdown形式のファイルを選択してください。");
    }
  };
  reader.readAsText(file);
});
