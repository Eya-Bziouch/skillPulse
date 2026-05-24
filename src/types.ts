/* ═══════════════════════════════════════════════════════
   SKILLPULSE — Type Definitions
   ═══════════════════════════════════════════════════════ */

/** Node types within the knowledge graph */
export type NodeType = 'root' | 'concept' | 'resource' | 'milestone';

/** A project container */
export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: number;
  updatedAt: number;
}

/** Skill node stored in IndexedDB — scoped to a project */
export interface SkillNode {
  id: string;
  projectId: string;
  title: string;
  description: string;
  parentId: string | null;
  nodeType: NodeType;
  createdAt: number;
  updatedAt: number;
  tags: string[];
  color: string;
  depth: number;
  positionX: number;
  positionY: number;
  collapsed: boolean;
}

/** Timeline event for a skill */
export interface TimelineEvent {
  id: string;
  nodeId: string;
  timestamp: number;
  content: string;
}

/** Curated skill color option */
export interface SkillColor {
  name: string;
  value: string;
}

/** Energy level data derived from timestamps */
export interface EnergyData {
  level: number;
  glowIntensity: number;
  pulseSpeed: number;
  particleCount: number;
  opacity: number;
}
