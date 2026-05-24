/* ═══════════════════════════════════════════════════════
   Project — Immersive graph workspace

   Opened when a user enters a project. Contains:
     - Full-screen React Flow graph (live, editable)
     - 52px top toolbar (back, project name, add skill, add child)
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
      await addChildNode(addModal.parentId, title, nodeType, color);
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
      className="flex flex-col w-screen h-screen overflow-hidden relative"
      style={{ background: 'var(--void)', color: 'var(--text-primary)' }}
    >
      {/* Particle atmosphere */}
      <ParticleField />

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 2,
          background: `radial-gradient(ellipse 80% 60% at 50% 50%, transparent 40%, rgba(9,9,15,0.6) 100%)`,
        }}
      />

      {/* ── Top Toolbar (Exactly 52px) ────────────────── */}
      <motion.header
        className="flex items-center px-6 gap-4"
        style={{
          height: '52px',
          minHeight: '52px',
          zIndex: 'var(--z-topbar)' as never,
          background: 'var(--void-2)',
          borderBottom: '1px solid var(--border)',
          backdropFilter: 'blur(8px)',
          boxSizing: 'border-box',
        }}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Back button */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-4 rounded-xl cursor-pointer transition-all"
          style={{
            fontSize: 'var(--text-sm)',
            height: '40px',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            color: 'var(--text-muted)',
            borderRadius: 'var(--r-md)',
            transition: 'all var(--t-base) var(--ease)',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = 'var(--pink-dim)';
            (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
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
            style={{ background: 'var(--pink)', boxShadow: 'var(--pink-glow)' }}
            animate={{ opacity: [0.5, 1, 0.5], scale: [0.85, 1.1, 0.85] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
          <h1 className="font-display font-semibold truncate" style={{ color: 'var(--text-primary)', fontSize: 'var(--text-md)' }}>
            {project?.name ?? '…'}
          </h1>
          {project?.description && (
            <span className="truncate hidden sm:block" style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>
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
                className="flex items-center gap-2 px-4 rounded-xl font-medium cursor-pointer transition-all"
                style={{
                  fontSize: 'var(--text-sm)',
                  height: '40px',
                  background: 'var(--cyan-dim)',
                  border: '1px solid rgba(34,211,184,0.25)',
                  color: 'var(--cyan)',
                  borderRadius: 'var(--r-md)',
                  transition: 'all var(--t-base) var(--ease)',
                }}
                whileHover={{ scale: 1.03, boxShadow: 'var(--cyan-glow)' }}
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
            className="flex items-center gap-2 px-5 rounded-xl font-semibold font-display cursor-pointer transition-all"
            style={{
              fontSize: 'var(--text-sm)',
              height: '40px',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
              borderRadius: 'var(--r-md)',
              transition: 'all var(--t-base) var(--ease)',
            }}
            whileHover={{ scale: 1.03, background: 'var(--surface-hover)', borderColor: 'var(--border-strong)' }}
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
            className="flex items-center gap-2 px-5 rounded-xl font-semibold font-display cursor-pointer transition-all"
            style={{
              fontSize: 'var(--text-sm)',
              height: '40px',
              background: 'var(--pink)',
              color: '#fff',
              borderRadius: 'var(--r-md)',
              boxShadow: 'var(--pink-glow)',
              transition: 'all var(--t-base) var(--ease)',
            }}
            whileHover={{ scale: 1.03, filter: 'brightness(1.1)' }}
            whileTap={{ scale: 0.97 }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Update Progress
          </motion.button>
        </div>
      </motion.header>

      {/* ── Flex-Row Workspace Container ──────────────── */}
      <div className="flex-1 flex flex-row relative overflow-hidden">
        {/* Graph Canvas Wrapper (Resizes smoothly when sidebar mounts) */}
        <div className="flex-1 h-full relative" style={{ zIndex: 'var(--z-graph)' as never }}>
          {loading ? (
            <div className="flex items-center justify-center w-full h-full">
              <motion.div
                className="w-10 h-10 rounded-full"
                style={{ border: '2px solid rgba(224,64,123,0.15)', borderTopColor: 'var(--pink)' }}
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

          {/* ── Empty State Overlay ──────────────────────── */}
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
                      background: 'var(--pink-dim)',
                      border: '1px solid var(--border-strong)',
                    }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--pink)" strokeWidth="1.5" strokeLinecap="round">
                      <circle cx="12" cy="12" r="3" />
                      <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-display text-base font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                      Empty workspace
                    </p>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      Press <kbd className="px-1.5 py-0.5" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', color: 'var(--text-secondary)' }}>N</kbd> or click <strong style={{ color: 'var(--pink)' }}>Add skill</strong> to begin
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Status Bar (Badge) ────────────────────── */}
          <AnimatePresence>
            {!loading && nodes.length > 0 && (
              <motion.div
                className="absolute bottom-6 left-6 flex items-center gap-2 px-3 py-2"
                style={{
                  zIndex: 10,
                  background: 'var(--void-3)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--r-md)',
                  backdropFilter: 'blur(8px)',
                }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
              >
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--pink)', boxShadow: 'var(--pink-glow)' }} />
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  <strong style={{ color: 'var(--text-primary)', fontWeight: 'var(--fw-medium)' }}>{nodes.length}</strong> {nodes.length === 1 ? 'skill' : 'skills'}
                </span>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>·</span>
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  <strong style={{ color: 'var(--text-primary)', fontWeight: 'var(--fw-medium)' }}>{edges.length}</strong> {edges.length === 1 ? 'connection' : 'connections'}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Keyboard Hint ──────────────────────────── */}
          <div
            className="absolute bottom-6 right-6"
            style={{ zIndex: 10 }}
          >
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              <kbd className="px-1.5 py-0.5" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', color: 'var(--text-primary)' }}>N</kbd> new skill · click node to edit · drag to move
            </p>
          </div>
        </div>

        {/* ── Node Editor Sidebar (Slides in dynamically) ── */}
        <NodeEditor
          isOpen={sidebarOpen}
          nodeId={selectedNodeId}
          onClose={() => { setSidebarOpen(false); selectNode(null); }}
        />
      </div>

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
