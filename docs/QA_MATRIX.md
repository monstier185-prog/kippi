# QA Matrix (Section 16)

Verified against the real build of MyStreet.id (`npm run build` → `dist/`) and
the automated suite (`npm run test`, 94 tests). "Auto" = covered by a test;
"Manual" = verified by reasoning against the implemented code / markup. This is
a local-first SPA with no server; items that would require a backend are marked
accordingly and explained honestly.

Legend: ✅ pass · ⚠️ pass-with-note · n/a not applicable (local-first).

## Functional

| # | Check | Result | Evidence / notes |
|---|-------|--------|------------------|
| F1 | Create a portfolio from the dashboard, land in the editor | ✅ Auto | `Dashboard.test.tsx` create flow navigates to `/editor/:id`. |
| F2 | Open / rename / duplicate / delete (with confirm) | ✅ Auto | `Dashboard.test.tsx`, `portfolioRepository.test.ts`. Delete requires a Dialog confirm. |
| F3 | Edit every section type; data persists; switching sections keeps input | ✅ Auto | `PortfolioEditor.test.tsx` edit-persists + switching-preserves. |
| F4 | Reorder via buttons AND keyboard (not drag-only) | ✅ Auto | `PortfolioEditor.test.tsx` move-button + keyboard drag handle. |
| F5 | Hide/show section toggles visibility | ✅ Auto | `PortfolioEditor.test.tsx` hide toggle. |
| F6 | Autosave + visible save status; survives reload | ✅ Manual | `useEditorDraft.ts` debounced autosave; reload re-reads repo. |
| F7 | Live preview reflects edits; template/theme switch keeps data | ✅ Auto | `PortfolioRenderer.test.tsx`, `ThemeControls.test.tsx`. |
| F8 | Print / PDF export (CV view) via `window.print()` | ✅ Manual | `/cv/:id` `PrintCVView`; `print.ts` guards jsdom. @media print rules in `PrintCV.module.css` + `app.css`. |
| F9 | Public view renders a published portfolio by slug | ✅ Auto | `PublicPortfolioView.test.tsx` renders published. |
| F10 | Draft/private portfolio NOT viewable publicly | ✅ Auto | `PublicPortfolioView.test.tsx` draft + private → "not available". |
| F11 | Publishing requires an explicit confirm | ✅ Auto | `publishFlow.test.tsx` no publish without confirm. |
| F12 | Unpublish disables the public link | ✅ Auto | `publishFlow.test.tsx` unpublish → private; public view stops rendering. |
| F13 | Public view has NO editor chrome; semantic `<main>` | ✅ Manual | `PublicPortfolioView.tsx` renders only `PortfolioRenderer` inside `<main>`; templates emit `<section>/<h1>/<h2>`. |
| F14 | Share/SEO title + description + robots from `seoConfig` | ✅ Auto | `PublicPortfolioView.test.tsx` document title; `useDocumentHead.ts`. |

## Responsive

| # | Check | Result | Evidence / notes |
|---|-------|--------|------------------|
| R1 | No horizontal overflow at 320px / 375px / 768px / 1024px+ | ✅ Manual | Editor collapses 3-pane → single column + tabs < 60rem; publish dialog facts grid collapses < 34rem; forms `.row` collapses < 40rem; long URLs use `word-break`. |
| R2 | Editor never forces 3 columns on narrow screens | ✅ Manual | `PortfolioEditor.module.css` grid → one column with Editor/Preview tabs. |
| R3 | Zoom to 200% keeps content readable, no clipping | ✅ Manual | Layout is rem/flex/grid based with wrapping; no fixed-px widths that would clip. |
| R4 | Public view + CV print layout are single-column and fluid | ✅ Manual | Renderer templates are fluid; print sheet `max-width` removed under `@media print`. |

## Accessibility

