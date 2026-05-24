/* ═══════════════════════════════════════════════════════
   SkillNode — Root skill node (glass orb)

   - Always glowing (--pink-glow)
   - Energy glow proportional to recency
   - Inner highlight pseudo via box-shadow hack
   - Selected: rotating border ring
   ═══════════════════════════════════════════════════════ */

import { memo, useMemo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { motion } from 'framer-motion';
import { calculateEnergy } from '../../utils/energy';

export interface SkillNodeData {
  label: string;
  color: string;
  updatedAt: number;
  nodeType: 'root';
  description?: string;
  [key: string]: unknown;
}

type SkillNodeType = NodeProps & { data: SkillNodeData };

const ROOT_GRADIENT = 'radial-gradient(circle at 38% 35%, #c03070, #7a1040)';

function SkillNodeComponent({ data, selected }: SkillNodeType) {
  const energy = useMemo(() => calculateEnergy(data.updatedAt), [data.updatedAt]);

  /* Energy-driven glow — always has base pink glow as root */
  const energyGlow = useMemo(() => {
    const e = energy.level;
    return [
      `0 0 ${8 + e * 32}px rgba(224,64,123,${0.35 + e * 0.45})`,
      `0 0 ${24 + e * 20}px rgba(224,64,123,${0.15 + e * 0.25})`,
      /* Inner highlight — top-left glass specular */
      `inset 0 1px 0 rgba(255,255,255,0.18)`,
    ].join(', ');
  }, [energy.level]);

  const diameter = 'calc(var(--node-root-r) * 2)';

  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

      {/* Outer pulse ring — energy-driven */}
      <motion.div
        style={{
          position: 'absolute',
          width: diameter,
          height: diameter,
          borderRadius: '50%',
          border: `1.5px solid rgba(224,64,123,${0.18 + energy.level * 0.25})`,
          pointerEvents: 'none',
        }}
        animate={{
          scale: [1.18, 1.7, 1.18],
          opacity: [0.4 * energy.level + 0.05, 0, 0.4 * energy.level + 0.05],
        }}
        transition={{
          duration: energy.pulseSpeed,
          repeat: Infinity,
          ease: 'easeOut',
        }}
      />

      {/* Selected ring — slow rotation */}
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
          background: ROOT_GRADIENT,
          boxShadow: energyGlow,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          position: 'relative',
          transition: `transform var(--t-base) var(--ease), box-shadow var(--t-base) var(--ease)`,
        }}
        animate={{ scale: selected ? [1.04, 1.08, 1.04] : [1, 1.04, 1] }}
        transition={{ duration: energy.pulseSpeed * 1.2, repeat: Infinity, ease: 'easeInOut' }}
        whileHover={{ scale: 1.08 }}
      >
        {/* Glass specular highlight */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 32% 28%, rgba(255,255,255,0.18) 0%, transparent 55%)',
            pointerEvents: 'none',
          }}
        />

        {/* Label */}
        <span
          style={{
            fontSize: 'var(--node-root-font)',
            fontWeight: 'var(--fw-medium)',
            color: '#fff',
            textAlign: 'center',
            lineHeight: 1.2,
            padding: '0 8px',
            wordBreak: 'break-word',
            maxWidth: 'calc(var(--node-root-r) * 1.6)',
            textShadow: '0 1px 4px rgba(0,0,0,0.5)',
            position: 'relative',
            zIndex: 1,
            userSelect: 'none',
          }}
        >
          {data.label}
        </span>
      </motion.div>

      {/* Handles */}
      <Handle type="source" position={Position.Bottom} className="!bg-transparent !border-0" style={{ bottom: -5 }} />
      <Handle type="target" position={Position.Top} className="!bg-transparent !border-0" style={{ top: -5 }} />
      <Handle type="source" id="right" position={Position.Right} className="!bg-transparent !border-0" />
      <Handle type="source" id="left" position={Position.Left} className="!bg-transparent !border-0" />
    </div>
  );
}

export default memo(SkillNodeComponent);
