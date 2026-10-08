# Product Brief — MyStreet.id

_(Spec Section 2.)_

## Name

**MyStreet.id** — a platform for creating, editing, previewing, and exporting a
personal CV portfolio website.

## Positioning

A modern, minimalist, calm, and tidy portfolio builder for professionals. It is
result-oriented and deliberately **not** a generic AI-SaaS template: no fake
statistics, testimonials, logos, badges, or hyperbolic claims. The experience
should feel like a quiet, well-made tool rather than a marketing funnel.

## Target users

- Professionals, freelancers, students, and job seekers who need a clean,
  credible personal portfolio page.
- People who value privacy and control: they want to draft and preview locally
  before deciding to export or share anything.
- Users who are turned off by cluttered, over-animated, template-y builders.

## Problems it solves

- Existing builders are noisy, pushy, and full of filler that users must delete.
- Getting from "blank page" to "presentable portfolio" is slow and fiddly.
- Many tools require accounts and upload personal data before any value is
  delivered. MyStreet.id works locally and privately first.
- Exporting a clean, portable result (print / PDF) is often an afterthought.

## Product principles

1. **Honest.** No fabricated data, metrics, or social proof. Copy is concrete.
2. **Private by default.** Nothing leaves the browser unless the user exports it.
3. **Calm and legible.** Restrained color, generous spacing, strong typography.
4. **Keyboard- and screen-reader-friendly.** Accessibility is a requirement.
5. **Respectful of the machine and the user.** Reduced motion is honored; the
   interface is quiet, not animated for its own sake.
6. **Result-oriented.** Every screen moves the user toward a finished, shareable
   portfolio.

## Scope boundary (local-first)

Publishing and shareable links are **local-only** in this implementation (see
`DECISIONS.md` and `ASSUMPTIONS.md`). The product is genuinely useful as a
private, local portfolio builder and exporter; it does not pretend to host live
public pages on a server.
