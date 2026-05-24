/* ═══════════════════════════════════════════════════════
   ProjectCard — Minimal futuristic project card
   for the dashboard
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
  const [showDelete, setShowDelete] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0, 0, 0.2, 1] }}
      className="group relative rounded-2xl cursor-pointer transition-all duration-300"
      style={{
        background: 'linear-gradient(145deg, rgba(26,26,46,0.6), rgba(17,17,32,0.8))',
        border: '1px solid rgba(255,255,255,0.05)',
      }}
      onClick={() => navigate(`/project/${project.id}`)}
      onMouseEnter={() => setShowDelete(true)}
      onMouseLeave={() => setShowDelete(false)}
      whileHover={{
        borderColor: 'rgba(255,105,180,0.25)',
        boxShadow: '0 0 40px rgba(255,105,180,0.06), 0 8px 32px rgba(0,0,0,0.3)',
      }}
    >
      {/* Glow accent top-bar */}
      <div
        className="absolute top-0 left-6 right-6 h-px"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255,105,180,0.3), transparent)',
          opacity: 0,
          transition: 'opacity 0.3s',
        }}
        ref={(el) => {
          if (el) {
            el.parentElement?.addEventListener('mouseenter', () => { el.style.opacity = '1'; });
            el.parentElement?.addEventListener('mouseleave', () => { el.style.opacity = '0'; });
          }
        }}
      />

      <div className="p-6">
        {/* Title row */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* Living dot */}
            <motion.div
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{
                background: 'var(--accent-primary)',
                boxShadow: '0 0 8px var(--accent-glow)',
              }}
              animate={{ opacity: [0.5, 1, 0.5], scale: [0.85, 1.1, 0.85] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />
            <h3
              className="font-display text-base font-semibold truncate"
              style={{ color: 'var(--text-primary)' }}
            >
              {project.name}
            </h3>
          </div>

          {/* Delete button */}
          <motion.button
            initial={false}
            animate={{ opacity: showDelete ? 0.5 : 0, scale: showDelete ? 1 : 0.8 }}
            whileHover={{ opacity: 1, scale: 1.1 }}
            onClick={(e) => {
              e.stopPropagation();
              if (confirm('Delete this project and all its skills?')) {
                onDelete(project.id);
              }
            }}
            className="p-1.5 rounded-lg flex-shrink-0 cursor-pointer"
            style={{ color: 'var(--text-muted)' }}
            title="Delete project"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </motion.button>
        </div>

        {/* Description */}
        {project.description && (
          <p className="text-xs mb-4 line-clamp-2" style={{ color: 'var(--text-muted)', lineHeight: 1.5 }}>
            {project.description}
          </p>
        )}

        {/* Footer meta */}
        <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-ghost)' }}>
          <span>{timeAgo(project.updatedAt)}</span>
        </div>
      </div>
    </motion.div>
  );
}
