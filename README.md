# TaskFlow

A client-side project and task management app built with React, TypeScript, and Tailwind. No backend, no account needed — everything lives in your browser.

---

## Features

- Create and manage multiple **projects**, each with their own tasks
- Tasks support a **rich text description**, priority, due date, and status
- **Three views** per project: List, Card grid, and Kanban board
- **Search and filter** tasks by title/description, status, and priority
- **Link tasks** to each other within a project (dependency-style graph)
- Full **task history** — every change (status, priority, title, due date) is logged
- **Dark / Light / System** theme toggle
- **Export** your data as a JSON backup and **import** it back
- **Offline support** — a service worker caches the app shell so it loads without internet
- Stat cards on the home screen showing totals across all projects
- Confirmation dialog before deleting anything
- Fully responsive — works on desktop, tablet, and mobile

---

## Tech Stack

- **React 19** + **TypeScript**
- **Vite 7** — build tool
- **Tailwind CSS 4** — styling
- **Zustand 5** — global state with `persist` middleware (localStorage)
- **React Router 7** — client-side routing
- **Motion (Framer Motion API)** — animations
- **Radix UI / shadcn-style primitives** — accessible UI components
- **lucide-react** — icons
- **react-simple-wysiwyg** — rich text editor for task descriptions
- **Inter variable font** via Fontsource

---

## Setup

**Prerequisites:** Node 18+ (or Bun)

```bash
# clone the repo
git clone <repo-url>
cd taskapp

# install dependencies
npm install
# or
bun install

# start dev server
npm run dev
# or
bun dev
```

Open `http://localhost:5173` in your browser.

```bash
# build for production
npm run build

# preview the production build locally
npm run preview
```

The service worker only registers in production builds. In development, it is intentionally unregistered so Vite HMR works cleanly.

---

## Folder Structure

```
src/
  app/            # Route definitions (App.tsx)
  components/
    kanban/       # KanbanBoard and KanbanCard
    offline/      # OfflineBanner and OfflineStatusProvider
    projects/     # ProjectsView, ProjectCard, ProjectModal, ImportDialog
    tasks/        # All task-related views and modals
    ui/           # Shared primitives (Modal, Button, StatCard, etc.)
  lib/            # Types, constants, utils, task helpers
  store/          # Zustand store (single file, persist to localStorage)
  index.css       # Global styles and CSS variables
public/
  sw.js           # Service worker for offline shell caching
```

---

## App Flow

```
App start
  └─ Register service worker (production only)
  └─ Load persisted state from localStorage
  └─ Render router

/ (Home)
  └─ ProjectsView
       ├─ Create / edit / delete projects
       ├─ Export all data as JSON
       ├─ Import JSON backup (replaces all data after confirmation)
       └─ Click project → navigate to /projects/:projectId

/projects/:projectId (Project detail)
  └─ ProjectDetailView
       ├─ FilterBar — search, status filter, priority filter
       ├─ View toggle — List / Card / Kanban
       ├─ Create / edit / delete tasks via TaskModal
       ├─ Toggle task status inline
       └─ Click task → navigate to /projects/:projectId/tasks/:taskId

/projects/:projectId/tasks/:taskId (Task detail)
  └─ TaskDetailPage
       ├─ Full task info with rich text description
       ├─ History log of all changes
       └─ Linked tasks section with links to related tasks
```

---

## Data Flow

```
User action
  └─ Component calls Zustand store action
       └─ Store updates in-memory state
            └─ Zustand persist middleware writes to localStorage
                 └─ UI re-renders from store subscription
```

- All data is local. There is no network request for task data.
- The store schema is versioned (currently v4). A `migrate` function handles upgrading old persisted data automatically on load.

---

## Architecture

### Offline Behaviour

```mermaid
flowchart TD
    A["Browser loads app"] --> B["Register Service Worker\n(production only)"]
    B --> C["install event\nPrecache app shell\n/ · /index.html · /favicon.svg · /og-image.png"]
    C --> D["activate event\nPurge stale caches"]
    D --> E{navigator.onLine?}

    E -->|true| F["Normal operation"]
    F --> G["Navigation requests\nNetwork-first → cache fallback"]
    F --> H["Static asset requests\nCache-first → network + re-cache"]

    E -->|false| I["OfflineStatusProvider\ndetects offline event"]
    I --> J["OfflineBanner shown"]
    I --> K["Read operations\nFully functional\nstate served from memory / localStorage"]
    I --> L["Mutating actions BLOCKED\ncreate · edit · delete · import\nUser-facing notice shown"]
```

---

### State Management & Persistence

```mermaid
flowchart TD
    A["User action in UI"] --> B["Zustand store action called"]

    B --> C["In-memory state updated"]
    C --> D["projects[]\nid · name · description · createdAt"]
    C --> E["tasks[]\nid · projectId · title · description\npriority · status · dueDate · linkedTaskIds"]
    C --> F["taskHistory[]\nAppend-only audit log per task"]

    C --> G["persist middleware"]
    G --> H["Serialise → JSON.stringify"]
    H --> I["localStorage.setItem — key: taskapp"]

    I --> J{Schema version\nmatches?}
    J -->|yes| K["Hydrate store directly"]
    J -->|no| L["Run migrate()\nForward-patch old schema → current v4"]
    L --> K

    M["Theme preference"] --> N["localStorage — key: theme\nPersisted independently\nSurvives import / replace"]
```

