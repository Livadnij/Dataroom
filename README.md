# Dataroom

A virtual data room — top-level "datarooms" containing nested folders and files. Everything runs client-side: no backend, no network calls, all data lives in the browser via IndexedDB.

## Setup

Requires Node.js 20+.

```bash
npm install
npm run dev       # starts the dev server (Vite)
```

Other scripts:

```bash
npm run build      # tsc -b && vite build
npm run lint        # oxlint
npm run preview     # serve the production build locally
```

Nothing else to configure — no env vars, no external services. Data persists in the browser's IndexedDB per-origin, so it survives reloads but is local to whichever browser profile you use.

## What's implemented

**Datarooms** — create, view, delete (cascades to everything inside).

**Folders** — create, nest arbitrarily deep, rename, delete (cascades to nested folders/files, with a confirmation dialog that states the impact, e.g. "deletes this folder, 3 nested folders, and 7 files").

**Files** — upload (drag-and-drop anywhere on the page, or a picker button), rename, delete, preview, download. Multi-select with a "Select" toggle, checkboxes per row/card, select-all, and bulk delete.

**Settings** — theme (light/dark/system, with live updates if the OS theme changes while "system" is selected), table/grid view toggle, a storage usage meter (`navigator.storage.estimate()`), and a "clear all data" action.

## Design decisions

**Swappable persistence layer.** All storage access goes through a single `DataroomStorage` interface (`src/lib/storage/DataroomStorage.ts`) — `listDatarooms`, `createFolder`, `deleteFolder`, `uploadFile`, `getFileBlob`, etc. The only implementation right now is IndexedDB-backed (`indexedDbStorage.ts`, using the `idb` wrapper), but nothing above that interface — components, TanStack Query hooks — knows or cares that it's IndexedDB. Swapping in a real backend later means writing a second implementation of the same interface, not touching the UI layer.
IndexedDB was picked over the other two options the brief calls out — a JSON blob in localStorage, or a plain in-memory store — because it's the only one that handles Blobs natively and asynchronously without blocking the main thread; localStorage is synchronous and string-only (files would need base64 encoding, ~33% size bloat, and it would choke well before the 50MB cap), and an in-memory store loses everything on refresh, which defeats "upload a file and come back to it" as a workflow.

**TanStack Query for the data layer.** Wraps every DataroomStorage call — caching, invalidation, and loading/error states come for free instead of hand-rolled useState/useEffect data-fetching.

**Centralized error handling.** Mutations don't each hand-roll their own try/catch/toast — QueryCache/MutationCache.onError in main.tsx catches failures centrally and surfaces a toast, so individual dialogs and buttons stay free of repeated error-handling boilerplate. The couple of spots that intentionally sit outside that (file download, clear-data) get their own explicit catch instead.

**Data model.** Folders and files are a flat adjacency list, not a materialized path or nested-set model — `parentId` points at the immediate parent (or at the dataroom's own id, as a root sentinel), and `dataroomId` is denormalized onto every folder/file record rather than only inherited through the parent chain. That denormalization is what lets deleting an entire dataroom be a single indexed bulk-delete per object store on `dataroomId`, instead of a recursive walk. Deleting a single folder still walks its subtree (via a `by-parent` compound index, breadth-first) since that only removes part of the tree. Breadcrumbs resolve by walking `parentId` up to the root via sequential lookups — no materialized path, since nesting depth here is shallow enough that this is trivial.

**Duplicate names.** Creating a folder, dataroom, or uploading a file with a name that collides with an existing sibling auto-suffixes it (`notes (1).txt`, preserving the extension) rather than blocking or silently overwriting.

**File type support.** Upload has no type restriction — any file the browser's picker allows is accepted, and the storage layer treats files as opaque blobs regardless of mime type. This was a conscious call, not an oversight: the code cost was close to zero (nothing about the storage layer assumed PDF), and it makes the app materially more useful as a general-purpose data room rather than a PDF-only one. There's a 50MB per-file size cap, with oversized files rejected inline rather than silently failing.

**File preview**, tiered by mime type rather than a single generic viewer:

- PDF — rendered with `pdfjs-dist` on a canvas, sized to the actual page dimensions (not embedded via `<iframe>`/`<embed>`, which can't report their natural content size). Code-split via `React.lazy` so the ~1.7MB of PDF.js (main bundle + worker) is only downloaded when a PDF is actually opened.
- Images, video, audio — native `<img>`/`<video>`/`<audio>`.
- Text-like files (plain text, markdown, JSON, CSV, HTML/CSS/JS, XML) — read as text and rendered in a `<pre>` block, sized to actual content rather than a fixed box. If textContent contains script, it renders as a literal visible string, not a parsed tag.
- Anything else — a fallback state with a download action. This is what makes "accept every file type" safe: nothing can hit an unhandled case, it just falls through to "here's a download button."

**Settings storage.** Theme and view-mode are two small scalars, not domain data, so they live in `localStorage` (a plain pub/sub store) rather than IndexedDB, read via `useSyncExternalStore` so every component observing settings re-renders in sync without prop drilling or a context provider.

**Feature-folder layout**, one-way import boundaries: `src/app/` is the only place that reaches across `src/features/*`; `src/features/datarooms` and `src/features/browser` never import from each other directly. `src/components/` holds shared, feature-agnostic components (shadcn primitives, plus a couple of composed ones like `CreateNameDialog` that both features need).

## Known limitations / what's next

- **Optional extra credit not attempted**: no auth layer, no search/filtering. The brief marks these as "only if time remaining" — time went into the core CRUD flows, edge cases, and UX polish instead (multi-select, per-file-type icons, drag-and-drop anywhere on the page, the preview system).

## AI usage disclosure

This project was built in collaboration with Claude (Anthropic), used throughout for scaffolding, implementation, and UI iteration. Workflow: Changes are reviewed and applied to this repository by hand rather than through direct automated file writes. Product and architecture decisions — the persistence-interface approach, data model, scope reading of the brief — were made by the author, with Claude used as an implementation and iteration partner, not an autonomous decision-maker.

## Tech stack

React 19, TypeScript, Vite, Tailwind CSS v4, shadcn/ui (Radix primitives), TanStack Query, React Router, IndexedDB via `idb`, PDF.js for in-browser PDF rendering, `nanoid` for IDs.
