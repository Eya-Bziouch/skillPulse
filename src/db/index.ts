/* ═══════════════════════════════════════════════════════
   Dexie Database — SkillPulse local-first persistence
   
   Singleton instance. UUID primary keys.
   Edges are NOT persisted — derived from parentId at runtime.
   ═══════════════════════════════════════════════════════ */

import Dexie, { type EntityTable } from 'dexie';
import type { Project, SkillNode, TimelineEvent } from '../types';

const db = new Dexie('SkillPulseDB') as Dexie & {
  projects: EntityTable<Project, 'id'>;
  skills: EntityTable<SkillNode, 'id'>;
  timeline: EntityTable<TimelineEvent, 'id'>;
};

db.version(1).stores({
  projects: 'id, name, updatedAt',
  skills: 'id, projectId, parentId, title, updatedAt, depth',
  timeline: 'id, nodeId, timestamp',
});

export { db };