---

### Application Core Flow

```mermaid
flowchart TD
    Start(["App bootstrap"]) --> SW["Register service worker\n(prod only)"]
    SW --> LS["Hydrate Zustand store\nfrom localStorage"]
    LS --> TH["Resolve theme\nlocalStorage → system preference"]
    TH --> RT["Mount router"]

    RT --> Home["/ — Home\nProjectsView"]
    Home --> SC["Stat cards\ntotal · pending · completed"]
    Home --> CP["Create project\nstore.addProject()"]
    Home --> EP["Edit project\nstore.updateProject()"]
    Home --> DP["Delete project\nConfirm dialog\nstore.deleteProject()\nCascades tasks + history"]
    Home --> EX["Export\nJSON stringify → file download"]
    Home --> IM["Import\nFile upload → validate\nConfirm → store.replaceAll()"]

    Home --> PD["/projects/:projectId\nProjectDetailView"]
    PD --> FB["FilterBar\nsearch · status · priority"]
    PD --> VT["View toggle\nList · Card · Kanban"]
    PD --> CT["Create task\nTaskModal → store.addTask()"]
    PD --> ET["Edit task\nTaskModal → store.updateTask()\n+ history event appended"]
    PD --> DT["Delete task\nConfirm → store.deleteTask()"]
    PD --> TS["Toggle status inline\nstore.updateTask()\n+ history event appended"]

    PD --> TD["/projects/:projectId/tasks/:taskId\nTaskDetailPage"]
    TD --> TV["Full task view\nRich-text description"]
    TD --> HL["History log\ntaskHistory filtered by taskId"]
    TD --> LT["Linked tasks\nlinkedTaskIds resolved → navigate on click"]
```

---

## Tradeoffs

### Image Attachments Not Implemented

Task cards intentionally do not support image attachments. localStorage, which backs the entire persistence layer, has a hard browser-enforced limit of roughly 5 MB per origin. A single image (even JPEG-compressed) would consume a significant portion of that budget and risks crashing the store write silently — leaving the user with data loss and no error message. A proper implementation would require an `IndexedDB`-backed blob store (or an object-storage backend), which is out of scope for a frontend-only app. The tradeoff keeps the persistence layer simple and reliable at the cost of richer media support.

### Edits Blocked in Offline Mode

Create, edit, and delete operations are intentionally disabled when `navigator.onLine` is false. This mimics the behaviour of a real API-backed application where mutations require a network round-trip and the server is the source of truth. Allowing offline edits without a sync mechanism would create a situation where local changes silently diverge from "server" state, producing conflicts with no resolution strategy. The conservative tradeoff — block writes, allow reads — ensures the user always sees consistent, authoritative data and is never surprised by lost or overwritten changes once connectivity returns.

---

## Key Design Decisions

- **No backend** — the product requirement is a frontend-only app; localStorage via Zustand persist is the simplest durable option
- **Single Zustand store** — keeps state in one place; easy to serialize and export
- **Schema versioning + migration** — old data stored by earlier versions (e.g. `completed` boolean instead of `done` status string) is migrated forward on load so nothing breaks after an update
- **Export / import as backup** — since there's no server sync, JSON export is the portability story; import validates the shape before applying and shows a destructive-replace warning
- **Offline shell via service worker** — navigation requests go network-first so fresh content is preferred; the cached shell is a fallback when offline; the SW is only active in production
- **Linked tasks as an ID array** — tasks store `linkedTaskIds`; on import, the store validates and strips any IDs that don't exist in the imported data to keep the graph consistent
- **Task history as append-only log** — every mutation appends an event to `taskHistory`; this is never trimmed so you always have a full audit trail
- **Rich text stored as HTML string** — the WYSIWYG editor produces HTML; it is rendered with `dangerouslySetInnerHTML` but the content is created by the same user, not from an external source
- **Modal uses render-prop children** — `children(close)` pattern lets any child call `close()` without prop drilling
- **Offline guards on mutations** — when `navigator.onLine` is false, mutating actions (create/edit/delete) show a notice instead of proceeding; read-only views still work normally
- **Theme stored in localStorage independently** — theme preference (`light` / `dark` / `system`) is persisted separately from app data so it survives import/replace

---

## Offline Behavior

- In **production**, the service worker precaches the app shell (`/`, `/index.html`, `/favicon.svg`, `/og-image.png`)
- Navigation requests try the network first; if offline it falls back to the cached `index.html`
- Static assets (JS/CSS chunks) are cached on first fetch and served from cache on repeat visits
- The `OfflineBanner` component shows a notice when `navigator.onLine` is false
- Mutating operations (create/edit/delete/import) are blocked while offline with a user-facing message

---

## Data Persistence Notes

- Storage key: `taskapp`
- Current schema version: `4`
- If you clear localStorage, all data is gone — use the export feature regularly as a backup
- The export format is a plain JSON object with a `version` field and arrays for `projects`, `tasks`, `taskHistory`
