/* ═══════════════════════════════════════════════════════
   SkillNode — Root skill node (living energy orb)
   
   A circular glowing node that acts as the energy source
   for its descendant knowledge nodes. Breathes, pulses,
   and glows based on its energy level (recency of use).
   ═══════════════════════════════════════════════════════ */

import { memo, useMemo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { motion } from 'framer-motion';
import { calculateEnergy, getGlowShadow } from '../../utils/energy';

export interface SkillNodeData {
  label: string;
  color: string;
  updatedAt: number;
  nodeType: 'root';
  description?: string;
  [key: string]: unknown;
}

type SkillNodeType = NodeProps & { data: SkillNodeData };

function SkillNodeComponent({ data, selected }: SkillNodeType) {
  const energy = useMemo(() => calculateEnergy(data.updatedAt), [data.updatedAt]);
  const glowShadow = useMemo(() => getGlowShadow(data.color, energy), [data.color, energy]);

  return (
    <div className="relative flex items-center justify-center">
      {/* Pulse ring — radiates outward from the orb */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 'calc(var(--node-radius) * 1.12)',
          height: 'calc(var(--node-radius) * 1.12)',
          border: `2px solid ${data.color}`,
        }}
        animate={{
          scale: [1, 2.2],
          opacity: [0.4 * energy.level, 0],
        }}
        transition={{
          duration: energy.pulseSpeed,
          repeat: Infinity,
          ease: 'easeOut',
        }}
      />

      {/* Second pulse ring — offset for organic feel */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 'calc(var(--node-radius) * 1.12)',
          height: 'calc(var(--node-radius) * 1.12)',
          border: `1px solid ${data.color}`,
        }}
        animate={{
          scale: [1, 1.8],
          opacity: [0.2 * energy.level, 0],
        }}
        transition={{
          duration: energy.pulseSpeed * 1.3,
          repeat: Infinity,
          ease: 'easeOut',
          delay: energy.pulseSpeed * 0.4,
        }}
      />

      {/* Outer glow halo */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 'calc(var(--node-radius) * 1.22)',
          height: 'calc(var(--node-radius) * 1.22)',
          background: `radial-gradient(circle, ${data.color}15 0%, transparent 70%)`,
        }}
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: energy.pulseSpeed * 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Main orb body */}
      <motion.div
        className="relative flex items-center justify-center rounded-full cursor-pointer"
        style={{
          width: 'var(--node-radius)',
          height: 'var(--node-radius)',
          background: `radial-gradient(circle at 35% 35%, ${data.color}dd, ${data.color}88 50%, ${data.color}44 100%)`,
          boxShadow: glowShadow,
          opacity: energy.opacity,
        }}
        animate={{
          scale: selected ? [1.08, 1.12, 1.08] : [1, 1.06, 1],
        }}
        transition={{
          duration: energy.pulseSpeed,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        whileHover={{ scale: 1.12 }}
      >
        {/* Inner light core */}
        <div
          className="absolute rounded-full"
          style={{
            width: 'calc(var(--node-radius) * 0.33)',
            height: 'calc(var(--node-radius) * 0.33)',
            top: '22%',
            left: '25%',
            background: `radial-gradient(circle, rgba(255,255,255,0.6) 0%, transparent 70%)`,
            filter: 'blur(6px)',
          }}
        />

        {/* Label */}
        <span
          className="font-display font-semibold text-center leading-tight select-none z-10 px-2"
          style={{
            fontSize: 'var(--node-font)',
            color: '#fff',
            textShadow: `0 0 12px ${data.color}, 0 1px 3px rgba(0,0,0,0.5)`,
            maxWidth: 'calc(var(--node-radius) * 0.78)',
            wordBreak: 'break-word',
          }}
        >
          {data.label}
        </span>
      </motion.div>

      {/* Connection handles (invisible) */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-transparent !border-0"
        style={{ bottom: -5 }}
      />
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-transparent !border-0"
        style={{ top: -5 }}
      />
      <Handle
        type="source"
        id="right"
        position={Position.Right}
        className="!bg-transparent !border-0"
      />
      <Handle
        type="source"
        id="left"
        position={Position.Left}
        className="!bg-transparent !border-0"
      />
    </div>
  );
}

export default memo(SkillNodeComponent);
