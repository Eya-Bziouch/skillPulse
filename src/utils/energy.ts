/* ═══════════════════════════════════════════════════════
   SKILLPULSE — Energy Calculation Utilities
   ═══════════════════════════════════════════════════════ */

import type { EnergyData } from '../types';

/**
 * Calculate the energy level of a skill node based on how recently it was
 * updated. Recently active skills glow intensely; dormant ones fade.
 */
export function calculateEnergy(updatedAt: number): EnergyData {
  const hoursSinceUpdate = (Date.now() - updatedAt) / (1000 * 60 * 60);

  let level: number;

  if (hoursSinceUpdate < 1) {
    level = 1.0;       // Just updated → blazing
  } else if (hoursSinceUpdate < 6) {
    level = 0.9;       // Very recent → hot
  } else if (hoursSinceUpdate < 24) {
    level = 0.75;      // Today → warm
  } else if (hoursSinceUpdate < 72) {
    level = 0.55;      // 1-3 days → cooling
  } else if (hoursSinceUpdate < 168) {
    level = 0.4;       // This week → fading
  } else if (hoursSinceUpdate < 720) {
    level = 0.25;      // This month → dim
  } else {
    level = 0.15;      // Ancient → barely visible
  }

  return {
    level,
    glowIntensity: Math.round(level * 35),
    pulseSpeed: 2 + (1 - level) * 4,          // 2s (hot) → 6s (cold)
    particleCount: Math.max(1, Math.round(level * 3)),
    opacity: 0.5 + level * 0.5,                // 0.5 (dim) → 1.0 (full)
  };
}

/**
 * Get a CSS box-shadow string for the glow effect
 */
export function getGlowShadow(color: string, energy: EnergyData): string {
  const alpha = (energy.level * 0.6).toFixed(2);
  const spread = energy.glowIntensity;
  return `0 0 ${spread}px rgba(${hexToRgb(color)}, ${alpha}), 0 0 ${spread * 2}px rgba(${hexToRgb(color)}, ${(energy.level * 0.2).toFixed(2)})`;
}

/**
 * Convert a hex color to RGB components string
 */
function hexToRgb(hex: string): string {
  const cleaned = hex.replace('#', '');
  const r = parseInt(cleaned.substring(0, 2), 16);
  const g = parseInt(cleaned.substring(2, 4), 16);
  const b = parseInt(cleaned.substring(4, 6), 16);
  return `${r}, ${g}, ${b}`;
}

/**
 * Predefined color palette for skills
 */
export const SKILL_COLORS = [
  { name: 'Rose',     value: '#ff69b4', hsl: 'hsl(330, 100%, 71%)' },
  { name: 'Orchid',   value: '#a78bfa', hsl: 'hsl(260, 93%, 76%)' },
  { name: 'Cyan',     value: '#67e8f9', hsl: 'hsl(185, 92%, 69%)' },
  { name: 'Amber',    value: '#fbbf24', hsl: 'hsl(43, 96%, 56%)' },
  { name: 'Mint',     value: '#34d399', hsl: 'hsl(160, 64%, 52%)' },
  { name: 'Lavender', value: '#c4b5fd', hsl: 'hsl(255, 95%, 85%)' },
] as const;
