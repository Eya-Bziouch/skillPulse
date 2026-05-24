/* ═══════════════════════════════════════════════════════
   NodeEditor — 340px slide-in sidebar

   Layout: flex column, header + scrollable body + sticky footer
   Sidebar slides in from right; canvas shrinks to accommodate it
   (see Project.tsx flex-row layout).
   ═══════════════════════════════════════════════════════ */

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGraph } from '../../store/useGraph';
import { addTimelineEvent } from '../../db/operations';
import { db } from '../../db';
import type { SkillNode, NodeType, TimelineEvent } from '../../types';
import { SKILL_COLORS } from '../../utils/energy';

const NODE_TYPES: { value: NodeType; label: string; icon: string }[] = [
  { value: 'root',      label: 'Root',      icon: '◎' },
  { value: 'concept',   label: 'Concept',   icon: '◆' },
  { value: 'resource',  label: 'Resource',  icon: '◈' },
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
  const [color, setColor] = useState('#e0407b');
  const [note, setNote] = useState('');
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [saving, setSaving] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);
  const wasOpenRef = useRef(false);

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

  useEffect(() => {
    if (!nodeId) { setEvents([]); return; }
    db.timeline.where('nodeId').equals(nodeId).sortBy('timestamp').then((evts) => {
      setEvents([...evts].reverse());
    });
  }, [nodeId, saving]);

  // Auto-focus ONLY when the sidebar transitions from closed → open,
  // NOT on every 'skill' update (which would steal focus from AddSkillModal).
  useEffect(() => {
    const justOpened = isOpen && !wasOpenRef.current;
    wasOpenRef.current = isOpen;
    if (justOpened && skill) {
      setTimeout(() => titleRef.current?.focus(), 300);
    }
  }, [isOpen, skill]);

  const handleSave = useCallback(async () => {
    if (!skill) return;
    setSaving(true);
    await updateSkill(skill.id, { title, description, color });
    setSaving(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skill, title, description, color, updateSkill]);

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
        <motion.div
          key="node-editor"
          initial={{ x: 340 }}
          animate={{ x: 0 }}
          exit={{ x: 340 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          style={{
            width: 340,
            minWidth: 340,
            maxWidth: 340,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            background: 'rgba(15,15,24,0.92)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            borderLeft: '1px solid var(--border)',
            zIndex: 'var(--z-sidebar)' as never,
            flexShrink: 0,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* ── Header ──────────────────────────────────── */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 'var(--sp-5) var(--sp-6)',
            borderBottom: '1px solid var(--border)',
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
              <div style={{
                width: 10, height: 10, borderRadius: '50%',
                background: color,
                boxShadow: `0 0 8px ${color}`,
                flexShrink: 0,
              }} />
              <span style={{ fontSize: 'var(--text-md)', fontWeight: 'var(--fw-medium)', color: 'var(--text-primary)' }}>
                Edit Skill
              </span>
            </div>
            <button
              onClick={onClose}
              style={{
                width: 28, height: 28, borderRadius: '50%',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--text-secondary)',
                transition: 'all var(--t-base) var(--ease)',
                flexShrink: 0,
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--pink)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; }}
              aria-label="Close editor"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* ── Scrollable Body ──────────────────────────── */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: 'var(--sp-6)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--sp-5)',
          }}>

            {/* Skill Name */}
            <Field label="Skill Name">
              <input
                ref={titleRef}
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleSave}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                style={inputStyle}
                onFocus={(e) => applyFocusStyle(e.target as HTMLInputElement)}
                onBlurCapture={(e) => applyBlurStyle(e.target as HTMLInputElement)}
              />
            </Field>

            {/* Type pills — 2×2 grid */}
            <Field label="Type">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-2)' }}>
                {NODE_TYPES.map((t) => (
                  <button
                    key={t.value}
                    onClick={async () => {
                      setNodeType(t.value);
                      if (skill) await updateSkill(skill.id, {});
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--sp-2)',
                      padding: 'var(--sp-2) var(--sp-4)',
                      borderRadius: 'var(--r-full)',
                      border: `1px solid ${nodeType === t.value ? 'var(--pink)' : 'var(--border)'}`,
                      background: nodeType === t.value ? 'var(--pink-dim)' : 'var(--surface)',
                      color: nodeType === t.value ? 'var(--pink)' : 'var(--text-secondary)',
                      fontWeight: nodeType === t.value ? 'var(--fw-medium)' : 'var(--fw-normal)',
                      fontSize: 'var(--text-sm)',
                      transition: 'all var(--t-base) var(--ease)',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      if (nodeType !== t.value) (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-strong)';
                    }}
                    onMouseLeave={(e) => {
                      if (nodeType !== t.value) (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
                    }}
                  >
                    <span>{t.icon}</span>
                    <span>{t.label}</span>
                  </button>
                ))}
              </div>
            </Field>

            {/* Colour swatches */}
            <Field label="Color">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--sp-2)' }}>
                {SKILL_COLORS.map((c) => (
                  <button
                    key={c.value}
                    onClick={async () => {
                      setColor(c.value);
                      if (skill) await updateSkill(skill.id, { color: c.value });
                    }}
                    title={c.name}
                    style={{
                      width: 28, height: 28, borderRadius: '50%',
                      background: c.value,
                      cursor: 'pointer',
                      transition: 'all var(--t-base) var(--ease)',
                      outline: color === c.value ? '2px solid #fff' : 'none',
                      outlineOffset: color === c.value ? '2px' : '0px',
                      transform: color === c.value ? 'scale(1.15)' : 'scale(1)',
                      border: 'none',
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
                placeholder="What is this skill about?"
                rows={3}
                style={{ ...inputStyle, minHeight: 90, resize: 'vertical' }}
                onFocus={(e) => applyFocusStyle(e.target as HTMLTextAreaElement)}
                onBlurCapture={(e) => applyBlurStyle(e.target as HTMLTextAreaElement)}
              />
            </Field>

            {/* Activity Log */}
            <div>
              <SectionLabel>Activity Log</SectionLabel>

              {/* Note input row */}
              <div style={{ display: 'flex', gap: 'var(--sp-2)', marginBottom: 'var(--sp-4)' }}>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                  placeholder="Add a note… (Enter to save)"
                  style={{ ...inputStyle, flex: 1, height: 36, padding: 'var(--sp-2) var(--sp-3)' }}
                  onFocus={(e) => applyFocusStyle(e.target as HTMLInputElement)}
                  onBlurCapture={(e) => applyBlurStyle(e.target as HTMLInputElement)}
                />
                <button
                  onClick={handleAddNote}
                  disabled={!note.trim()}
                  style={{
                    height: 36,
                    padding: '0 14px',
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--r-md)',
                    color: note.trim() ? 'var(--pink)' : 'var(--text-muted)',
                    fontSize: 'var(--text-sm)',
                    transition: 'all var(--t-base) var(--ease)',
                    cursor: note.trim() ? 'pointer' : 'default',
                    flexShrink: 0,
                  }}
                  onMouseEnter={(e) => {
                    if (note.trim()) (e.currentTarget as HTMLElement).style.background = 'var(--surface-hover)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = 'var(--surface)';
                  }}
                >
                  Log
                </button>
              </div>

              {/* Events */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {events.length === 0 ? (
                  <p style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--text-muted)',
                    fontStyle: 'italic',
                    textAlign: 'center',
                    padding: 'var(--sp-4) 0',
                  }}>
                    No activity yet.
                  </p>
                ) : (
                  events.map((evt) => (
                    <motion.div
                      key={evt.id}
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{
                        padding: 'var(--sp-2) 0',
                        borderBottom: '1px solid var(--border)',
                      }}
                    >
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 2 }}>
                        {new Date(evt.timestamp).toLocaleString()}
                      </p>
                      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                        {evt.content}
                      </p>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* ── Footer ───────────────────────────────────── */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 'var(--sp-5) var(--sp-6)',
            borderTop: '1px solid var(--border)',
            marginTop: 'auto',
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
              {skill.nodeType !== 'root' && (
                <button
                  onClick={handleDelete}
                  style={{
                    fontSize: 'var(--text-sm)',
                    color: '#E24B4A',
                    background: 'transparent',
                    border: '1px solid rgba(226,75,74,0.3)',
                    borderRadius: 'var(--r-md)',
                    padding: 'var(--sp-2) var(--sp-4)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    transition: 'all var(--t-base) var(--ease)',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(226,75,74,0.1)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                  Delete
                </button>
              )}
              {saving && (
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  Saving…
                </span>
              )}
            </div>

            <button
              onClick={handleSave}
              style={{
                height: 40,
                padding: '0 var(--sp-6)',
                background: 'var(--pink)',
                color: '#fff',
                border: 'none',
                borderRadius: 'var(--r-full)',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--fw-medium)',
                boxShadow: 'var(--pink-glow)',
                transition: 'all var(--t-base) var(--ease)',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.filter = 'brightness(1.1)';
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.filter = 'none';
                (e.currentTarget as HTMLElement).style.transform = 'none';
              }}
            >
              Save
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ── Helpers ─────────────────────────────────────────────── */

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--r-md)',
  padding: 'var(--sp-3) var(--sp-4)',
  fontSize: 'var(--text-base)',
  color: 'var(--text-primary)',
  outline: 'none',
  transition: 'border-color var(--t-fast), box-shadow var(--t-fast)',
};

function applyFocusStyle(el: HTMLInputElement | HTMLTextAreaElement) {
  el.style.borderColor = 'var(--pink)';
  el.style.boxShadow = '0 0 0 3px var(--pink-dim)';
}
function applyBlurStyle(el: HTMLInputElement | HTMLTextAreaElement) {
  el.style.borderColor = 'var(--border)';
  el.style.boxShadow = 'none';
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontSize: 'var(--text-xs)',
      fontWeight: 'var(--fw-bold)',
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      color: 'var(--text-muted)',
      marginBottom: 'var(--sp-2)',
    }}>
      {children}
    </p>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <SectionLabel>{label}</SectionLabel>
      {children}
    </div>
  );
}
