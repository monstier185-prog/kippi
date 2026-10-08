# Assumptions & Constraints — MyStreet.id

This project is **local-first**: there is no server and no database. The
following assumptions and honest limitations follow directly from that choice.

## Data & persistence

- All portfolio data is stored **in the user's browser** (localStorage /
  IndexedDB) via the `PortfolioRepository` abstraction.
- **Clearing browser storage, using a different browser, or using a different
  device means the data is not there.** There is no cloud sync.
- There is **no multi-user authentication**. The app assumes a single user on a
  single browser profile. "Private by default" means data simply never leaves
  the device, not that it is protected by server-side accounts.

## Publishing & shareable links (honest wording)

- The "public / private" toggle and "shareable URL" features are
  **local-session / export-based**, not live server URLs.
- A "published" portfolio is reachable at an in-app route (`/p/:slug`) that
  reads from **this browser's** storage. Sending that URL to someone else will
  **not** show them your portfolio, because the data lives only on your device.
- To genuinely share a portfolio, the user **exports** it (e.g. print / PDF, or
  a future self-contained export). The UI must describe sharing in these honest
  terms and must never imply a live, globally reachable, server-hosted page.

## Security & privacy implications

- Because data never leaves the browser, there is no server-side attack surface
  for stored data and no secrets in the deployed bundle.
- All user-provided content rendered into the DOM must still be treated as
  untrusted and escaped/sanitized to prevent XSS, since a user could import a
  malicious draft. This is addressed in later features (sanitize utilities +
  security review).

## Deployment

- The app deploys as a **static SPA on Vercel**. No environment variables are
  required because there is no backend to configure.
- A SPA rewrite is required so deep links resolve to the app shell.

## Future substitution

- The repository abstraction is intentional: if a real backend is added later,
  a remote `PortfolioRepository` implementation can replace the local one
  without rewriting the UI. Until that exists, **nothing in the product should
  claim backend behavior.**
