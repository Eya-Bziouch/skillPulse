/* ═══════════════════════════════════════════════════════
   NeuralEdge — Animated neural-pulse edge

   An energy pulse (SVG circle) travels along the bezier
   path simulating a neural signal. The dot color matches
   the source node's accent colour.

   Cold connections (>7 days since last update) slow down
   to 6s duration and dim to 0.3 opacity.
   ═══════════════════════════════════════════════════════ */

import { memo, useMemo } from 'react';
import { getBezierPath, type EdgeProps } from '@xyflow/react';

export interface NeuralEdgeData {
  color: string;
  energyLevel: number; // 0–1
  updatedAt?: number;  // timestamp of most recent node update
  [key: string]: unknown;
}

type NeuralEdgeType = EdgeProps & { data?: NeuralEdgeData };

/** Seven days in milliseconds */
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

function NeuralEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}: NeuralEdgeType) {
  const color = data?.color || '#ff69b4';
  const energyLevel = data?.energyLevel ?? 0.7;
  const updatedAt = data?.updatedAt ?? Date.now();

  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    curvature: 0.3,
  });

  // Determine if the connection is "cold" (>7 days untouched)
  const isCold = useMemo(
    () => Date.now() - updatedAt > SEVEN_DAYS_MS,
    [updatedAt],
  );

  const animDuration = isCold ? 6 : 1.8;
  const dotOpacity = isCold ? 0.3 : Math.max(0.5, energyLevel);
  const baseAlpha = energyLevel * 0.5 + 0.1;

  const filterId = `neural-glow-${id}`;
  const gradientId = `neural-grad-${id}`;

  return (
    <g>
      <defs>
        <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <radialGradient id={gradientId}>
          <stop offset="0%" stopColor={color} stopOpacity="1" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Base edge path — subtle ghostly line */}
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
        filter={`url(#${filterId})`}
      />

      {/* Animated neural pulse — dashed stroke travelling along the path */}
      <path
        d={edgePath}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeOpacity={dotOpacity * 0.6}
        strokeDasharray="8 292"
        style={{
          animation: `neural-pulse ${animDuration}s linear infinite`,
        }}
        filter={`url(#${filterId})`}
      />

      {/* Primary travelling dot */}
      <circle
        r={5}
        fill={color}
        opacity={dotOpacity}
        filter={`url(#${filterId})`}
      >
        <animateMotion
          dur={`${animDuration}s`}
          repeatCount="indefinite"
          path={edgePath}
        />
      </circle>

      {/* Glow halo for the dot */}
      <circle
        r={10}
        fill={`url(#${gradientId})`}
        opacity={dotOpacity * 0.35}
      >
        <animateMotion
          dur={`${animDuration}s`}
          repeatCount="indefinite"
          path={edgePath}
        />
      </circle>
    </g>
  );
}

export default memo(NeuralEdgeComponent);
