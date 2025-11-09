import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  type Connection,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
} from "@xyflow/react";
import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { nanoid } from "nanoid";

// 初期ノード
const initialNodes: Node[] = [
  {
    id: "root",
    type: "mindMapNode",
    data: {label: "Main Idea"},
    position: {x: 250, y: 150},
  },
];

// 初期エッジ
const initialEdges: Edge[] = [];

// サンプル
// const countAtom = atom<number>(0);
/*
  コンポーネントで、useState と同じように使える！
  const [count, setCount] = useAtom(countAtom);
  setCount((c) => c + 1);
  setCount(10);
*/

// ブロック（ノード）、エッジ（線）、選択中のブロック の状態を管理

// ローカルストレージに保存されるアトム(Node = ブロック、Edge = ノードを繋ぐ線 ...どちらも実態は配列で管理されいる)
export const nodesAtom = atomWithStorage<Node[]>("mindmap-nodes", initialNodes);
export const edgesAtom = atomWithStorage<Edge[]>("mindmap-edges", initialEdges);

// 選択中のノードを管理するアトム
export const selectedNodeAtom = atom<Node | null>(null);

// 履歴の型定義
type HistoryState = {
  nodes: Node[];
  edges: Edge[];
};

// localStorage用のエラーハンドリング付きカスタムストレージ
const createSafeStorage = () => {
  // HistoryState の構造を検証するヘルパー関数
  const isValidHistoryState = (state: unknown): state is HistoryState => {
    if (!state || typeof state !== "object") return false;
    const candidate = state as Record<string, unknown>; 

    return (
      "nodes" in candidate &&
      "edges" in candidate &&
      Array.isArray(candidate.nodes) &&
      Array.isArray(candidate.edges)
    );
  };

  return {
    getItem: (
      key: string,
      initialValue: {past: HistoryState[]; future: HistoryState[]}
    ) => {
      try {
        const value = localStorage.getItem(key);
        if (!value) return initialValue;

        const parsed = JSON.parse(value);
        // 構造の検証（多層バリデーション）
        if (
          parsed &&
          typeof parsed === "object" &&
          Array.isArray(parsed.past) &&
          Array.isArray(parsed.future) &&
          parsed.past.every(isValidHistoryState) &&
          parsed.future.every(isValidHistoryState)
        ) {
          return parsed;
        }
        console.warn(`⚠️ 履歴データの構造が不正です (${key})。初期化します。`);
        return initialValue;
      } catch (e) {
        console.error(`履歴の読み込みに失敗しました (${key}):`, e);
        return initialValue;
      }
    },
    setItem: (
      key: string,
      value: {past: HistoryState[]; future: HistoryState[]}
    ) => {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (e) {
        if (e instanceof DOMException && e.name === "QuotaExceededError") {
          console.warn(
            "⚠️ localStorage の容量が上限に達しました。古い履歴を削除します。"
          );

          // 履歴をクリアして再試行
          localStorage.removeItem(key);
          try {
            localStorage.setItem(key, JSON.stringify(value));
            console.info("✓ 履歴をクリアして保存しました。");
          } catch (retryError) {
            console.error("❌ 履歴の保存に失敗しました:", retryError);
            // TODO: ユーザーへの通知を実装 - shadcn/ui Sonner など
            // 参考: alert('履歴の保存に失敗しました。ブラウザのストレージを確認してください。');
          }
        } else {
          console.error(`履歴の保存に失敗しました (${key}):`, e);
        }
      }
    },
    removeItem: (key: string) => {
      try {
        localStorage.removeItem(key);
      } catch (e) {
        console.error(`履歴の削除に失敗しました (${key}):`, e);
      }
    },
  };
};

// 履歴管理 - ローカルストレージに永続化
export const historyAtom = atomWithStorage<{
  past: HistoryState[];
  future: HistoryState[];
}>(
  "mindmap-history",
  {
    past: [],
    future: [],
  },
  createSafeStorage()
);

// 現在の状態を履歴に保存
const MAX_HISTORY = 20; // 最大20件（永続化により削減）
export const saveToHistoryAtom = atom(null, (get, set) => {
  const currentNodes = get(nodesAtom);
  const currentEdges = get(edgesAtom);
  const history = get(historyAtom);

  const newPast = [
    ...history.past,
    {nodes: [...currentNodes], edges: [...currentEdges]},
  ];

  set(historyAtom, {
    past: newPast.slice(-MAX_HISTORY), // 上限を超えたら古いものを削除
    future: [], // 新しい操作で future をクリア
  });
});

// Undo
export const undoAtom = atom(null, (get, set) => {
  const history = get(historyAtom);

  if (history.past.length === 0) return;

  const currentState = {
    nodes: get(nodesAtom),
    edges: get(edgesAtom),
  };

  const previousState = history.past[history.past.length - 1];
  const newPast = history.past.slice(0, -1);

  set(nodesAtom, previousState.nodes);
  set(edgesAtom, previousState.edges);
  set(historyAtom, {
    past: newPast,
    future: [currentState, ...history.future],
  });
});

// Redo
export const redoAtom = atom(null, (get, set) => {
  const history = get(historyAtom);

  if (history.future.length === 0) return;

  const currentState = {
    nodes: get(nodesAtom),
    edges: get(edgesAtom),
  };

  const nextState = history.future[0];
  const newFuture = history.future.slice(1);

  set(nodesAtom, nextState.nodes);
  set(edgesAtom, nextState.edges);
  set(historyAtom, {
    past: [...history.past, currentState],
    future: newFuture,
  });
});

