/* ═══════════════════════════════════════════════════════
   EnergyEdge — Animated energy-flow edge
   
   Energy particles travel from parent to child along
   bezier paths. Uses SVG <animateMotion> for GPU-
   accelerated, 60fps performance.
   
   The edge feels like electricity flowing through a
   neural connection.
   ═══════════════════════════════════════════════════════ */

import { memo, useMemo } from 'react';
import { getBezierPath, type EdgeProps } from '@xyflow/react';

export interface EnergyEdgeData {
  color: string;
  energyLevel: number;  // 0-1
  [key: string]: unknown;
}

type EnergyEdgeType = EdgeProps & { data?: EnergyEdgeData };

function EnergyEdgeComponent({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}: EnergyEdgeType) {
  const color = data?.color || '#ff69b4';
  const energyLevel = data?.energyLevel ?? 0.7;

  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    curvature: 0.3,
  });

  // Number of energy particles based on energy level
  const particleCount = useMemo(
    () => Math.max(1, Math.round(energyLevel * 3)),
    [energyLevel]
  );

  const baseDuration = 2 + (1 - energyLevel) * 3; // 2s (hot) to 5s (cold)
  const baseAlpha = energyLevel * 0.5 + 0.1;

  return (
    <g>
      {/* SVG filter for particle glow */}
      <defs>
        <filter id={`glow-edge-${sourceX}-${targetX}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <radialGradient id={`particle-grad-${sourceX}-${targetX}`}>
          <stop offset="0%" stopColor={color} stopOpacity="1" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Base edge path — subtle, ghostly line */}
      <path
        d={edgePath}
        fill="none"
        stroke={color}
        strokeWidth={1.2}
        strokeOpacity={baseAlpha * 0.4}
        className="animate-glow-flicker"
      />

      {/* Secondary glow path — wider, softer */}
      <path
        d={edgePath}
        fill="none"
        stroke={color}
        strokeWidth={4}
        strokeOpacity={baseAlpha * 0.08}
        filter={`url(#glow-edge-${sourceX}-${targetX})`}
      />

      {/* Energy particles flowing along the edge */}
      {Array.from({ length: particleCount }).map((_, i) => {
        const delay = (i / particleCount) * baseDuration;
        const size = 3 - i * 0.5;
        const opacity = energyLevel * (1 - i * 0.2);

        return (
          <g key={i}>
            {/* Main particle */}
            <circle
              r={Math.max(1.5, size)}
              fill={color}
              opacity={opacity}
              filter={`url(#glow-edge-${sourceX}-${targetX})`}
            >
              <animateMotion
                dur={`${baseDuration}s`}
                begin={`${delay}s`}
                repeatCount="indefinite"
                path={edgePath}
              />
            </circle>

            {/* Particle glow halo */}
            <circle
              r={Math.max(3, size * 2.5)}
              fill={`url(#particle-grad-${sourceX}-${targetX})`}
              opacity={opacity * 0.4}
            >
              <animateMotion
                dur={`${baseDuration}s`}
                begin={`${delay}s`}
                repeatCount="indefinite"
                path={edgePath}
              />
            </circle>
          </g>
        );
      })}
    </g>
  );
}

export default memo(EnergyEdgeComponent);
