# SkillPulse — Project Summary

## What Is SkillPulse?

**SkillPulse** is an interactive **personal knowledge & skill mapping tool**. It lets users visually organise what they know, what they're learning, and how concepts connect — using an animated, interactive **node graph** (mind-map style).

Think of it as a living visual journal for your skills and knowledge — structured like a graph, styled like a futuristic dashboard.

> **Tagline:** *knowledge · growth · system*

---

## Core Concept

| Idea | Description |
|---|---|
| **Projects** | Each "subject area" lives in its own project (e.g. *Web Dev*, *Machine Learning*) |
| **Skill Nodes** | Individual skills, concepts, resources, or milestones placed as nodes in a 2-D canvas |
| **Connections** | Nodes are linked by animated energy-flow edges that visualise relationships |
| **Timeline Events** | Each node tracks a history of notes/updates over time |
| **Energy Levels** | Node "energy" is derived from how recently it was updated — active skills glow brighter |

Node types supported:
- 🔵 `root` — top-level skill or subject
- 🟣 `concept` — a sub-concept or theory
- 🟡 `resource` — a book, course, or tool
- 🟢 `milestone` — an achievement or goal

---

## Technical Approach

| Layer | Technology |
|---|---|
| **Framework** | React 18 + TypeScript (via Vite) |
| **Graph Engine** | React Flow — renders and manages the interactive node canvas |
| **State Management** | Zustand (`useProjects`, `useGraph` stores) |
| **Persistence** | IndexedDB via Dexie.js — all data is stored locally in the browser |
| **Animations** | Framer Motion for page transitions, node reveals, and UI micro-animations |
| **Styling** | Vanilla CSS with CSS custom properties (dark void theme, pink accent palette) |
| **Background FX** | Custom animated `ParticleField` canvas for ambient atmosphere |

> All data is **100% local** — no server, no sign-up required.

---

## Simple User Workflow

```
1. LAUNCH  →  Open the app in your browser
               You land on the Dashboard (your project library)

2. CREATE  →  Click "+ New Project"
               Give it a name (e.g. "Frontend Dev") and an optional description

3. ENTER   →  Click any project card to open its graph workspace

4. ADD SKILL →  Click "Add skill" (or press  N )
                 Type a title, pick a node type & colour → confirm

5. GROW    →  Click any node to select it
               Click "Add child" to attach sub-skills or concepts to it

6. CONNECT →  Drag from one node's handle to another to draw a free-form link

7. EDIT    →  Click a node to open the Node Editor sidebar
               Add notes, change colour, log timeline events

8. ARRANGE →  Drag nodes freely around the canvas
               Positions auto-save on drag-end

9. REFLECT →  Return to the Dashboard anytime to switch between projects
               Node count and connection count are shown per session
```

### Keyboard Shortcuts

| Key | Action |
|---|---|
| `N` | Open "Add skill" modal |
| `Esc` | Close sidebar / deselect node |
| Drag node | Reposition on canvas (auto-saved) |
| Click node | Open editor sidebar |

---

## Design Philosophy

- **Dark, immersive UI** — deep void background with pink/cyan accents and glowing nodes
- **Zero friction** — no login, no cloud sync; everything lives locally
- **Visual energy** — node glow intensity reflects recency of updates, making "cold" skills dim and "hot" ones shine
- **Fluid interactions** — every action (add, drag, select) has a smooth motion transition
