# Security Review

MyStreet.id is a local-first single-page app with no server or database. This
document records the security-relevant decisions. It is a living document and
will grow as later sessions add rendering, publishing, and export.

## Validation (data layer — FEAT-003)

- **Client-side validation only.** All validation runs in the browser using the
  zod schemas in `src/models/schemas.ts`. Data read from `localStorage` is parsed
  with `portfolioSchema.safeParse` before it is trusted; records that fail
  validation (corrupt or tampered payloads) are dropped rather than crashing the
  app.
- **Server-side validation is N/A.** There is no backend, so there is no
  server round-trip to validate against. If a server-backed `PortfolioRepository`
  is added later, server-side validation becomes required and must not trust the
  client's checks.

## Ownership & privacy (local-first — FEAT-003)

- Every `Portfolio` carries an `ownerId`. The `LocalStoragePortfolioRepository`
  is scoped to a single owner (`LOCAL_OWNER_ID` by default).
- `list`/`get` only return records whose `ownerId` matches the repository's
  owner, so one owner cannot read another owner's records. Writes preserve other
  owners' records untouched. This honestly enforces the Section 10.1 rule
  ("user tidak boleh baca private milik user lain") at the local level, even
  though there is a single real user in this browser.
- **Private by default.** New portfolios are created with status `draft` and are
  never implicitly published. Duplicates reset to `draft`.

## Soft delete / retention (FEAT-003)

- `delete` is a soft delete: it sets `deletedAt` and hides the record from normal
  listings while retaining it. `restore` recovers it; `purge` permanently removes
  it. Destructive UI actions require explicit confirmation (a Dialog) before
  calling `delete`.

## Output sanitization / escaping (render time — FEAT-006)

Spec Section 11.1 requires that all user content be sanitized/escaped before it
is rendered, with no raw-HTML injection and no `eval` / `new Function`.

