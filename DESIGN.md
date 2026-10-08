# Design System — MyStreet.id

_(Spec Section 6.3 — the full visual fingerprint.)_

## Visual character

Modern, minimalist, calm, tidy, and result-oriented. The interface should read
as a quiet, well-made professional tool — closer to a thoughtful document editor
than a marketing landing page. Structure and typography carry the design;
decoration is minimal and always justified.

## Target audience

Professionals, freelancers, students, and job seekers building a credible
personal portfolio. They value clarity, speed, privacy, and control over flashy
visuals.

## Product promise

Get from a blank page to a presentable, exportable CV portfolio quickly, calmly,
and privately — without filler, fake content, or lock-in.

## Layout principle

- Content-first, single clear column of focus with generous whitespace.
- A persistent, low-chrome header (brand + primary navigation) and a quiet
  footer stating the local-first promise.
- Reading width is capped (~68ch for prose) for legibility.
- Alignment and spacing do the organizing; boxes and borders are thin and used
  only where they aid scanning.

## Color palette (brand)

| Token               | Hex       | Use                                              |
| ------------------- | --------- | ------------------------------------------------ |
| `--color-primary`   | `#132A44` | Deep navy — headings, mark, structure            |
| `--color-accent`    | `#F06A4F` | Muted coral — **status + important CTA only**    |
| `--color-accent-hover` | `#D9553C` | Darker coral for hover/active accent          |
| `--color-canvas`    | `#F7F3ED` | Warm off-white page background                   |
| `--color-surface`   | `#FFFFFF` | Cards / raised surfaces                          |
| `--color-text`      | `#1D2733` | Charcoal body text (never pure black)            |
| `--color-text-muted`| `#5A6572` | Secondary text                                   |
| `--color-border`    | `#E4DDD1` | Thin, subtle hairlines                           |
| `--color-danger`    | `#C0392B` | Errors                                           |
| `--color-warning`   | `#C67A12` | Warnings                                         |
| `--color-success`   | `#2F7A4D` | Success / saved                                  |

Coral is deliberately **rationed**: it marks the single most important action or
a status change, never used as a general fill. Navy provides nearly all of the
"brand" presence.

## Typography scale

System sans-serif stack (optionally Inter): `Inter, 'Segoe UI', system-ui, …`.

| Token            | Size            | Use                     |
| ---------------- | --------------- | ----------------------- |
| `--text-display` | 2.25rem (36px)  | Page hero headings (h1) |
| `--text-heading` | 1.375rem (22px) | Section headings (h2)   |
| `--text-body`    | 1rem (16px)     | Body copy               |
| `--text-label`   | 0.8125rem (13px)| Labels, nav, meta       |

Body line-height 1.6; headings 1.2; headings use a slight negative letter
spacing for a tidy, modern feel.

## Spacing scale

`--space-xs` 4px · `--space-sm` 8px · `--space-md` 16px · `--space-lg` 24px ·
`--space-xl` 40px. A small, predictable set keeps rhythm consistent.

## Radius scale

`--radius-sm` 4px · `--radius-md` 8px · `--radius-lg` 14px. Small-to-medium
radii. **Not everything is a pill** — pill shapes are avoided as a default.

## Border & elevation rules

- Borders are thin (1px) and low-contrast (`--color-border`); they clarify, they
  do not decorate.
- Elevation is restrained: at most a soft `--shadow-sm` / `--shadow-md` for
  genuinely raised surfaces. No stacked, heavy, or glow shadows.
- Gradients, blur, and shadow are limited and purposeful, never ambient effects.

## Styling approach

Components are styled with **CSS Modules** (`ComponentName.module.css`), one
file per component (a few share a module where they are genuinely the same
control family, e.g. `Field.module.css` for Input/Textarea/Select and
`StateBlock.module.css` for EmptyState/ErrorState). Every rule reads from the
centralized tokens in `src/styles/tokens.css` — components never hard-code
palette, spacing, or radius values. CSS Modules were chosen because they scope
class names locally, keep each component paired with its styles, add no runtime
cost, and work out of the box with Vite. No CSS-in-JS or utility framework is
used.

