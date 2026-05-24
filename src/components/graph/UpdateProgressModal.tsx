/* ═══════════════════════════════════════════════════════
   UpdateProgressModal — Quick "what did you just learn?"
   ═══════════════════════════════════════════════════════ */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { NodeType } from '../../types';
import { SKILL_COLORS } from '../../utils/energy';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (label: string, nodeType: NodeType, color: string) => void;
}

const NODE_TYPES: { value: NodeType; label: string; icon: string }[] = [
  { value: 'concept',   label: 'Concept',   icon: '◆' },
  { value: 'resource',  label: 'Resource',  icon: '◈' },
  { value: 'milestone', label: 'Milestone', icon: '★' },
];

export default function UpdateProgressModal({ isOpen, onClose, onCreate }: Props) {
  const [label, setLabel] = useState('');
  const [nodeType, setNodeType] = useState<NodeType>('concept');
  const [color, setColor] = useState<string>(SKILL_COLORS[0].value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setLabel('');
      setNodeType('concept');
      setColor(SKILL_COLORS[Math.floor(Math.random() * SKILL_COLORS.length)].value);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) return;
    onCreate(label.trim(), nodeType, color);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          style={{
            position: 'fixed', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 'var(--z-modal)' as never,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          {/* Backdrop */}
          <motion.div
            style={{
              position: 'absolute', inset: 0,
              background: 'rgba(0,0,0,0.65)',
              backdropFilter: 'blur(6px)',
            }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            style={{
              position: 'relative',
              width: 'min(480px, 92vw)',
              background: 'var(--void-3)',
              border: '1px solid var(--border-strong)',
              borderRadius: 'var(--r-xl)',
              padding: 'var(--sp-8)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--sp-5)',
              zIndex: 1,
            }}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 10, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-5)' }}>

              {/* Header */}
              <div>
                <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--fw-medium)', color: 'var(--text-primary)', marginBottom: 'var(--sp-1)' }}>
                  Update Progress
                </h2>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                  Log a new concept and connect it to your chain
                </p>
              </div>

              {/* What did you learn? */}
              <ModalField label="What did you just learn?">
                <input
                  ref={inputRef}
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="e.g. React Suspense"
                  maxLength={60}
                  style={modalInputStyle}
                  onFocus={(e) => modalFocus(e.target as HTMLInputElement)}
                  onBlur={(e) => modalBlur(e.target as HTMLInputElement)}
                />
              </ModalField>

              {/* Type */}
              <ModalField label="Type">
                <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
                  {NODE_TYPES.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setNodeType(t.value)}
                      style={{
                        flex: 1,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        padding: 'var(--sp-2) var(--sp-3)',
                        borderRadius: 'var(--r-full)',
                        border: `1px solid ${nodeType === t.value ? 'var(--pink)' : 'var(--border)'}`,
                        background: nodeType === t.value ? 'var(--pink-dim)' : 'var(--surface)',
                        color: nodeType === t.value ? 'var(--pink)' : 'var(--text-secondary)',
                        fontSize: 'var(--text-sm)',
                        fontWeight: nodeType === t.value ? 'var(--fw-medium)' : 'var(--fw-normal)',
                        cursor: 'pointer',
                        transition: 'all var(--t-base) var(--ease)',
                      }}
                    >
                      <span>{t.icon}</span>
                      <span>{t.label}</span>
                    </button>
                  ))}
                </div>
              </ModalField>

              {/* Colour */}
              <ModalField label="Color">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--sp-2)' }}>
                  {SKILL_COLORS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setColor(c.value)}
                      title={c.name}
                      style={{
                        width: 28, height: 28, borderRadius: '50%',
                        background: c.value, border: 'none', cursor: 'pointer',
                        transition: 'all var(--t-base) var(--ease)',
                        outline: color === c.value ? '2px solid #fff' : 'none',
                        outlineOffset: color === c.value ? '2px' : '0',
                        transform: color === c.value ? 'scale(1.15)' : 'scale(1)',
                      }}
                    />
                  ))}
                </div>
              </ModalField>

              {/* Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)', paddingTop: 'var(--sp-2)' }}>
                <button
                  type="submit"
                  disabled={!label.trim()}
                  style={{
                    width: '100%', height: 46,
                    background: label.trim() ? 'var(--pink)' : 'var(--surface)',
                    color: label.trim() ? '#fff' : 'var(--text-muted)',
                    border: 'none',
                    borderRadius: 'var(--r-full)',
                    fontSize: 'var(--text-base)',
                    fontWeight: 'var(--fw-medium)',
                    boxShadow: label.trim() ? 'var(--pink-glow)' : 'none',
                    transition: 'all var(--t-base) var(--ease)',
                    cursor: label.trim() ? 'pointer' : 'default',
                    opacity: label.trim() ? 1 : 0.5,
                  }}
                  onMouseEnter={(e) => {
                    if (label.trim()) {
                      (e.currentTarget as HTMLElement).style.filter = 'brightness(1.1)';
                      (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.filter = 'none';
                    (e.currentTarget as HTMLElement).style.transform = 'none';
                  }}
                >
                  Save & Connect
                </button>
                <span
                  onClick={onClose}
                  style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--text-secondary)',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'color var(--t-base) var(--ease)',
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'; }}
                >
                  Cancel
                </span>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ModalField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
      <p style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--fw-bold)', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
        {label}
      </p>
      {children}
    </div>
  );
}

const modalInputStyle: React.CSSProperties = {
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

function modalFocus(el: HTMLInputElement) {
  el.style.borderColor = 'var(--pink)';
  el.style.boxShadow = '0 0 0 3px var(--pink-dim)';
}
function modalBlur(el: HTMLInputElement) {
  el.style.borderColor = 'var(--border)';
  el.style.boxShadow = 'none';
}
