/* ═══════════════════════════════════════════════════════
   CreateProjectModal — Minimal futuristic modal
   for creating a new project
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
          className="fixed inset-0 flex items-center justify-center"
          style={{ zIndex: 50 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0"
            style={{ background: 'rgba(6, 6, 14, 0.8)', backdropFilter: 'blur(8px)' }}
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-md mx-4 rounded-2xl overflow-hidden"
            style={{
              background: 'linear-gradient(145deg, rgba(26,26,46,0.95), rgba(17,17,32,0.98))',
              border: '1px solid rgba(255,105,180,0.15)',
              boxShadow: '0 0 60px rgba(255,105,180,0.08), 0 25px 50px rgba(0,0,0,0.5)',
            }}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <form onSubmit={handleSubmit} className="p-8">
              {/* Header */}
              <div className="mb-8">
                <h2
                  className="font-display text-xl font-semibold mb-1"
                  style={{ color: 'var(--text-primary)' }}
                >
                  New Project
                </h2>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Create a knowledge workspace
                </p>
              </div>

              {/* Name input */}
              <div className="mb-5">
                <label className="block text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                  Project Name
                </label>
                <input
                  ref={inputRef}
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Frontend Mastery"
                  maxLength={50}
                  className="w-full px-4 py-3 rounded-xl text-sm font-body outline-none transition-all duration-200"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: 'var(--text-primary)',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'rgba(255,105,180,0.4)';
                    e.target.style.boxShadow = '0 0 20px rgba(255,105,180,0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(255,255,255,0.08)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              {/* Description input */}
              <div className="mb-8">
                <label className="block text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                  Description <span style={{ color: 'var(--text-muted)' }}>(optional)</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What will you explore?"
                  maxLength={200}
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl text-sm font-body outline-none resize-none transition-all duration-200"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: 'var(--text-primary)',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'rgba(255,105,180,0.4)';
                    e.target.style.boxShadow = '0 0 20px rgba(255,105,180,0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(255,255,255,0.08)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl font-medium cursor-pointer transition-colors duration-200"
                  style={{ fontSize: '14px', minHeight: '40px', color: 'var(--text-secondary)' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!name.trim()}
                  className="px-6 py-2.5 rounded-xl font-semibold cursor-pointer transition-all duration-200 font-display"
                  style={{
                    fontSize: '14px',
                    minHeight: '40px',
                    background: name.trim()
                      ? 'linear-gradient(135deg, #ff69b4, #c44b8b)'
                      : 'rgba(255,255,255,0.05)',
                    color: name.trim() ? '#fff' : 'var(--text-muted)',
                    boxShadow: name.trim() ? '0 0 25px rgba(255,105,180,0.3)' : 'none',
                    opacity: name.trim() ? 1 : 0.5,
                  }}
                >
                  Create
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