## Component library

The primitives live in `src/components` and are re-exported from
`src/components/index.ts`:

- **Button / IconButton** — `IconButton` requires an `aria-label` at the type
  level, so it cannot ship unlabelled. Buttons expose primary/secondary/ghost/
  danger variants, sizes, and a loading state that disables interaction.
- **Input / Textarea / Select** — labelled fields with hint, error (sets
  `aria-invalid` + `aria-describedby`), disabled, and read-only states.
- **Checkbox / Toggle** — native inputs with drawn visuals, keyboard operable,
  visible focus ring. `Toggle` is one of the few deliberately pill-shaped parts.
- **Tabs** — WAI-ARIA tabs with arrow/Home/End keyboard navigation.
- **Dialog** — modal with focus trap, Escape-to-close, focus restoration,
  `role="dialog"` + `aria-modal`, and scroll lock.
- **Toast** — `ToastProvider` + `useToast()` hook; auto-dismiss, polite live
  region, error toasts use `role="alert"`.
- **Dropdown** — keyboard-navigable menu button (arrows, Home/End, Escape,
  outside-click dismiss).
- **SectionCard / EmptyState / ErrorState / Skeleton** — layout and status
  surfaces. `ErrorState` answers what failed, whether data is safe, whether it
  is retryable, and the recovery action. `EmptyState` always offers a next
  action and never fabricates data.
- **Tooltip** — used only where a short supplementary hint genuinely helps.
- **DragHandle** — ships a documented keyboard alternative (`onKeyboardMove`
  via ArrowUp/ArrowDown) so reordering never depends on a mouse; the editor
  wires it later.
- **PreviewFrame** — browser-chrome frame for live portfolio previews; the
  address shown is illustrative only (local-first, not a hosted URL).

## Component states

- **Default / hover / active / focus / disabled** are all defined.
- **Focus is always visible**: a 2px coral outline with offset via
  `:focus-visible` (keyboard focus is never suppressed).
- Interactive elements change state through small, legible shifts (color,
  border), not large motion.

## Responsive behavior

- Mobile-first; the single-column content model scales naturally.
- Header navigation stays compact; main content max-width keeps line length
  comfortable on wide screens.
- Nothing depends on hover alone; touch targets are adequately sized.

## Accessibility rules

- Visible keyboard focus everywhere (`:focus-visible` ring).
- `prefers-reduced-motion: reduce` disables animation/transition and smooth
  scroll.
- Semantic landmarks (`header`, `nav`, `main`, `footer`) and real headings.
- Color is never the sole carrier of meaning; contrast meets WCAG AA for text.
- The brand logo exposes an accessible `<title>` and supports a decorative mode.

## Rationale for each decorative element

- **The logo mark** (navy rounded square, coral diagonal stripe, cream road
  bars) is the only ornamental graphic, and it carries brand meaning (a
  "street"), so it earns its place.
- **The single coral accent** communicates priority and status; its scarcity is
  what makes it meaningful.
- **Thin borders / soft shadow** exist only to separate real surfaces.
- Everything else is type, space, and alignment.

## Anti-slop — patterns deliberately NOT used (Spec Section 6.2)

- ❌ No fake statistics, metrics, counters, or "trusted by N users".
- ❌ No fake testimonials, quotes, or avatars.
- ❌ No fake company/client logos or logo walls.
- ❌ No fake badges, awards, ratings, or trust seals.
- ❌ No hyperbolic or vague marketing claims; copy is concrete and specific.
- ❌ No unexplained AI symbolism — no sparkles, robots, brains, "magic", or neon.
- ❌ No heavy gradients, glassmorphism blur, or ambient glow backgrounds.
- ❌ Not every component is a pill; radii stay small-to-medium.
- ❌ No motion-for-motion's-sake; reduced motion is honored.
- ❌ No dark-patterns, forced sign-up, or data collection — private by default.
- ❌ No invented data: the app never renders placeholder content as if real.
