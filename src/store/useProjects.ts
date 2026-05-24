/* ═══════════════════════════════════════════════════════
   useProjects — Zustand store for project management
   ═══════════════════════════════════════════════════════ */

import { create } from 'zustand';
import type { Project } from '../types';
import { db } from '../db';
import * as ops from '../db/operations';

interface ProjectsState {
  projects: Project[];
  loading: boolean;

  loadProjects: () => Promise<void>;
  createProject: (name: string, description?: string) => Promise<Project>;
  deleteProject: (id: string) => Promise<void>;
  updateProject: (id: string, updates: Partial<Pick<Project, 'name' | 'description'>>) => Promise<void>;
}

export const useProjects = create<ProjectsState>((set) => ({
  projects: [],
  loading: true,

  loadProjects: async () => {
    set({ loading: true });
    const projects = await db.projects.orderBy('updatedAt').reverse().toArray();
    set({ projects, loading: false });
  },

  createProject: async (name, description = '') => {
    const project = await ops.createProject(name, description);

    // Seed a root node so the canvas is never empty on first open
    try {
      await ops.createSkillNode(
        project.id,
        name,          // label = project name
        null,          // no parent
        'root',
        { x: 0, y: 0 },
        '#ff69b4',     // default pink accent
      );
    } catch (err) {
      console.error('[SkillPulse] Failed to seed root node:', err);
    }

    set((state) => ({ projects: [project, ...state.projects] }));
    return project;
  },

  deleteProject: async (id) => {
    await ops.deleteProject(id);
    set((state) => ({ projects: state.projects.filter((p) => p.id !== id) }));
  },

  updateProject: async (id, updates) => {
    await ops.updateProject(id, updates);
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === id ? { ...p, ...updates, updatedAt: Date.now() } : p,
      ),
    }));
  },
}));
