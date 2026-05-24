/* ═══════════════════════════════════════════════════════
   CreateProjectModal — Create a new knowledge workspace
   ═══════════════════════════════════════════════════════ */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, description: string) => void;
}

export default function CreateProjectModal({ isOpen, onClose, onCreate }: Props) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setName('');
      setDescription('');
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onCreate(name.trim(), description.trim());
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
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
                  New Project
                </h2>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                  Create a knowledge workspace
                </p>
              </div>

              {/* Name */}
              <ModalField label="Project Name">
                <input
                  ref={inputRef}
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Frontend Mastery"
                  maxLength={50}
                  style={modalInputStyle}
                  onFocus={(e) => modalFocus(e.target as HTMLInputElement)}
                  onBlur={(e) => modalBlur(e.target as HTMLInputElement)}
                />
              </ModalField>

              {/* Description */}
              <ModalField label={<>Description <span style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)', fontWeight: 'var(--fw-normal)', letterSpacing: 0 }}>(optional)</span></>}>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What will you explore?"
                  maxLength={200}
                  rows={2}
                  style={{ ...modalInputStyle, resize: 'none' }}
                  onFocus={(e) => modalFocus(e.target as unknown as HTMLInputElement)}
                  onBlur={(e) => modalBlur(e.target as unknown as HTMLInputElement)}
                />
              </ModalField>

              {/* Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)', paddingTop: 'var(--sp-2)' }}>
                <button
                  type="submit"
                  disabled={!name.trim()}
                  style={{
                    width: '100%', height: 46,
                    background: name.trim() ? 'var(--pink)' : 'var(--surface)',
                    color: name.trim() ? '#fff' : 'var(--text-muted)',
                    border: 'none',
                    borderRadius: 'var(--r-full)',
                    fontSize: 'var(--text-base)',
                    fontWeight: 'var(--fw-medium)',
                    boxShadow: name.trim() ? 'var(--pink-glow)' : 'none',
                    transition: 'all var(--t-base) var(--ease)',
                    cursor: name.trim() ? 'pointer' : 'default',
                    opacity: name.trim() ? 1 : 0.5,
                  }}
                  onMouseEnter={(e) => {
                    if (name.trim()) {
                      (e.currentTarget as HTMLElement).style.filter = 'brightness(1.1)';
                      (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.filter = 'none';
                    (e.currentTarget as HTMLElement).style.transform = 'none';
                  }}
                >
                  Create Project
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

/* ── Helpers ─────────────────────────────────────────────── */
function ModalField({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
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
