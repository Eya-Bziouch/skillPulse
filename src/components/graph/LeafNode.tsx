/* ═══════════════════════════════════════════════════════
   LeafNode — Child knowledge node (concept/resource/milestone)
   
   A smaller, pill-shaped node connected to a parent skill.
   Floats gently, inherits a tint from its parent color,
   and glows proportionally to its energy level.
   ═══════════════════════════════════════════════════════ */

import { memo, useMemo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { motion } from 'framer-motion';
import { calculateEnergy, getGlowShadow } from '../../utils/energy';
import type { NodeType } from '../../types';

export interface LeafNodeData {
  label: string;
  color: string;
  updatedAt: number;
  nodeType: NodeType;
  description?: string;
  [key: string]: unknown;
}

type LeafNodeType = NodeProps & { data: LeafNodeData };

/** Icon indicator based on node type */
function NodeTypeIcon({ nodeType }: { nodeType: NodeType }) {
  switch (nodeType) {
    case 'concept':
      return <span className="text-xs opacity-60 mr-1.5">◆</span>;
    case 'resource':
      return <span className="text-xs opacity-60 mr-1.5">◈</span>;
    case 'milestone':
      return <span className="text-xs opacity-60 mr-1.5">★</span>;
    default:
      return null;
  }
}

function LeafNodeComponent({ data, selected }: LeafNodeType) {
  const energy = useMemo(() => calculateEnergy(data.updatedAt), [data.updatedAt]);
  const glowShadow = useMemo(() => getGlowShadow(data.color, energy), [data.color, energy]);

  // Randomized float delay for organic feel
  const floatDelay = useMemo(() => Math.random() * 3, []);

  return (
    <div className="relative flex items-center justify-center">
      {/* Subtle glow behind the pill */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: '120%',
          height: '150%',
          background: `radial-gradient(ellipse, ${data.color}10 0%, transparent 70%)`,
        }}
        animate={{
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: energy.pulseSpeed * 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Main pill body */}
      <motion.div
        className="relative flex items-center gap-0.5 rounded-full cursor-pointer select-none"
        style={{
          padding: '8px 18px',
          background: `linear-gradient(135deg, ${data.color}22 0%, ${data.color}11 100%)`,
          border: `1px solid ${data.color}${Math.round(energy.level * 60 + 15).toString(16).padStart(2, '0')}`,
          boxShadow: glowShadow,
          opacity: energy.opacity,
          backdropFilter: 'blur(8px)',
        }}
        animate={{
          y: [0, -3, 0],
        }}
        transition={{
          duration: 4 + Math.random() * 2,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: floatDelay,
        }}
        whileHover={{
          scale: 1.08,
          borderColor: `${data.color}88`,
        }}
      >
        {/* Living dot indicator */}
        <motion.div
          className="rounded-full mr-2 flex-shrink-0"
          style={{
            width: 6,
            height: 6,
            background: data.color,
            boxShadow: `0 0 6px ${data.color}`,
          }}
          animate={{
            opacity: [0.5, 1, 0.5],
            scale: [0.8, 1.1, 0.8],
          }}
          transition={{
            duration: energy.pulseSpeed,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        <NodeTypeIcon nodeType={data.nodeType} />

        <span
          className="font-body font-medium"
          style={{
            fontSize: 'var(--node-font)',
            color: data.color,
            textShadow: `0 0 10px ${data.color}40`,
            whiteSpace: 'nowrap',
          }}
        >
          {data.label}
        </span>
      </motion.div>

      {/* Selection ring */}
      {selected && (
        <motion.div
          className="absolute rounded-full pointer-events-none"
          style={{
            inset: -4,
            border: `2px solid ${data.color}`,
            borderRadius: 9999,
          }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 0.6, scale: 1 }}
          transition={{ duration: 0.2 }}
        />
      )}

      {/* Handles */}
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-transparent !border-0"
        style={{ top: -3 }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-transparent !border-0"
        style={{ bottom: -3 }}
      />
      <Handle
        type="target"
        id="left"
        position={Position.Left}
        className="!bg-transparent !border-0"
      />
      <Handle
        type="target"
        id="right"
        position={Position.Right}
        className="!bg-transparent !border-0"
      />
    </div>
  );
}

export default memo(LeafNodeComponent);
