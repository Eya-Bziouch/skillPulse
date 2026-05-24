/* ═══════════════════════════════════════════════════════
   useGraph — Zustand store for graph workspace state
   
   Manages skills within a single project. Derives edges
   dynamically from parentId relationships.
   ═══════════════════════════════════════════════════════ */

import { create } from 'zustand';
import type { Node, Edge } from '@xyflow/react';
import type { SkillNode, NodeType } from '../types';
import { db } from '../db';
import * as ops from '../db/operations';
import { calculateEnergy } from '../utils/energy';

interface GraphState {
  /* Raw DB data */
  skills: SkillNode[];
  projectId: string | null;
  loading: boolean;

  /* Derived React Flow state */
  nodes: Node[];
  edges: Edge[];

  /* Selection */
  selectedNodeId: string | null;
  sidebarOpen: boolean;

  /* Actions */
  loadProject: (projectId: string) => Promise<void>;
  unloadProject: () => void;

  addRootSkill: (title: string, color: string) => Promise<void>;
  addChildNode: (parentId: string, title: string, nodeType: NodeType, color: string) => Promise<void>;
  updateSkill: (id: string, updates: Partial<Pick<SkillNode, 'title' | 'description' | 'tags' | 'color'>>) => Promise<void>;
  deleteSkill: (id: string) => Promise<void>;
  updateProgress: (label: string, nodeType: NodeType, color: string) => Promise<void>;

  updateNodePosition: (id: string, x: number, y: number) => void;
  persistPositions: () => Promise<void>;

  selectNode: (id: string | null) => void;
  setSidebarOpen: (open: boolean) => void;

  /* Direct setters for ReactFlow compatibility */
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
}

/** Build React Flow nodes from DB skills */
function buildNodes(skills: SkillNode[]): Node[] {
  return skills.map((skill) => ({
    id: skill.id,
    type: skill.nodeType === 'root' ? 'skillNode' : 'leafNode',
    position: { x: skill.positionX, y: skill.positionY },
    data: {
      label: skill.title,
      color: skill.color,
      updatedAt: skill.updatedAt,
      nodeType: skill.nodeType,
      description: skill.description,
    },
  }));
}

/** Build React Flow edges from parentId relationships */
function buildEdges(skills: SkillNode[]): Edge[] {
  return skills
    .filter((s) => s.parentId)
    .map((child) => {
      const parent = skills.find((s) => s.id === child.parentId);
      const energy = calculateEnergy(child.updatedAt);
      return {
        id: `e-${child.parentId}-${child.id}`,
        source: child.parentId!,
        target: child.id,
        type: 'energy',
        data: {
          color: parent?.color || child.color,
          energyLevel: energy.level,
          updatedAt: child.updatedAt,
        },
      };
    });
}

