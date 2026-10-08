# Architecture Decisions — MyStreet.id

This document records the key technical decisions for MyStreet.id and the
reasoning behind them. It is deliberately honest about what the system does and
does not do, in line with the project's anti-AI-slop rules (no invented
capabilities, no fake backends).

## 1. Stack: Vite + React + TypeScript

- **Vite 5** as the build tool and dev server. Fast HMR, first-class
  TypeScript support, and a trivial static build (`vite build` → `dist/`) that
  maps cleanly onto static hosting.
- **React 18** for the UI, with `react-router-dom` 6 for client-side routing.
- **TypeScript 5 (strict)** so the domain model (portfolio, sections,
  experience, projects, publication status, validation errors, save state) is
  typed end to end.
- **zod** for runtime validation of untrusted/stored data, so that data read
  back from the browser can be validated before it is trusted.
- **Vitest + @testing-library/react + jsdom** for unit and component tests,
  matching the Vite toolchain with no extra transpilation config.
- **ESLint** with `typescript-eslint`, `react-hooks`, and `jsx-a11y` so
  accessibility and hook-safety issues are caught in CI.

Rationale: the product is a single-user document editor with live preview and
export. That is a client-side problem. A heavy framework or server runtime
would add operational cost without serving the actual requirements.

## 2. Local-first — there is NO server or database

The spec's workflow language includes conditional phrasing such as "jika
backend tersedia" (if a backend is available). **For this implementation there
is no backend available and none is provisioned.**

- Persistence is **browser-local** (localStorage / IndexedDB) behind a
  `PortfolioRepository` abstraction (introduced in a later feature). The
  abstraction exists specifically so that a real remote repository could be
  substituted in the future without rewriting the UI — but today the only
  implementation is local.
- The "public / private" flag and "shareable URL" features are implemented
  **honestly as local-only**. A published portfolio is reachable at an
  in-app route (`/p/:slug`) that reads from this browser's storage. It is
  **not** a live, server-hosted, globally reachable URL, and the UI and docs
  must never claim otherwise.
- Consequences (clearing browser storage loses data, links are not live across
  devices, no multi-user auth) are documented in `ASSUMPTIONS.md`.

Rationale: building a fake backend, or implying one exists, would violate the
anti-slop rules and mislead users. A clearly-scoped local-first product is both
honest and genuinely useful (private by default, no accounts, instant).

## 3. Deploy: Vercel static SPA

- The app is a static single-page application. We deploy it to **Vercel** with
  the **Vite** framework preset.
- `vercel.json` sets `framework: "vite"`, `buildCommand: "npm run build"`,
  `outputDirectory: "dist"`, and a SPA rewrite (`/(.*) → /index.html`) so that
  deep links such as `/editor/123` and `/p/my-slug` resolve to the SPA instead
  of 404-ing on the CDN.
- **No environment variables are required**, because there is no backend to
  configure. This keeps the deploy reproducible and secret-free.

Rationale: a static SPA is the simplest correct host for a client-only app, and
the SPA rewrite is the one piece of host configuration client-side routing
actually needs.
