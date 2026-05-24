/* ═══════════════════════════════════════════════════════
   App — SkillPulse router shell

   Routes:
     /            → Dashboard (control center)
     /project/:id → Project workspace (graph)
   ═══════════════════════════════════════════════════════ */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Project from './pages/Project';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/project/:id" element={<Project />} />
        {/* Catch-all → back to dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