// Undo/Redo 可能かどうかのアトム
export const canUndoAtom = atom((get) => get(historyAtom).past.length > 0);
export const canRedoAtom = atom((get) => get(historyAtom).future.length > 0);

// ドラッグ中のノードを追跡
const draggingNodesAtom = atom<Set<string>>(new Set<string>());

// ノードを更新するアトム ... 変更があったノードを更新
export const nodesChangeAtom = atom(null, (get, set, changes: NodeChange[]) => {
  const draggingNodes = get(draggingNodesAtom);

  // ドラッグ開始を検出（dragging=true で、まだ追跡されていないノード）
  const hasDragStart = changes.some(
    (c) =>
      c.type === "position" &&
      "dragging" in c &&
      c.dragging === true &&
      "id" in c &&
      !draggingNodes.has(c.id)
  );

  // ドラッグ開始時に履歴保存（変更前の状態を保存）
  if (hasDragStart) {
    set(saveToHistoryAtom);
  }

  // ドラッグ状態を更新
  const newDraggingNodes = new Set(draggingNodes);
  changes.forEach((c) => {
    if (c.type === "position" && "dragging" in c && "id" in c) {
      if (c.dragging) {
        newDraggingNodes.add(c.id);
      } else {
        newDraggingNodes.delete(c.id);
      }
    }
  });
  set(draggingNodesAtom, newDraggingNodes);

  set(nodesAtom, applyNodeChanges(changes, get(nodesAtom))); // applyNodeChanges = React Flow の関数
});

// エッジを更新するアトム
export const edgesChangeAtom = atom(null, (get, set, changes: EdgeChange[]) => {
  set(edgesAtom, applyEdgeChanges(changes, get(edgesAtom))); // applyEdgeChanges = React Flow の関数
});

// ノード接続のアトム
export const connectAtom = atom(null, (_, set, connection: Connection) => {
  set(saveToHistoryAtom); // 履歴に保存
  set(edgesAtom, (eds) =>
    addEdge(
      // addEdge = React Flow の関数（何と何が繋がれたか取得）
      {
        ...connection,
        animated: true,
        style: {stroke: "#ccc", strokeWidth: 3},
      },
      eds
    )
  );
});

// 子ノードを追加するアトム
export const addChildNodeAtom = atom(null, (get, set, parentNode: Node) => {
  set(saveToHistoryAtom); // 履歴に保存

  const newNodeId = `node_${nanoid(6)}`;
  const parentPosition = parentNode.position; // 親ノードのポジションを基準に配置

  // 新しいノードを親の右下に配置
  const newNode = {
    id: newNodeId,
    type: "mindMapNode",
    data: {label: "New Idea"},
    position: {
      x: parentPosition.x + 100,
      y: parentPosition.y + 100,
    },
  };

  set(nodesAtom, [...get(nodesAtom), newNode]);

  // 親から新しいノードへのエッジを作成
  const newEdge = {
    id: `edge_${nanoid(6)}`,
    source: parentNode.id,
    target: newNodeId,
    animated: true,
    style: {stroke: "#ccc", strokeWidth: 3},
  };

  set(edgesAtom, [...get(edgesAtom), newEdge]);
});

// ノードラベルを更新するアトム
export const updateNodeLabelAtom = atom(
  null,
  (get, set, {nodeId, newLabel}: {nodeId: string; newLabel: string}) => {
    set(saveToHistoryAtom); // 履歴に保存

    set(
      nodesAtom,
      get(nodesAtom).map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              label: newLabel, // 新しいラベルに更新
            },
          };
        }
        return node;
      })
    );
  }
);

// ノードを削除するアトム
export const deleteNodeAtom = atom(null, (get, set, nodeId: string) => {
  // ルートノードの削除を許可しない
  if (nodeId === "root") return;

  set(saveToHistoryAtom); // 履歴に保存

  set(
    nodesAtom,
    get(nodesAtom).filter((node) => node.id !== nodeId)
  );
  set(
    edgesAtom,
    get(edgesAtom).filter(
      // 結ばれている線があったら線も一緒に削除
      (edge) => edge.source !== nodeId && edge.target !== nodeId
    )
  );
});

// テキストブロックを追加するアトム
export const addTextBlockAtom = atom(null, (get, set, text: string) => {
  set(saveToHistoryAtom); // 履歴に保存

  const nodes = get(nodesAtom);

  const newNodeId = `node_${nanoid(6)}`;

  // 既存のノードと重ならない位置を見つける
  const newNode = {
    id: newNodeId,
    type: "mindMapNode",
    data: {label: text},
    position: {
      x: Math.random() * 300 + 100,
      y: Math.random() * 300 + 100,
    },
  };

  set(nodesAtom, [...nodes, newNode]);
});

// マインドマップをリセットするアトム
export const resetMindMapAtom = atom(null, (_, set) => {
  // 履歴を保存せず、履歴もクリア
  set(historyAtom, {
    past: [],
    future: [],
  });

  set(nodesAtom, initialNodes);
  set(edgesAtom, initialEdges);
  set(selectedNodeAtom, null); // 選択状態もクリア
});
