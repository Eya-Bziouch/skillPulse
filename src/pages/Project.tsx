/* ═══════════════════════════════════════════════════════
   Project — Immersive graph workspace

   Opened when a user enters a project. Contains:
     - Full-screen React Flow graph (live, editable)
     - Top toolbar (back, project name, add skill, add child)
     - NodeEditor sidebar (slides in on node click)
     - Auto-persists positions on drag stop
   ═══════════════════════════════════════════════════════ */

import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGraph } from '../store/useGraph';
import { db } from '../db';
import type { Project, NodeType } from '../types';
import ParticleField from '../components/background/ParticleField';
import GraphCanvas from '../components/graph/GraphCanvas';
import NodeEditor from '../components/graph/NodeEditor';
import AddSkillModal from '../components/graph/AddSkillModal';
import UpdateProgressModal from '../components/graph/UpdateProgressModal';

export default function ProjectPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  /* ── State ─────────────────────────────────────────── */
  const {
    nodes, edges, loading,
    loadProject, unloadProject,
    addRootSkill, addChildNode,
    updateNodePosition, persistPositions,
    selectNode, selectedNodeId, sidebarOpen, setSidebarOpen,
    updateProgress,
  } = useGraph();

  const [project, setProject] = useState<Project | null>(null);

  // Modal state
  const [addModal, setAddModal] = useState<{ open: boolean; mode: 'root' | 'child'; parentId?: string; parentLabel?: string }>({
    open: false, mode: 'root',
  });
  const [updateProgressModalOpen, setUpdateProgressModalOpen] = useState(false);

  /* ── Load project ──────────────────────────────────── */
  useEffect(() => {
    if (!id) return;

    // Load graph data
    loadProject(id);

    // Fetch project meta
    db.projects.get(id).then((p) => {
      if (p) setProject(p);
      else navigate('/'); // Project not found → back to dashboard
    });

    return () => {
      unloadProject();
    };
  }, [id, loadProject, unloadProject, navigate]);

  /* ── Handlers ──────────────────────────────────────── */
  const handleNodeClick = useCallback((nodeId: string) => {
    selectNode(nodeId);
  }, [selectNode]);

  const handleNodeDragStop = useCallback((nodeId: string, x: number, y: number) => {
    updateNodePosition(nodeId, x, y);
    // Debounce-free persist: save immediately on drag end
    persistPositions();
  }, [updateNodePosition, persistPositions]);

  const handleAddRoot = () => {
    setAddModal({ open: true, mode: 'root' });
  };

  const handleAddChild = () => {
    if (!selectedNodeId) return;
    const skill = useGraph.getState().skills.find((s) => s.id === selectedNodeId);
    setAddModal({ open: true, mode: 'child', parentId: selectedNodeId, parentLabel: skill?.title });
  };

  const handleCreate = async (title: string, nodeType: NodeType, color: string) => {
    if (addModal.mode === 'root') {
      await addRootSkill(title, color);
    } else if (addModal.parentId) {
      await addChildNode(addModal.parentId, title, nodeType);
    }
  };

  const handleNodesChange = useCallback((updated: typeof nodes) => {
    useGraph.setState({ nodes: updated });
  }, [nodes]);

  const handleEdgesChange = useCallback((updated: typeof edges) => {
    useGraph.setState({ edges: updated });
  }, [edges]);

  const handleConnect = useCallback((sourceId: string, targetId: string) => {
    // Add a free-form visual edge (non-DB) between any two nodes
    const sourceSkill = useGraph.getState().skills.find((s) => s.id === sourceId);
    const newEdge = {
      id: `e-custom-${sourceId}-${targetId}-${Date.now()}`,
      source: sourceId,
      target: targetId,
      type: 'energy' as const,
      data: { color: sourceSkill?.color ?? '#ff69b4', energyLevel: 0.6 },
    };
    useGraph.setState((s) => ({ edges: [...s.edges, newEdge] }));
  }, []);

  /* ── Keyboard shortcuts ────────────────────────────── */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // N → add root skill
      if (e.key === 'n' && !e.metaKey && !e.ctrlKey) {
        const active = document.activeElement;
        if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) return;
        handleAddRoot();
      }
      // Escape → close sidebar
      if (e.key === 'Escape') {
        setSidebarOpen(false);
        selectNode(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setSidebarOpen, selectNode]);

  /* ── Render ────────────────────────────────────────── */
  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      style={{ background: 'var(--bg-void)' }}
    >
      {/* Particle atmosphere */}
      <ParticleField />

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 2,
          background: `radial-gradient(ellipse 80% 60% at 50% 50%, transparent 40%, rgba(6,6,14,0.6) 100%)`,
        }}
      />

      {/* ── Top Toolbar ──────────────────────────────── */}
      <motion.div
        className="absolute top-0 left-0 right-0 flex items-center px-6 py-4 gap-4"
        style={{
          zIndex: 15,
          background: 'linear-gradient(180deg, rgba(6,6,14,0.9) 0%, transparent 100%)',
          backdropFilter: 'blur(4px)',
        }}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Back button */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl cursor-pointer transition-all group"
          style={{
            fontSize: '14px',
            minHeight: '40px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.07)',
            color: 'var(--text-muted)',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,105,180,0.25)';
            (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)';
            (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)';
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Dashboard
        </button>

        {/* Project name */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <motion.div
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ background: 'var(--accent-primary)', boxShadow: '0 0 8px var(--accent-glow)' }}
            animate={{ opacity: [0.5, 1, 0.5], scale: [0.85, 1.1, 0.85] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
          <h1 className="font-display font-semibold text-base truncate" style={{ color: 'var(--text-primary)' }}>
            {project?.name ?? '…'}
          </h1>
          {project?.description && (
            <span className="text-xs truncate hidden sm:block" style={{ color: 'var(--text-ghost)' }}>
              — {project.description}
            </span>
          )}
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Add child (only when node is selected) */}
          <AnimatePresence>
            {selectedNodeId && (
              <motion.button
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                onClick={handleAddChild}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium cursor-pointer transition-all"
                style={{
                  fontSize: '14px',
                  minHeight: '40px',
                  background: 'rgba(103,232,249,0.08)',
                  border: '1px solid rgba(103,232,249,0.2)',
                  color: '#67e8f9',
                }}
                whileHover={{ scale: 1.04, boxShadow: '0 0 20px rgba(103,232,249,0.15)' }}
                whileTap={{ scale: 0.97 }}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add child
              </motion.button>
            )}
          </AnimatePresence>

          {/* Add root skill */}
          <motion.button
            onClick={handleAddRoot}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold font-display cursor-pointer transition-all"
            style={{
              fontSize: '14px',
              minHeight: '40px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.07)',
              color: 'var(--text-primary)',
            }}
            whileHover={{ scale: 1.04, background: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.15)' }}
            whileTap={{ scale: 0.97 }}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add skill
          </motion.button>

          {/* Update Progress Button */}
          <motion.button
            onClick={() => setUpdateProgressModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold font-display cursor-pointer"
            style={{
              fontSize: '14px',
              minHeight: '40px',
              background: 'linear-gradient(135deg, #ff69b4, #c44b8b)',
              color: '#fff',
              boxShadow: '0 0 24px rgba(255,105,180,0.25)',
            }}
            whileHover={{ scale: 1.04, boxShadow: '0 0 32px rgba(255,105,180,0.4)' }}
            whileTap={{ scale: 0.97 }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Update Progress
          </motion.button>
        </div>
      </motion.div>

      {/* ── Graph Canvas ─────────────────────────────── */}
      <div className="absolute inset-0" style={{ zIndex: 1 }}>
        {loading ? (
          <div className="flex items-center justify-center w-full h-full">
            <motion.div
              className="w-10 h-10 rounded-full"
              style={{ border: '2px solid rgba(255,105,180,0.15)', borderTopColor: '#ff69b4' }}
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
          </div>
        ) : (
          <GraphCanvas
            nodes={nodes}
            edges={edges}
            onNodesChange={handleNodesChange}
            onEdgesChange={handleEdgesChange}
            onNodeClick={handleNodeClick}
            onNodeDragStop={handleNodeDragStop}
            onConnect={handleConnect}
          />
        )}
      </div>

      {/* ── Empty state overlay ──────────────────────── */}
      <AnimatePresence>
        {!loading && nodes.length === 0 && (
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
            style={{ zIndex: 5 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="flex flex-col items-center gap-4 text-center"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{
                  background: 'radial-gradient(circle, rgba(255,105,180,0.1) 0%, transparent 70%)',
                  border: '1px solid rgba(255,105,180,0.15)',
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(255,105,180,0.5)" strokeWidth="1.5" strokeLinecap="round">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
                </svg>
              </div>
              <div>
                <p className="font-display text-base font-medium mb-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  Empty workspace
                </p>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.15)' }}>
                  Press <kbd className="px-1.5 py-0.5 rounded text-xs" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>N</kbd> or click <strong style={{ color: 'rgba(255,105,180,0.5)' }}>Add skill</strong> to begin
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Node count badge ────────────────────────── */}
      <AnimatePresence>
        {!loading && nodes.length > 0 && (
          <motion.div
            className="absolute bottom-6 left-6 flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{
              zIndex: 10,
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              backdropFilter: 'blur(8px)',
            }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent-primary)', boxShadow: '0 0 6px var(--accent-glow)' }} />
            <span className="text-xs" style={{ color: 'var(--text-ghost)' }}>
              {nodes.length} {nodes.length === 1 ? 'skill' : 'skills'}
            </span>
            <span className="text-xs" style={{ color: 'var(--text-ghost)', opacity: 0.4 }}>·</span>
            <span className="text-xs" style={{ color: 'var(--text-ghost)' }}>
              {edges.length} {edges.length === 1 ? 'connection' : 'connections'}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Keyboard hint ────────────────────────────── */}
      <div
        className="absolute bottom-6 right-6"
        style={{ zIndex: 10 }}
      >
        <p className="text-xs" style={{ color: 'var(--text-ghost)', opacity: 0.5 }}>
          <kbd className="px-1 py-0.5 rounded text-xs" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>N</kbd> new skill · click node to edit · drag to move
        </p>
      </div>

      {/* ── Node Editor Sidebar ──────────────────────── */}
      <NodeEditor
        isOpen={sidebarOpen}
        nodeId={selectedNodeId}
        onClose={() => { setSidebarOpen(false); selectNode(null); }}
      />

      {/* ── Add Skill Modal ──────────────────────────── */}
      <AddSkillModal
        isOpen={addModal.open}
        mode={addModal.mode}
        parentLabel={addModal.parentLabel}
        onClose={() => setAddModal((s) => ({ ...s, open: false }))}
        onCreate={handleCreate}
      />

      {/* ── Update Progress Modal ────────────────────── */}
      <UpdateProgressModal
        isOpen={updateProgressModalOpen}
        onClose={() => setUpdateProgressModalOpen(false)}
        onCreate={updateProgress}
      />
    </div>
  );
}