| # | Check | Result | Evidence / notes |
|---|-------|--------|------------------|
| A1 | Keyboard-only operable (nav, forms, dialogs, reorder) | ✅ Manual/Auto | Reorder keyboard test; buttons/links/inputs are native focusable elements. |
| A2 | Visible focus ring everywhere | ✅ Manual | Global `:focus-visible` outline in `globals.css`; upload button `:focus-within`. |
| A3 | Modal focus trap + Escape + restore focus | ✅ Manual | `Dialog.tsx` uses `useFocusTrap`, closes on Escape, restores focus. |
| A4 | Form errors actionable + announced | ✅ Manual | `Input`/`Textarea`/`Select` wire `aria-describedby` + `role="alert"`; image + validation errors are specific and actionable. |
| A5 | Status not conveyed by color alone | ✅ Manual | Status chips show a text label + dot; print URLs printed as text. |
| A6 | Reduced motion honored | ✅ Manual | `@media (prefers-reduced-motion: reduce)` in `globals.css`. |
| A7 | Semantic landmarks on public view | ✅ Manual | `<main id="public-main">`, section headings; skip link in shell. |
| A8 | Images have alt text | ✅ Manual | `ProfileHeader` always sets `alt` from the owner's name. |

## Resilience / states (Section 15)

| # | Check | Result | Evidence / notes |
|---|-------|--------|------------------|
| S1 | Empty state (no portfolios; empty portfolio) | ✅ Auto | Dashboard empty-state copy test; renderer honest "belum ada isi" note. |
| S2 | Loading state | ✅ Manual | Dashboard skeletons; editor "Memuat editor…"; public/CV "Memuat…". |
| S3 | Error state (save failure) is honest + retryable | ✅ Manual | `ErrorState` in editor error bar with retry; answers what/data-safe/retry. |
| S4 | Not-found (bad id/slug) handled | ✅ Auto | Editor not-found test; public view "not available" tests. |
| S5 | Offline / failed save does not lose local data | ✅ Manual | Local-first: data is already local; save failure keeps the in-memory draft and surfaces a retry. `beforeunload` guards tab close while dirty. |
| S6 | Unsaved-changes guard (Simpan/Buang/Batal) | ✅ Auto | `PortfolioEditor.test.tsx` unsaved-changes dialog. |

---

# Anti-AI-Slop Delivery Gate (Section 17)

Each item is PASS/FAIL with brief evidence. All items are PASS; nothing was left
FAIL.

| # | Gate item | Result | Evidence |
|---|-----------|--------|----------|
| 1 | No fabricated statistics, testimonials, badges, or claims | ✅ PASS | No fake metrics anywhere; testimonials are user-entered only (`Testimonial` requires `author`); landing/dashboard have no invented stats. |
| 2 | No mock/placeholder content shown after real data is entered | ✅ PASS | Renderer skips empty sections and shows an honest empty note; form placeholders are prefixed "Contoh:" and never persisted. |
| 3 | Private by default; nothing public without explicit action | ✅ PASS | New portfolios are `draft`; publish requires confirm (`publishFlow.test.tsx`). |
| 4 | Honest local-first model (no fake backend / hosting claim) | ✅ PASS | README limitations; publish dialog + public banner state links are local-to-this-browser; no server calls in code. |
| 5 | All rendered user content sanitized/escaped | ✅ PASS | React-escaped children; `safeUrl`/`safeImageUrl`; no `dangerouslySetInnerHTML`, no `eval`/`new Function` (grep-clean). |
| 6 | Image uploads validated (MIME + ext + size + magic bytes) | ✅ PASS | `imageValidation.ts` + `imageValidation.test.ts`. |
| 7 | No secrets/API keys in source or bundle | ✅ PASS | No `.env`, no keys; `vercel.json` env vars none; bundle grep clean (RELEASE_CHECKLIST). |
| 8 | Keyboard navigation + visible focus pass | ✅ PASS | A1/A2/A3 above. |
| 9 | Reduced motion honored | ✅ PASS | A6 above. |
| 10 | No horizontal overflow on mobile | ✅ PASS | R1/R2 above. |
| 11 | Form errors are actionable | ✅ PASS | A4 above; image/validation messages name the problem and the fix. |
| 12 | Brand palette used with restraint (coral sparingly) | ✅ PASS | Tokens: coral reserved for status/CTA; navy/off-white carry the UI. |
| 13 | Required docs present and honest | ✅ PASS | DECISIONS, PRODUCT_BRIEF, ASSUMPTIONS, DESIGN, diagrams, QA_MATRIX, SECURITY_REVIEW, RELEASE_CHECKLIST, README. |
| 14 | Build is green; tests pass | ✅ PASS | `npm run typecheck && lint && test (94) && build` all pass. |