- **All user text is rendered as React children.** The single shared renderer
  (`src/features/portfolio-preview/PortfolioRenderer.tsx` and
  `SectionBlocks.tsx`) outputs user values as JSX children, which React escapes
  by default. There is **no** `dangerouslySetInnerHTML` with user input anywhere
  in the codebase, and **no** `eval` / `new Function`. A `<script>…</script>` or
  `<img onerror=…>` typed into any field is shown as literal text, never parsed
  as DOM. This is covered by a behavioral test
  (`PublicPortfolioView.test.tsx` → "escapes user content containing
  HTML/script").
- **No rich-text field exists**, so a full HTML sanitizer (DOMPurify) is not
  required today. The data model has only plain-text fields. If a rich-text
  field is ever added, it MUST be routed through DOMPurify in
  `src/lib/sanitize.ts` rather than rendering raw HTML — this is the documented
  extension point.
- **URL attributes are the one surface React does not neutralize.** A value like
  `javascript:alert(1)` is valid text but executes if placed in an `href`.
  `src/lib/sanitize.ts` provides `safeUrl` (links) and `safeImageUrl` (images):
  they allow only `http(s)` / `mailto` / `tel` / relative links (and a
  constrained set of base64 image data URLs for images), and reject
  `javascript:`, `vbscript:`, `file:`, and non-image `data:` URLs. Every
  user-supplied `href`/`src` in the renderer (projects, repository, credential,
  social links, avatar) passes through these. An unsafe social link is rendered
  as plain text, not a clickable link. The contact **email** is no exception:
  it is built via `safeMailto`, which validates the address shape (single
  address, no spaces, dotted domain — rejecting `?`-prefixed mail headers and
  CR/LF injection), percent-encodes it, and routes the result through `safeUrl`
  so the "all user hrefs go through the allow-list" invariant holds uniformly.
  A malformed/unsafe email renders as plain text. Covered by `sanitize.test.ts`
  (incl. `safeMailto`) and `PublicPortfolioView.test.tsx` → "neutralizes a
  javascript: URL".
- External links carry `rel="noreferrer noopener"` and `target="_blank"`.

## Input validation (client — FEAT-006)

- Field-level validation uses the zod schemas (`src/models/schemas.ts`) and the
  editor's `validation.ts`; errors are surfaced inline, associated with their
  input via `aria-describedby`, and announced via `role="alert"`.
- Every record read from `localStorage` is re-validated with
  `portfolioSchema.safeParse`; invalid records are dropped, so a tampered
  payload cannot drive the renderer with an unexpected shape.

## Image / asset handling (FEAT-006)

- Local-first: there is no upload server. A chosen image is validated in the
  browser by `src/lib/imageValidation.ts`:
  1. **MIME type** against an allow-list (png/jpeg/gif/webp/avif),
  2. **extension** against an allow-list,
  3. **size** ceiling (2 MB),
  4. **magic bytes** (`verifyImageSignature`) on the first 16 bytes — the
     strongest check, since MIME and extension are both user-controllable. A
     renamed executable with an `image/png` MIME is rejected.
- Accepted images are stored as base64 data URLs in local data. At render time
  they still pass through `safeImageUrl`, and the renderer always supplies
  `alt` text derived from the owner's name, so no image ships without a text
  alternative. Covered by `imageValidation.test.ts`.
- **Asset access via a public link:** images are part of the local data; anyone
  opening the published page *in this browser* sees them. There is no separate
  public object store, and because links are local-only, images are not exposed
  on a server. This is stated plainly in the publish dialog (Privacy UX).

## Authorization-equivalent access rules (local-first — FEAT-006)

- There is no server to enforce authorization, so the rule is enforced in the
  renderer. `isPubliclyViewable` (`src/features/publishing/publishModel.ts`) is
  the single definition: a portfolio is shown through `/p/:slug` **only** when
  `status === 'published'` and it is not soft-deleted. A draft/private portfolio
  — even with a known slug — renders a "not available" page, never its content.
  Covered by `PublicPortfolioView.test.tsx` (draft, private, and
  unpublished-returns-to-private cases).
- **Nothing is public by default.** New portfolios are `draft`; publishing
  requires the explicit confirm button in `PublishDialog`
  (`publishFlow.test.tsx` asserts no publish without confirmation). Unpublishing
  returns the portfolio to `private` and clears `publishedAt`.
- **Single write path for status.** Publication status (`status` /
  `publishedAt`) is written **only** by the dedicated editor handlers
  (`handleStatusChange` / `handlePublish` / `handleUnpublish`, via the
  `publishModel` patches). The draft autosave (`useEditorDraft.persist`) writes
  a disjoint set of fields (`title` / `sections` / `templateId` / `themeConfig`)
  and never touches status, so the two write paths cannot clobber each other.
  This invariant is documented inline at both call sites so a future change that
  moves `status` into the draft must consolidate them.

## Secrets & dependencies (FEAT-006)

- **No secrets or API keys** are in the source or the built bundle — there is no
  backend to authenticate against. No `.env` is read; `vercel.json` declares no
  environment variables. Verified by grepping the production `dist/` bundle for
  common secret patterns (see `docs/RELEASE_CHECKLIST.md`).
- **No logging of full CV content.** The app does not `console.log` portfolio
  content; error paths log short, generic messages only.
- **Dependencies** are minimal and well-known: React, react-router-dom, zod
  (runtime); Vite, Vitest, Testing Library, ESLint, TypeScript (dev). No HTML
  sanitizer dependency is pulled in because there is no raw-HTML rendering path.

## SEO / indexing (FEAT-006)

- The public view sets `<title>` and `<meta name="description">` from
  `seoConfig` (normalized to plain text via `toPlainText`), and a `robots`
  directive. A private/draft/not-found page, or one with an explicit
  `seoConfig.noindex`, emits `noindex,nofollow`. The `/cv/:id` print view is
  always `noindex`. See `src/lib/useDocumentHead.ts`.
- **Static default is `noindex` (fail-closed).** `index.html` ships a static
  `<meta name="robots" content="noindex">`. Because this is a no-SSR SPA, a
  crawler that fetches the raw HTML without running JS sees exactly that default
  — so the un-rendered app is non-indexable by default. The runtime manager
  (`useDocumentHead`) overrides it to `index,follow` only for a published public
  portfolio; every other route leaves/sets `noindex`.
- **Honest best-effort caveat.** The runtime `robots` directive is still
  best-effort on a static SPA: a crawler that does not execute JS only ever sees
  the static `noindex` default (never the per-page `index,follow`), and a
  non-compliant crawler ignores `robots` entirely. This is **low risk** here
  because the app is local-first: public URLs (`/p/:slug`) resolve only against
  the local browser's data and are not reachable — or crawlable — off-device.
  There is no server exposing any portfolio to the open web, so there is nothing
  for an external crawler to index in the first place.

## Honest local-first caveats

- "Private" means the data never leaves this browser, not that it is protected
  by a server account. Anyone with access to the same browser profile can read
  the local data. This is documented in the README and the publish
  dialog, and is an intentional constraint of a no-backend product.