export const useGraph = create<GraphState>((set, get) => ({
  skills: [],
  projectId: null,
  loading: true,
  nodes: [],
  edges: [],
  selectedNodeId: null,
  sidebarOpen: false,

  loadProject: async (projectId) => {
    set({ loading: true, projectId, selectedNodeId: null, sidebarOpen: false });
    const skills = await db.skills.where('projectId').equals(projectId).toArray();
    set({
      skills,
      nodes: buildNodes(skills),
      edges: buildEdges(skills),
      loading: false,
    });
  },

  unloadProject: () => {
    set({
      skills: [],
      projectId: null,
      nodes: [],
      edges: [],
      selectedNodeId: null,
      sidebarOpen: false,
    });
  },

  addRootSkill: async (title, color) => {
    const { projectId, skills } = get();
    if (!projectId) return;

    // Place new root via simple spread: offset from center
    const rootCount = skills.filter((s) => s.nodeType === 'root').length;
    const angle = (rootCount * Math.PI * 2) / Math.max(rootCount + 1, 3);
    const radius = 200 + rootCount * 60;
    const x = 500 + Math.cos(angle) * radius;
    const y = 350 + Math.sin(angle) * radius;

    const node = await ops.createSkillNode(projectId, title, null, 'root', { x, y }, color);
    const updatedSkills = [...skills, node];
    set({
      skills: updatedSkills,
      nodes: buildNodes(updatedSkills),
      edges: buildEdges(updatedSkills),
    });
  },

  addChildNode: async (parentId, title, nodeType, color) => {
    const { projectId, skills } = get();
    if (!projectId) return;

    const parent = skills.find((s) => s.id === parentId);
    if (!parent) return;

    // Place child near parent with some radial offset
    const siblings = skills.filter((s) => s.parentId === parentId);
    const angle = ((siblings.length + 1) * Math.PI * 0.4) - Math.PI * 0.6;
    const dist = 160 + siblings.length * 30;
    const x = parent.positionX + Math.cos(angle) * dist;
    const y = parent.positionY + Math.sin(angle) * dist;

    const node = await ops.createSkillNode(projectId, title, parentId, nodeType, { x, y }, color);
    const updatedSkills = [...skills, node];
    set({
      skills: updatedSkills,
      nodes: buildNodes(updatedSkills),
      edges: buildEdges(updatedSkills),
    });
  },

  updateSkill: async (id, updates) => {
    await ops.updateSkillNode(id, updates);
    const skills = get().skills.map((s) =>
      s.id === id ? { ...s, ...updates, updatedAt: Date.now() } : s,
    );
    set({
      skills,
      nodes: buildNodes(skills),
      edges: buildEdges(skills),
    });
  },

  deleteSkill: async (id) => {
    await ops.deleteSkillNode(id);
    // Reload from DB to handle cascade properly
    const { projectId } = get();
    if (!projectId) return;
    const skills = await db.skills.where('projectId').equals(projectId).toArray();
    set({
      skills,
      nodes: buildNodes(skills),
      edges: buildEdges(skills),
      selectedNodeId: null,
      sidebarOpen: false,
    });
  },

  updateProgress: async (label, nodeType, color) => {
    const { projectId, skills, selectedNodeId } = get();
    if (!projectId) return;

    let parent = selectedNodeId ? skills.find((s) => s.id === selectedNodeId) : null;
    if (!parent && skills.length > 0) {
      // Find the most recently updated node
      parent = [...skills].sort((a, b) => b.updatedAt - a.updatedAt)[0];
    }

    const parentId = parent ? parent.id : null;
    const parentX = parent ? parent.positionX : 0;
    const parentY = parent ? parent.positionY : 0;

    // Diagonal offset: +130px on both axes
    const x = parentX + 130;
    const y = parentY + 130;

    // 1. Create skill node in DB
    const node = await ops.createSkillNode(projectId, label, parentId, nodeType, { x, y }, color);

    // 2. Add timeline event in DB
    await ops.addTimelineEvent(node.id, `Concept learned: ${label}`);

    // Reload all skills from DB to get the fresh node with updated updatedAt from the timeline event
    const updatedSkills = await db.skills.where('projectId').equals(projectId).toArray();

    set({
      skills: updatedSkills,
      nodes: buildNodes(updatedSkills),
      edges: buildEdges(updatedSkills),
      selectedNodeId: node.id,
      sidebarOpen: true,
    });
  },

  updateNodePosition: (id, x, y) => {
    const skills = get().skills.map((s) =>
      s.id === id ? { ...s, positionX: x, positionY: y } : s,
    );
    set({
      skills,
      nodes: buildNodes(skills),
    });
  },

  persistPositions: async () => {
    const { skills } = get();
    await db.transaction('rw', db.skills, async () => {
      for (const s of skills) {
        await ops.updateNodePosition(s.id, s.positionX, s.positionY);
      }
    });
  },

  selectNode: (id) => {
    set({ selectedNodeId: id, sidebarOpen: id !== null });
  },

  setSidebarOpen: (open) => {
    set({ sidebarOpen: open, selectedNodeId: open ? get().selectedNodeId : null });
  },

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
}));
