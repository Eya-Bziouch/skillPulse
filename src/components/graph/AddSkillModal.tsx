/* ═══════════════════════════════════════════════════════
   AddSkillModal — Quick modal to add a new root skill
   or a child skill inside the graph workspace
   ═══════════════════════════════════════════════════════ */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { NodeType } from '../../types';
import { SKILL_COLORS } from '../../utils/energy';

interface Props {
  isOpen: boolean;
  mode: 'root' | 'child';
  parentLabel?: string;
  onClose: () => void;
  onCreate: (title: string, nodeType: NodeType, color: string) => void;
}

const CHILD_TYPES: { value: NodeType; label: string; icon: string }[] = [
  { value: 'concept', label: 'Concept', icon: '◆' },
  { value: 'resource', label: 'Resource', icon: '◈' },
  { value: 'milestone', label: 'Milestone', icon: '★' },
];

export default function AddSkillModal({ isOpen, mode, parentLabel, onClose, onCreate }: Props) {
  const [title, setTitle] = useState('');
  const [nodeType, setNodeType] = useState<NodeType>('concept');
  const [color, setColor] = useState<string>(SKILL_COLORS[0].value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setNodeType(mode === 'root' ? 'root' : 'concept');
      setColor(SKILL_COLORS[Math.floor(Math.random() * SKILL_COLORS.length)].value);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, mode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onCreate(title.trim(), nodeType, color);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center"
          style={{ zIndex: 50 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0"
            style={{ background: 'rgba(6, 6, 14, 0.75)', backdropFilter: 'blur(8px)' }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-sm mx-4 rounded-2xl overflow-hidden"
            style={{
              background: 'linear-gradient(145deg, rgba(26,26,46,0.97), rgba(17,17,32,0.99))',
              border: '1px solid rgba(255,105,180,0.15)',
              boxShadow: '0 0 60px rgba(255,105,180,0.08), 0 25px 50px rgba(0,0,0,0.6)',
            }}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <form onSubmit={handleSubmit} className="p-7">
              {/* Header */}
              <div className="mb-6">
                <h2 className="font-display text-lg font-semibold mb-0.5" style={{ color: 'var(--text-primary)' }}>
                  {mode === 'root' ? 'Add Root Skill' : `Add to "${parentLabel}"`}
                </h2>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {mode === 'root' ? 'A new knowledge cluster' : 'A sub-concept or resource'}
                </p>
              </div>

              {/* Title */}
              <div className="mb-5">
                <label className="block text-xs font-medium uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  Name
                </label>
                <input
                  ref={inputRef}
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={mode === 'root' ? 'e.g. TypeScript' : 'e.g. Generics'}
                  maxLength={40}
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: 'var(--text-primary)',
                  }}
                  onFocus={(e) => { e.target.style.borderColor = 'rgba(255,105,180,0.4)'; e.target.style.boxShadow = '0 0 20px rgba(255,105,180,0.1)'; }}
                  onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>

              {/* Child type selector (only for child mode) */}
              {mode === 'child' && (
                <div className="mb-5">
                  <label className="block text-xs font-medium uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                    Type
                  </label>
                  <div className="flex gap-2">
                    {CHILD_TYPES.map((t) => (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => setNodeType(t.value)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium cursor-pointer transition-all"
                        style={{
                          background: nodeType === t.value ? 'rgba(255,105,180,0.12)' : 'rgba(255,255,255,0.03)',
                          border: `1px solid ${nodeType === t.value ? 'rgba(255,105,180,0.3)' : 'rgba(255,255,255,0.06)'}`,
                          color: nodeType === t.value ? 'var(--accent-primary)' : 'var(--text-muted)',
                        }}
                      >
                        <span>{t.icon}</span>
                        <span>{t.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Color picker */}
              <div className="mb-7">
                <label className="block text-xs font-medium uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {SKILL_COLORS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setColor(c.value)}
                      title={c.name}
                      className="w-6 h-6 rounded-full cursor-pointer transition-all"
                      style={{
                        background: c.value,
                        boxShadow: color === c.value
                          ? `0 0 12px ${c.value}, 0 0 0 2px rgba(255,255,255,0.25)`
                          : 'none',
                        transform: color === c.value ? 'scale(1.2)' : 'scale(1)',
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl cursor-pointer"
                  style={{ fontSize: '14px', minHeight: '40px', color: 'var(--text-secondary)' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!title.trim()}
                  className="px-6 py-2.5 rounded-xl font-semibold font-display cursor-pointer transition-all"
                  style={{
                    fontSize: '14px',
                    minHeight: '40px',
                    background: title.trim() ? 'linear-gradient(135deg, #ff69b4, #c44b8b)' : 'rgba(255,255,255,0.05)',
                    color: title.trim() ? '#fff' : 'var(--text-muted)',
                    boxShadow: title.trim() ? '0 0 25px rgba(255,105,180,0.3)' : 'none',
                    opacity: title.trim() ? 1 : 0.5,
                  }}
                >
                  Add
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
