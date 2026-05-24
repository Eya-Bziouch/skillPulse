/* ═══════════════════════════════════════════════════════
   Database Operations — CRUD helpers
   ═══════════════════════════════════════════════════════ */

import { v4 as uuid } from 'uuid';
import { db } from './index';
import type { Project, SkillNode, TimelineEvent, NodeType } from '../types';
import { SKILL_COLORS } from '../utils/energy';

/* ── Projects ─────────────────────────────────────────── */

export async function createProject(name: string, description = ''): Promise<Project> {
  const now = Date.now();
  const project: Project = {
    id: uuid(),
    name,
    description,
    createdAt: now,
    updatedAt: now,
  };
  await db.projects.add(project);
  return project;
}

export async function deleteProject(id: string): Promise<void> {
  await db.transaction('rw', db.projects, db.skills, db.timeline, async () => {
    const skills = await db.skills.where('projectId').equals(id).toArray();
    const skillIds = skills.map((s) => s.id);
    if (skillIds.length > 0) {
      await db.timeline.where('nodeId').anyOf(skillIds).delete();
    }
    await db.skills.where('projectId').equals(id).delete();
    await db.projects.delete(id);
  });
}

export async function updateProject(id: string, updates: Partial<Pick<Project, 'name' | 'description'>>): Promise<void> {
  await db.projects.update(id, { ...updates, updatedAt: Date.now() });
}

/* ── Skill Nodes ──────────────────────────────────────── */

export async function createSkillNode(
  projectId: string,
  title: string,
  parentId: string | null,
  nodeType: NodeType,
  position: { x: number; y: number },
  color?: string,
): Promise<SkillNode> {
  const now = Date.now();

  // Determine depth from parent
  let depth = 0;
  if (parentId) {
    const parent = await db.skills.get(parentId);
    depth = parent ? parent.depth + 1 : 0;
  }

  const node: SkillNode = {
    id: uuid(),
    projectId,
    title,
    description: '',
    parentId,
    nodeType,
    createdAt: now,
    updatedAt: now,
    tags: [],
    color: color || SKILL_COLORS[Math.floor(Math.random() * SKILL_COLORS.length)].value,
    depth,
    positionX: position.x,
    positionY: position.y,
    collapsed: false,
  };
  await db.skills.add(node);

  // Touch the project updatedAt
  await db.projects.update(projectId, { updatedAt: now });

  return node;
}

export async function updateSkillNode(
  id: string,
  updates: Partial<Pick<SkillNode, 'title' | 'description' | 'tags' | 'color' | 'positionX' | 'positionY' | 'collapsed'>>,
): Promise<void> {
  await db.skills.update(id, { ...updates, updatedAt: Date.now() });
}

export async function deleteSkillNode(id: string): Promise<void> {
  await db.transaction('rw', db.skills, db.timeline, async () => {
    // Recursively delete children
    const children = await db.skills.where('parentId').equals(id).toArray();
    for (const child of children) {
      await deleteSkillNode(child.id);
    }
    await db.timeline.where('nodeId').equals(id).delete();
    await db.skills.delete(id);
  });
}

export async function updateNodePosition(id: string, x: number, y: number): Promise<void> {
  await db.skills.update(id, { positionX: x, positionY: y });
}

/* ── Timeline ─────────────────────────────────────────── */

export async function addTimelineEvent(nodeId: string, content: string): Promise<TimelineEvent> {
  const event: TimelineEvent = {
    id: uuid(),
    nodeId,
    timestamp: Date.now(),
    content,
  };
  await db.timeline.add(event);

  // Touch the node's updatedAt to boost energy
  await db.skills.update(nodeId, { updatedAt: Date.now() });

  return event;
}
