/* ═══════════════════════════════════════════════════════
   LeafNode — Child knowledge node (circular orb)

   Type colour mapping:
     concept  → blue/indigo gradient
     resource → teal/green gradient
     milestone → amber/orange gradient

   Energy glow system via --node-energy CSS variable.
   ═══════════════════════════════════════════════════════ */

import { memo, useMemo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { motion } from 'framer-motion';
import { calculateEnergy } from '../../utils/energy';
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

const TYPE_GRADIENTS: Record<string, string> = {
  concept:   'radial-gradient(circle at 38% 35%, #4a3ab8, #221860)',
  resource:  'radial-gradient(circle at 38% 35%, #1a8a6a, #0a4035)',
  milestone: 'radial-gradient(circle at 38% 35%, #c88020, #7a4a08)',
  root:      'radial-gradient(circle at 38% 35%, #c03070, #7a1040)',
};

function LeafNodeComponent({ data, selected }: LeafNodeType) {
  const energy = useMemo(() => calculateEnergy(data.updatedAt), [data.updatedAt]);
  const bg = TYPE_GRADIENTS[data.nodeType] ?? TYPE_GRADIENTS.concept;

  const energyGlow = useMemo(() => {
    const e = energy.level;
    // Use the node's custom color for the glow
    const r = parseInt(data.color.slice(1, 3), 16) || 80;
    const g = parseInt(data.color.slice(3, 5), 16) || 80;
    const b = parseInt(data.color.slice(5, 7), 16) || 200;
    return [
      `0 0 ${e * 32}px rgba(${r},${g},${b},${e * 0.65})`,
      `inset 0 1px 0 rgba(255,255,255,0.14)`,
    ].join(', ');
  }, [energy.level, data.color]);

  const diameter = 'calc(var(--node-r) * 2)';

  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

      {/* Outer static ring — subtle opacity */}
      <div
        style={{
          position: 'absolute',
          width: diameter,
          height: diameter,
          borderRadius: '50%',
          border: `1.5px solid rgba(255,255,255,${0.08 + energy.level * 0.12})`,
          transform: 'scale(1.18)',
          pointerEvents: 'none',
        }}
      />

      {/* Selected ring */}
      {selected && (
        <motion.div
          style={{
            position: 'absolute',
            width: diameter,
            height: diameter,
            borderRadius: '50%',
            border: '2px solid var(--pink)',
            pointerEvents: 'none',
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          initial={{ scale: 1.25 }}
        />
      )}

      {/* Main orb body */}
      <motion.div
        style={{
          width: diameter,
          height: diameter,
          borderRadius: '50%',
          background: bg,
          boxShadow: energyGlow,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          position: 'relative',
          transition: `transform var(--t-base) var(--ease), box-shadow var(--t-base) var(--ease)`,
        }}
        whileHover={{ scale: 1.08, boxShadow: 'var(--pink-glow)' }}
      >
        {/* Glass specular highlight */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 32% 28%, rgba(255,255,255,0.15) 0%, transparent 55%)',
            pointerEvents: 'none',
          }}
        />

        {/* Label */}
        <span
          style={{
            fontSize: 'var(--node-font)',
            fontWeight: 'var(--fw-medium)',
            color: '#fff',
            textAlign: 'center',
            lineHeight: 1.2,
            padding: '0 8px',
            wordBreak: 'break-word',
            maxWidth: 'calc(var(--node-r) * 1.6)',
            textShadow: '0 1px 3px rgba(0,0,0,0.6)',
            position: 'relative',
            zIndex: 1,
            userSelect: 'none',
          }}
        >
          {data.label}
        </span>
      </motion.div>

      {/* Handles */}
      <Handle type="target" position={Position.Top} className="!bg-transparent !border-0" style={{ top: -3 }} />
      <Handle type="source" position={Position.Bottom} className="!bg-transparent !border-0" style={{ bottom: -3 }} />
      <Handle type="target" id="left" position={Position.Left} className="!bg-transparent !border-0" />
      <Handle type="target" id="right" position={Position.Right} className="!bg-transparent !border-0" />
    </div>
  );
}

export default memo(LeafNodeComponent);
