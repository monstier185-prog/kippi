# MyStreet.id

A calm, minimalist **CV portfolio website builder**. Create, edit, preview, and
export a personal portfolio — all in your browser.

MyStreet.id is **local-first**: there is no server and no database. Your drafts
are stored in this browser and nothing is uploaded anywhere. Publishing and
shareable links are implemented honestly as **local-only** (see limitations
below) — the product never pretends to host a live public page on a server.

## Tech stack

- [Vite 5](https://vitejs.dev/) + [React 18](https://react.dev/) +
  [TypeScript 5](https://www.typescriptlang.org/) (strict)
- [react-router-dom 6](https://reactrouter.com/) for routing
- [zod](https://zod.dev/) for runtime validation
- [Vitest](https://vitest.dev/) + Testing Library + jsdom for tests
- ESLint (typescript-eslint, react-hooks, jsx-a11y)

## Local setup

Requires Node 18+ (developed on Node 22) and npm.

```bash
npm install
npm run dev     # start the dev server (http://localhost:5173)
```

## Scripts

| Script               | What it does                                         |
| -------------------- | ---------------------------------------------------- |
| `npm run dev`        | Start the Vite dev server with HMR                   |
| `npm run build`      | Typecheck (`tsc --noEmit`) then build to `dist/`     |
| `npm run preview`    | Preview the production build locally                 |
| `npm run typecheck`  | Type-check the project without emitting              |
| `npm run lint`       | Lint `.ts`/`.tsx` with ESLint                        |
| `npm run test`       | Run the test suite once (Vitest)                     |
| `npm run test:watch` | Run tests in watch mode                              |

## Routes

| Path          | Page                                           |
| ------------- | ---------------------------------------------- |
| `/`           | Landing                                        |
| `/dashboard`  | Your portfolios (local)                        |
| `/editor/:id` | Portfolio editor + live preview                |
| `/cv/:id`     | Print-ready CV view (Print / Save as PDF)      |
| `/p/:slug`    | Local public view of a **published** portfolio |
| `*`           | Not Found fallback                             |

## Publishing & exporting

- **Publishing is local-only and explicit.** A portfolio is `draft`/`private`
  by default and is **never** reachable at `/p/:slug` until you open the
  **Publish** dialog in the editor and confirm. Publishing only flips a status
  in this browser so the public route renders it — nothing is uploaded. Use
  **Kelola publikasi → Nonaktifkan tautan publik** to unpublish (returns the
  portfolio to private). The dialog explains, in plain language, who can see the
  page, what publishing does, and how to disable it.
- **Export via Print / PDF.** The editor's **Export CV** button opens `/cv/:id`,
  a clean single-column CV. Click **Print / Save as PDF** to open the browser's
  native print dialog; choose a printer or "Save as PDF". Print rules apply A4
  margins, controlled page breaks (headings are not orphaned, sections are kept
  together where possible), print the full URL after each link so a paper CV
  stays useful, and keep images from overflowing.

### PDF export limitations (honest)

PDF export uses the **browser's own print pipeline** (`window.print()` → "Save
as PDF"). There is no server-side PDF renderer. Practical consequences:

- The exact PDF (fonts, pagination, page size) depends on the browser and OS
  print settings; results differ slightly between Chrome, Firefox, and Safari.
- Enable "Background graphics" in the print dialog if you want accent colors in
  the PDF; by default the print stylesheet favors legible black-on-white text.
- Very long single items may still split across a page break; the rules reduce
  but cannot fully eliminate this for arbitrary content.

## Project structure

```
assets/brand/        Brand SVGs (logo + favicon + variants)
docs/                Decisions, product brief, assumptions, diagrams
docs/diagrams/       Mermaid (.mmd) workflow diagrams
public/              Static assets served as-is (favicon)
src/app/             App shell + routes + smoke test
src/components/      Shared UI (e.g. Logo)
src/features/        Feature modules (editor, preview, dashboard, publishing)
src/lib/             Utilities (sanitize, validation helpers)
src/models/          Typed domain model
src/services/        Repository + persistence abstraction
src/styles/          Design tokens + global styles
src/test/            Test setup
```

## Deploy to Vercel

The app is a static single-page application.

- **Framework preset:** Vite
- **Build command:** `npm run build`
- **Output directory:** `dist`
- **Environment variables:** none required (local-first, no backend)

`vercel.json` already sets the Vite framework, build command, output directory,
and a SPA rewrite (`/(.*) → /index.html`) so deep links like `/editor/123`
resolve to the app instead of returning a 404 from the CDN.

## Local-first limitations (read this)

- **Data lives only in this browser.** Clearing storage, switching browsers, or
  switching devices means the data is not there. There is no cloud sync.
- **No multi-user accounts / auth.** "Private by default" means data never
  leaves the device, not that it is protected by a server account.
- **Shareable links are local-only.** `/p/:slug` reads from this browser's
  storage; sending that URL to someone else will not show them your portfolio.
  To genuinely share, **export** (print / PDF).

These constraints are intentional and documented in
[`docs/DECISIONS.md`](docs/DECISIONS.md) and
[`docs/ASSUMPTIONS.md`](docs/ASSUMPTIONS.md).
