import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import {
  type Edge,
  type Node,
  type NodeChange,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  type EdgeChange,
  type Connection,
} from "@xyflow/react";

// 初期ノード
const initialNodes: Node[] = [
  {
    id: "root",
    type: "mindMapNode",
    data: { label: "Main Idea" },
    position: { x: 250, y: 150 },
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


// ノードを更新するアトム ... 変更があったノードを更新
export const nodesChangeAtom = atom(null, (get, set, changes: NodeChange[]) => {
  set(nodesAtom, applyNodeChanges(changes, get(nodesAtom))); // applyNodeChanges = React Flow の関数
});

// エッジを更新するアトム
export const edgesChangeAtom = atom(null, (get, set, changes: EdgeChange[]) => {
  set(edgesAtom, applyEdgeChanges(changes, get(edgesAtom))); // applyEdgeChanges = React Flow の関数
});

// ノード接続のアトム
export const connectAtom = atom(null, (_, set, connection: Connection) => {
  set(edgesAtom, (eds) =>
    addEdge( // addEdge = React Flow の関数（何と何が繋がれたか取得）
      {
        ...connection,
        animated: true,
        style: { stroke: "#ccc", strokeWidth: 3 },
      },
      eds
    )
  );
});

// 子ノードを追加するアトム
export const addChildNodeAtom = atom(null, (get, set, parentNode: Node) => {
  const nodes = get(nodesAtom);
  const newNodeId = `node_${nodes.length + 1}`; // id はユニークなもの
  const parentPosition = parentNode.position; // 親ノードのポジションを基準に配置

  // 新しいノードを親の右下に配置
  const newNode = {
    id: newNodeId,
    type: "mindMapNode",
    data: { label: "New Idea" },
    position: {
      x: parentPosition.x + 100,
      y: parentPosition.y + 100,
    },
  };

  set(nodesAtom, [...nodes, newNode]);

  // 親から新しいノードへのエッジを作成
  const newEdge = {
    id: `edge_${parentNode.id}_${newNodeId}`,
    source: parentNode.id,
    target: newNodeId,
    animated: true,
    style: { stroke: "#ccc", strokeWidth: 3 },
  };

  set(edgesAtom, [...get(edgesAtom), newEdge]);
});

// ノードラベルを更新するアトム
export const updateNodeLabelAtom = atom(
  null,
  (get, set, { nodeId, newLabel }: { nodeId: string; newLabel: string }) => {
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

  set(
    nodesAtom,
    get(nodesAtom).filter((node) => node.id !== nodeId)
  );
  set(
    edgesAtom,
    get(edgesAtom).filter( // 結ばれている線があったら線も一緒に削除
      (edge) => edge.source !== nodeId && edge.target !== nodeId
    )
  );
});

// テキストブロックを追加するアトム
export const addTextBlockAtom = atom(null, (get, set, text: string) => {
  const nodes = get(nodesAtom);
  const newNodeId = `node_${nodes.length + 1}`;

  // 既存のノードと重ならない位置を見つける
  const newNode = {
    id: newNodeId,
    type: "mindMapNode",
    data: { label: text },
    position: {
      x: Math.random() * 300 + 100,
      y: Math.random() * 300 + 100,
    },
  };

  set(nodesAtom, [...nodes, newNode]);
});

// マインドマップをリセットするアトム
export const resetMindMapAtom = atom(null, (_, set) => {
  set(nodesAtom, initialNodes);
  set(edgesAtom, initialEdges);
});