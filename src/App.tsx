import { Background, Controls, MiniMap, ReactFlow } from "@xyflow/react";
import { useAtom } from "jotai";
import { Header } from "./components/header";
import { MindMapNode } from "./components/mind-map-node";
import { Sidebar } from "./components/sidebar";
import {
  connectAtom,
  edgesAtom,
  edgesChangeAtom,
  nodesAtom,
  nodesChangeAtom,
  selectedNodeAtom,
} from "./store/mind-map-store";

// カスタムノードタイプを定義
const nodeTypes = {
  mindMapNode: MindMapNode,
};

function App() {
  // Jotaiを使って状態を管理
  const [nodes] = useAtom(nodesAtom);
  const [edges] = useAtom(edgesAtom);
  const [, setSelectedNode] = useAtom(selectedNodeAtom);
  const [, onNodesChange] = useAtom(nodesChangeAtom);
  const [, onEdgesChange] = useAtom(edgesChangeAtom);
  const [, onConnect] = useAtom(connectAtom);

  return (
    <>
      <div className="md:hidden flex items-center justify-center h-screen p-4 bg-muted">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-bold">Simple Mind-Map</h2>
          <p className="text-sm text-muted-foreground">
            このアプリはタブレット以上の画面サイズでご利用ください
          </p>
        </div>
      </div>
      <div className="hidden md:flex flex-col h-screen">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <main className="flex-1 h-full">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              nodeTypes={nodeTypes}
              fitView
              minZoom={0.5}
              maxZoom={2}
              nodesDraggable={true}
              elementsSelectable={true}
              snapToGrid={true}
              snapGrid={[15, 15]}
              onNodeClick={(_, node) => {
                setSelectedNode({
                  id: node.id,
                  data: node.data,
                  position: node.position,
                });
              }}
              colorMode="light"
              onPaneClick={() => setSelectedNode(null)}
              proOptions={{hideAttribution: true}}
            >
              <Background />
              <Controls className="p-1 rounded-md border-2 border-muted-foreground" />
              <MiniMap
                nodeColor={(n) => {
                  if (n.id === "root") return "#333";
                  return "#ccc";
                }}
                maskColor="rgba(255, 255, 255, 0.5)"
                className="rounded-md border-2 border-muted-foreground"
              />
            </ReactFlow>
          </main>
          <Sidebar />
        </div>
      </div>
    </>
  );
}

export default App;
