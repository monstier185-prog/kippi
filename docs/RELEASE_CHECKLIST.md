# Release Checklist

Final Release Gate (Section 18) for MyStreet.id plus the exact Vercel deploy
steps. Work top to bottom; everything must be checked before a release.

## Final Release Gate (Section 18)

- [x] `npm run typecheck` passes (no type errors).
- [x] `npm run lint` passes (0 errors, 0 warnings).
- [x] `npm run test` passes (94 tests across 18 files).
- [x] `npm run build` succeeds and emits `dist/index.html` + hashed assets.
- [x] App loads with no console errors (no runtime calls to a nonexistent
      backend; data loads from local storage).
- [x] No secrets / API keys in source or in the built bundle (see
      "Secret scan" below).
- [x] Private by default; publishing requires an explicit confirm; unpublish
      works (see `docs/QA_MATRIX.md` F10–F12).
- [x] All user content is sanitized/escaped at render time; no
      `dangerouslySetInnerHTML` with raw input; no `eval` / `new Function`
      (see `docs/SECURITY_REVIEW.md`).
- [x] Image uploads validated by MIME + extension + size + magic bytes.
- [x] Resilience states present: empty / loading / error / offline /
      unsaved-changes (QA_MATRIX S1–S6).
- [x] Accessibility: keyboard operable, visible focus, modal focus trap +
      Escape, actionable + announced form errors, reduced motion, status not by
      color alone (QA_MATRIX A1–A8).
- [x] No horizontal overflow at tested breakpoints or 200% zoom
      (QA_MATRIX R1–R4).
- [x] Anti-AI-Slop Delivery Gate (Section 17) all PASS
      (`docs/QA_MATRIX.md`).
- [x] Required docs present: DECISIONS, PRODUCT_BRIEF, ASSUMPTIONS, DESIGN,
      diagrams, QA_MATRIX, SECURITY_REVIEW, RELEASE_CHECKLIST, README.
- [x] `vercel.json` present with Vite framework, build command, output
      directory, and SPA rewrite.

## Secret scan (how to verify)

There is no backend, so there should be no secrets anywhere. To confirm against
the real bundle:

```bash
npm run build
# Expect NO matches below (grep exits non-zero / prints nothing):
grep -riE 'api[_-]?key|secret|password|bearer |BEGIN (RSA|EC|OPENSSH) PRIVATE' dist || echo "clean"
```

`vercel.json` declares **no** environment variables, so none are needed at
build or runtime.

## Deploy to Vercel (exact steps)

MyStreet.id is a static single-page app; Vercel serves `dist/` directly.

1. Push the repository to GitHub (or GitLab/Bitbucket).
2. In Vercel, **Add New → Project** and import the repository.
3. Confirm the build settings (these match `vercel.json`, so Vercel detects
   them automatically):
   - **Framework Preset:** `Vite`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install` (default)
   - **Environment Variables:** none
4. Click **Deploy**.
5. After the first deploy, verify:
   - The landing page loads at the production URL with no console errors.
   - A deep link such as `/dashboard` or `/editor/anything` loads the app
     (not a 404). This works because `vercel.json` rewrites `/(.*)` to
     `/index.html` for client-side routing.

### `vercel.json` (committed at the repo root)

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

## Post-deploy honesty check

Because the app is local-first, confirm the deployed copy does not imply a
backend:

- [x] Published links are described as local-to-this-browser, not hosted URLs
      (publish dialog + public page banner).
- [x] Sharing is done via Print / Save-as-PDF export, not by sending a `/p/:slug`
      URL to someone else's device.
