/* ═══════════════════════════════════════════════════════
   GraphCanvas — Upgraded React Flow wrapper

   Supports:
     - Draggable nodes with position persistence
     - Edge creation via drag-connect
     - Node click → open editor
     - Background dot grid
   ═══════════════════════════════════════════════════════ */

import { useCallback, useMemo, useRef } from 'react';
import {
  ReactFlow,
  type Node,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
  type NodeTypes,
  type EdgeTypes,
  type OnConnect,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  Background,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import SkillNode from './SkillNode';
import LeafNode from './LeafNode';
import NeuralEdge from './NeuralEdge';

interface GraphCanvasProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: (nodes: Node[]) => void;
  onEdgesChange: (edges: Edge[]) => void;
  onNodeClick?: (nodeId: string) => void;
  onNodeDragStop?: (nodeId: string, x: number, y: number) => void;
  onConnect?: (sourceId: string, targetId: string) => void;
}

// Stable type registries — must be declared outside the component
const nodeTypes: NodeTypes = {
  skillNode: SkillNode,
  leafNode: LeafNode,
};

const edgeTypes: EdgeTypes = {
  default: NeuralEdge,
  energy: NeuralEdge,
};

export default function GraphCanvas({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onNodeClick,
  onNodeDragStop,
  onConnect: onConnectProp,
}: GraphCanvasProps) {
  const edgesRef = useRef(edges);
  edgesRef.current = edges;

  const handleNodesChange: OnNodesChange = useCallback(
    (changes) => {
      const updated = applyNodeChanges(changes, nodes);
      onNodesChange(updated);
    },
    [nodes, onNodesChange]
  );

  const handleEdgesChange: OnEdgesChange = useCallback(
    (changes) => {
      const updated = applyEdgeChanges(changes, edgesRef.current);
      onEdgesChange(updated);
    },
    [onEdgesChange]
  );

  const handleConnect: OnConnect = useCallback(
    (connection) => {
      if (onConnectProp && connection.source && connection.target) {
        onConnectProp(connection.source, connection.target);
      } else {
        // Fallback: add a temporary visual edge
        const updated = addEdge(
          { ...connection, type: 'energy', data: { color: '#ff69b4', energyLevel: 0.5 } },
          edgesRef.current
        );
        onEdgesChange(updated);
      }
    },
    [onConnectProp, onEdgesChange]
  );

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      onNodeClick?.(node.id);
    },
    [onNodeClick]
  );

  const handleNodeDragStop = useCallback(
    (_: React.MouseEvent, node: Node) => {
      onNodeDragStop?.(node.id, node.position.x, node.position.y);
    },
    [onNodeDragStop]
  );

  const defaultViewport = useMemo(() => ({ x: 0, y: 0, zoom: 0.85 }), []);

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={handleConnect}
        onNodeClick={handleNodeClick}
        onNodeDragStop={handleNodeDragStop}
        defaultViewport={defaultViewport}
        fitView
        fitViewOptions={{ padding: 0.3, maxZoom: 1.2 }}
        minZoom={0.1}
        maxZoom={3}
        proOptions={{ hideAttribution: true }}
        panOnScroll
        selectionOnDrag={false}
        deleteKeyCode={null}
        style={{ background: 'transparent' }}
        connectOnClick={false}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={32}
          size={1}
          color="rgba(255,255,255,0.04)"
        />
      </ReactFlow>
    </div>
  );
}
