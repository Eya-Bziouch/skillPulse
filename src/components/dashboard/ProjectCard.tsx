/* ═══════════════════════════════════════════════════════
   ProjectCard — Glass surface project card
   ═══════════════════════════════════════════════════════ */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Project } from '../../types';

interface Props {
  project: Project;
  onDelete: (id: string) => void;
  index: number;
}

function timeAgo(ts: number): string {
  const seconds = Math.floor((Date.now() - ts) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(ts).toLocaleDateString();
}

export default function ProjectCard({ project, onDelete, index }: Props) {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      onClick={() => navigate(`/project/${project.id}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '100%',
        maxWidth: 320,
        background: hovered ? 'var(--surface-hover)' : 'var(--surface)',
        border: `1px solid ${hovered ? 'var(--border-strong)' : 'var(--border)'}`,
        borderRadius: 'var(--r-lg)',
        padding: 'var(--sp-5) var(--sp-6)',
        cursor: 'pointer',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: hovered ? '0 8px 32px rgba(0,0,0,0.35)' : 'none',
        transition: 'all var(--t-base) var(--ease)',
        position: 'relative',
      }}
    >
      {/* Row 1: dot + project name + delete */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', marginBottom: 'var(--sp-2)' }}>
        <motion.div
          style={{
            width: 10, height: 10, borderRadius: '50%',
            background: 'var(--pink)',
            boxShadow: '0 0 8px rgba(224,64,123,0.5)',
            flexShrink: 0,
          }}
          animate={{ opacity: [0.5, 1, 0.5], scale: [0.85, 1.1, 0.85] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
        <h3 style={{
          fontSize: 'var(--text-md)',
          fontWeight: 'var(--fw-medium)',
          color: 'var(--text-primary)',
          flex: 1,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {project.name}
        </h3>
        {/* Delete */}
        <motion.button
          initial={false}
          animate={{ opacity: hovered ? 0.5 : 0, scale: hovered ? 1 : 0.8 }}
          whileHover={{ opacity: 1, scale: 1.1 }}
          onClick={(e) => {
            e.stopPropagation();
            if (confirm('Delete this project and all its skills?')) onDelete(project.id);
          }}
          style={{
            flexShrink: 0,
            width: 24, height: 24,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-muted)',
            background: 'transparent',
            border: 'none',
            borderRadius: 'var(--r-sm)',
            cursor: 'pointer',
          }}
          title="Delete project"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </motion.button>
      </div>

      {/* Row 2: description */}
      {project.description && (
        <p style={{
          fontSize: 'var(--text-sm)',
          color: 'var(--text-secondary)',
          lineHeight: 1.5,
          marginBottom: 'var(--sp-4)',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {project.description}
        </p>
      )}

      {/* Row 3: timestamp */}
      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: project.description ? 0 : 'var(--sp-4)' }}>
        {timeAgo(project.updatedAt)}
      </p>
    </motion.div>
  );
}
