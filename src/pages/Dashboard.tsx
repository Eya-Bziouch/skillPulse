/* ═══════════════════════════════════════════════════════
   Dashboard — SkillPulse control center

   The primary entry point. Shows all projects, lets users
   create / open / delete them. Minimal, futuristic, calm.
   ═══════════════════════════════════════════════════════ */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useProjects } from '../store/useProjects';
import ProjectCard from '../components/dashboard/ProjectCard';
import CreateProjectModal from '../components/dashboard/CreateProjectModal';
import ParticleField from '../components/background/ParticleField';

export default function Dashboard() {
  const navigate = useNavigate();
  const { projects, loading, loadProjects, createProject, deleteProject } = useProjects();
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const handleCreate = async (name: string, description: string) => {
    const project = await createProject(name, description);
    navigate(`/project/${project.id}`);
  };

  return (
    <div
      className="relative w-screen min-h-screen flex flex-col"
      style={{ background: 'var(--bg-void)', overflowY: 'auto', overflowX: 'hidden' }}
    >
      {/* Ambient particle atmosphere */}
      <ParticleField />

      {/* Radial gradient backdrop */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 20% 20%, rgba(255,105,180,0.04) 0%, transparent 60%),
            radial-gradient(ellipse 60% 80% at 80% 80%, rgba(103,232,249,0.03) 0%, transparent 60%)
          `,
          zIndex: 0,
        }}
      />

      {/* ── Header ───────────────────────────────────────── */}
      <header
        className="relative flex items-center justify-between px-10 pt-10 pb-6"
        style={{ zIndex: 10 }}
      >
        {/* Wordmark */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0, 0, 0.2, 1] }}
        >
          <h1 className="font-display text-2xl font-bold tracking-tight">
            <span className="text-gradient-pink">Skill</span>
            <span style={{ color: 'var(--text-secondary)' }}>Pulse</span>
          </h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-ghost)', letterSpacing: '0.12em' }}>
            knowledge · growth · system
          </p>
        </motion.div>

        {/* Create button */}
        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0, 0, 0.2, 1] }}
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-display font-semibold cursor-pointer transition-all duration-300"
          style={{
            fontSize: '14px',
            minHeight: '40px',
            background: 'linear-gradient(135deg, #ff69b4, #c44b8b)',
            color: '#fff',
            boxShadow: '0 0 30px rgba(255,105,180,0.25), 0 4px 16px rgba(0,0,0,0.3)',
          }}
          whileHover={{
            scale: 1.03,
            boxShadow: '0 0 40px rgba(255,105,180,0.4), 0 6px 20px rgba(0,0,0,0.3)',
          }}
          whileTap={{ scale: 0.98 }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Project
        </motion.button>
      </header>

      {/* ── Divider ──────────────────────────────────────── */}
      <div
        className="mx-10 mb-8"
        style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,105,180,0.15), transparent)' }}
      />

      {/* ── Main content ─────────────────────────────────── */}
      <main className="relative flex-1 px-10 pb-16" style={{ zIndex: 10 }}>
        {loading ? (
          <LoadingState />
        ) : projects.length === 0 ? (
          <EmptyState onCreateClick={() => setModalOpen(true)} />
        ) : (
          <>
            {/* Section label */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="text-xs font-medium uppercase tracking-widest mb-6"
              style={{ color: 'var(--text-ghost)' }}
            >
              {projects.length} {projects.length === 1 ? 'project' : 'projects'}
            </motion.p>

            {/* Project grid */}
            <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
              <AnimatePresence mode="popLayout">
                {projects.map((project, i) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onDelete={deleteProject}
                    index={i}
                  />
                ))}
              </AnimatePresence>
            </div>
          </>
        )}
      </main>

      {/* ── Create Modal ──────────────────────────────────── */}
      <CreateProjectModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={handleCreate}
      />
    </div>
  );
}

/* ── Sub-components ─────────────────────────────────────── */

function LoadingState() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-4">
        <motion.div
          className="w-8 h-8 rounded-full"
          style={{ border: '2px solid rgba(255,105,180,0.2)', borderTopColor: '#ff69b4' }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
        <p className="text-xs" style={{ color: 'var(--text-ghost)' }}>Loading projects…</p>
      </div>
    </div>
  );
}

function EmptyState({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="flex flex-col items-center justify-center h-64 gap-6 text-center"
    >
      {/* Central orb */}
      <motion.div
        className="relative flex items-center justify-center"
        animate={{ scale: [1, 1.06, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center"
          style={{
            background: 'radial-gradient(circle at 35% 35%, rgba(255,105,180,0.25), rgba(255,105,180,0.08))',
            border: '1px solid rgba(255,105,180,0.2)',
            boxShadow: '0 0 40px rgba(255,105,180,0.08)',
          }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(255,105,180,0.7)" strokeWidth="1.5" strokeLinecap="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="16" />
            <line x1="8" y1="12" x2="16" y2="12" />
          </svg>
        </div>
        {/* Pulse ring */}
        <motion.div
          className="absolute w-20 h-20 rounded-full"
          style={{ border: '1px solid rgba(255,105,180,0.15)' }}
          animate={{ scale: [1, 1.8], opacity: [0.4, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeOut' }}
        />
      </motion.div>

      <div>
        <h2 className="font-display text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
          No projects yet
        </h2>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Create your first knowledge graph workspace
        </p>
      </div>

      <button
        onClick={onCreateClick}
        className="px-6 py-2.5 rounded-xl font-display font-semibold cursor-pointer transition-all duration-300"
        style={{
          fontSize: '14px',
          minHeight: '40px',
          background: 'rgba(255,105,180,0.1)',
          border: '1px solid rgba(255,105,180,0.25)',
          color: 'var(--accent-primary)',
        }}
      >
        Create your first project →
      </button>
    </motion.div>
  );
}
