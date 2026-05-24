/* ═══════════════════════════════════════════════════════
   NodeEditor — Slide-in sidebar for editing a skill node

   Shows when a node is selected. Allows:
     - Rename the skill
     - Change description
     - Change node type
     - Change color
     - Add a timeline event (journal entry)
     - Delete the node
   ═══════════════════════════════════════════════════════ */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGraph } from '../../store/useGraph';
import { addTimelineEvent } from '../../db/operations';
import { db } from '../../db';
import type { SkillNode, NodeType, TimelineEvent } from '../../types';
import { SKILL_COLORS } from '../../utils/energy';

const NODE_TYPES: { value: NodeType; label: string; icon: string }[] = [
  { value: 'root', label: 'Root', icon: '◎' },
  { value: 'concept', label: 'Concept', icon: '◆' },
  { value: 'resource', label: 'Resource', icon: '◈' },
  { value: 'milestone', label: 'Milestone', icon: '★' },
];

interface Props {
  isOpen: boolean;
  nodeId: string | null;
  onClose: () => void;
}

export default function NodeEditor({ isOpen, nodeId, onClose }: Props) {
  const { skills, updateSkill, deleteSkill } = useGraph();
  const [skill, setSkill] = useState<SkillNode | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [nodeType, setNodeType] = useState<NodeType>('concept');
  const [color, setColor] = useState('#ff69b4');
  const [note, setNote] = useState('');
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [saving, setSaving] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);

  // Sync local state when selected node changes
  useEffect(() => {
    if (!nodeId) return;
    const found = skills.find((s) => s.id === nodeId) ?? null;
    setSkill(found);
    if (found) {
      setTitle(found.title);
      setDescription(found.description);
      setNodeType(found.nodeType);
      setColor(found.color);
      setNote('');
    }
  }, [nodeId, skills]);

  // Load timeline events
  useEffect(() => {
    if (!nodeId) { setEvents([]); return; }
    db.timeline.where('nodeId').equals(nodeId).sortBy('timestamp').then((evts) => {
      setEvents([...evts].reverse());
    });
  }, [nodeId, saving]);

  // Auto-focus title when sidebar opens
  useEffect(() => {
    if (isOpen && skill) {
      setTimeout(() => titleRef.current?.focus(), 200);
    }
  }, [isOpen, skill]);

  const handleSave = async () => {
    if (!skill) return;
    setSaving(true);
    await updateSkill(skill.id, { title, description, color });
    setSaving(false);
  };

  const handleAddNote = async () => {
    if (!skill || !note.trim()) return;
    setSaving(true);
    await addTimelineEvent(skill.id, note.trim());
    setNote('');
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!skill) return;
    if (!confirm(`Delete "${skill.title}" and all its children?`)) return;
    await deleteSkill(skill.id);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && skill && (
        <>
          {/* Backdrop (transparent, just to catch outside clicks) */}
          <motion.div
            className="fixed inset-0 pointer-events-auto"
            style={{ zIndex: 18 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Sidebar panel */}
          <motion.div
            className="fixed top-0 right-0 h-full flex flex-col pointer-events-auto"
            style={{
              minWidth: 340,
              width: 380,
              zIndex: 20,
              background: 'linear-gradient(180deg, rgba(18,10,26,0.97) 0%, rgba(10,10,20,0.98) 100%)',
              borderLeft: '1px solid rgba(255,105,180,0.12)',
              boxShadow: '-20px 0 60px rgba(0,0,0,0.5)',
              backdropFilter: 'blur(20px)',
            }}
            initial={{ x: 380, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 380, opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* ── Header ──────────────────────────────────── */}
            <div
              className="flex items-center justify-between px-6 py-5"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
            >
              <div className="flex items-center gap-2.5">
                <motion.div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ background: color, boxShadow: `0 0 8px ${color}` }}
                  animate={{ opacity: [0.6, 1, 0.6], scale: [0.85, 1.1, 0.85] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                />
                <span className="font-display font-semibold" style={{ color: 'var(--text-primary)', fontSize: '14px' }}>
                  Edit Skill
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg cursor-pointer transition-colors"
                style={{ color: 'var(--text-muted)' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* ── Scrollable body ──────────────────────────── */}
            <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-5">
              {/* Title */}
              <Field label="Skill Name">
                <input
                  ref={titleRef}
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={handleSave}
                  onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                  className="w-full px-4 py-3 rounded-xl outline-none transition-all"
                  style={{
                    fontSize: '14px',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-display)',
                  }}
                  onFocus={(e) => { e.target.style.borderColor = 'rgba(255,105,180,0.4)'; }}
                  onBlurCapture={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; }}
                />
              </Field>

              {/* Node type */}
              <Field label="Type">
                <div className="grid grid-cols-2 gap-2">
                  {NODE_TYPES.map((t) => (
                    <button
                      key={t.value}
                      onClick={async () => {
                        setNodeType(t.value);
                        if (skill) await updateSkill(skill.id, {});
                      }}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-lg font-medium cursor-pointer transition-all"
                      style={{
                        fontSize: '14px',
                        background: nodeType === t.value
                          ? `rgba(255,105,180,0.12)`
                          : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${nodeType === t.value ? 'rgba(255,105,180,0.3)' : 'rgba(255,255,255,0.06)'}`,
                        color: nodeType === t.value ? 'var(--accent-primary)' : 'var(--text-muted)',
                      }}
                    >
                      <span>{t.icon}</span>
                      <span>{t.label}</span>
                    </button>
                  ))}
                </div>
              </Field>

              {/* Color */}
              <Field label="Color">
                <div className="flex flex-wrap gap-2">
                  {SKILL_COLORS.map((c) => (
                    <button
                      key={c.value}
                      onClick={async () => {
                        setColor(c.value);
                        if (skill) await updateSkill(skill.id, { color: c.value });
                      }}
                      title={c.name}
                      className="w-7 h-7 rounded-full cursor-pointer transition-all"
                      style={{
                        background: c.value,
                        boxShadow: color === c.value
                          ? `0 0 14px ${c.value}, 0 0 0 2px rgba(255,255,255,0.2)`
                          : 'none',
                        transform: color === c.value ? 'scale(1.2)' : 'scale(1)',
                      }}
                    />
                  ))}
                </div>
              </Field>

              {/* Description */}
              <Field label="Description">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onBlur={handleSave}
                  rows={3}
                  placeholder="What is this skill about?"
                  className="w-full px-4 py-3 rounded-xl outline-none resize-none transition-all"
                  style={{
                    fontSize: '14px',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-body)',
                  }}
                  onFocus={(e) => { e.target.style.borderColor = 'rgba(255,105,180,0.4)'; }}
                  onBlurCapture={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; }}
                />
              </Field>

              {/* ── Timeline / Journal ───────────────────── */}
              <div>
                <label className="block font-medium uppercase tracking-wider mb-3" style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                  Activity Log
                </label>

                {/* New note input */}
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                    placeholder="Add a note… (Enter to save)"
                    className="flex-1 px-3 py-2.5 rounded-lg outline-none transition-all"
                    style={{
                      fontSize: '14px',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      color: 'var(--text-primary)',
                    }}
                    onFocus={(e) => { e.target.style.borderColor = 'rgba(255,105,180,0.3)'; }}
                    onBlurCapture={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; }}
                  />
                  <button
                    onClick={handleAddNote}
                    disabled={!note.trim()}
                    className="px-3 py-2.5 rounded-lg cursor-pointer transition-all"
                    style={{
                      fontSize: '14px',
                      background: note.trim() ? 'rgba(255,105,180,0.15)' : 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,105,180,0.2)',
                      color: note.trim() ? 'var(--accent-primary)' : 'var(--text-ghost)',
                    }}
                  >
                    Log
                  </button>
                </div>

                {/* Events list */}
                <div className="flex flex-col gap-2">
                  {events.length === 0 ? (
                    <p className="text-xs" style={{ color: 'var(--text-ghost)' }}>No activity yet.</p>
                  ) : (
                    events.map((evt) => (
                      <motion.div
                        key={evt.id}
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="px-3 py-2 rounded-lg"
                        style={{
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(255,255,255,0.05)',
                        }}
                      >
                        <p className="text-xs mb-0.5" style={{ color: 'var(--text-muted)' }}>
                          {new Date(evt.timestamp).toLocaleString()}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{evt.content}</p>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* ── Footer ──────────────────────────────────── */}
            <div
              className="px-6 py-4 flex items-center justify-between"
              style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
            >
              {skill.nodeType !== 'root' && (
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-1.5 px-3 py-2.5 rounded-lg cursor-pointer transition-all"
                  style={{ fontSize: '14px', color: 'rgba(251,113,133,0.6)', border: '1px solid rgba(251,113,133,0.1)' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#fb7185'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(251,113,133,0.6)'; }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                  Delete
                </button>
              )}

              {saving && (
                <span className="text-xs" style={{ color: 'var(--text-ghost)' }}>Saving…</span>
              )}

              <button
                onClick={handleSave}
                className="px-5 py-2.5 rounded-lg font-semibold cursor-pointer transition-all"
                style={{
                  fontSize: '14px',
                  minHeight: '40px',
                  background: 'linear-gradient(135deg, #ff69b4, #c44b8b)',
                  color: '#fff',
                  boxShadow: '0 0 16px rgba(255,105,180,0.2)',
                }}
              >
                Save
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ── Helper ──────────────────────────────────────────────── */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block font-medium uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
        {label}
      </label>
      {children}
    </div>
  );
}
