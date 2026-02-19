# EAA Accessibility Audit (Technical / Structural)

## Scope and date
- Date: February 19, 2026
- Standard reference: WCAG 2.1 AA (primary), with practical EN 301 549 relevance notes for web content structure.
- Audit type: code-level technical accessibility review (not legal advice, not certification).
- Audited routes/components:
  - Home (`/`)
  - Services (`/services`)
  - Blueprint (no standalone `/blueprint` route detected; audited as section anchor `/#blueprint` in Home)
  - Contact (`/contact`)
  - Privacy (`/privacy`)
  - Accessibility (`/accessibility`)
  - Product pages:
    - `/compliance-ready-landing`
    - `/eaa-structural-hardening`
    - `/ai-feature-integration`
  - Shared components/layout:
    - `src/layouts/BaseLayout.astro`
    - `src/components/Navbar.astro`
    - `src/components/Footer.astro`
    - CTA blocks in Hero/Entry Offer/Fast Launch/product pages
    - FAQ `details/summary` blocks

## Audit method
- Primary method: static code review (Astro templates + shared CSS).
- Verification checks performed in code:
  - headings and document structure
  - landmark usage (`main`, `nav`, `footer`)
  - skip-link behavior and target consistency
  - keyboard/focus visibility patterns
  - interactive name/label quality
  - FAQ semantics (`details/summary`)
  - obvious contrast-risk hints from class usage
- Build verification: `npm run build` completed successfully after safe fixes.
- No extra tools/dependencies added.

## Prioritized issues list

### 1) Generic “Learn more” links lacked explicit accessible context
- Severity: Medium
- Affected: Home Fast Launch cards, Services card grid
- WCAG reference: 2.4.4 (Link Purpose in Context), 4.1.2 (Name, Role, Value)
- Finding: Repeated “Learn more” links were visually acceptable in local context, but weak for assistive navigation lists and ambiguous when read out-of-context.
- Fix recommendation: Keep visible text if desired, but add contextual accessible name (service name).
- Status: Fixed (added `aria-label` with service-specific context).

### 2) Footer links had no explicit focus-visible styling
- Severity: High
- Affected: `src/components/Footer.astro`
- WCAG reference: 2.4.7 (Focus Visible)
- Finding: Footer links relied on default browser focus, inconsistent with stronger focus treatment elsewhere.
- Fix recommendation: Add explicit `focus-visible` ring/outline classes consistent with site pattern.
- Status: Fixed.

### 3) FAQ summary elements lacked explicit focus-visible styles
- Severity: High
- Affected: `/compliance-ready-landing`, `/ai-feature-integration`, `/eaa-structural-hardening`
- WCAG reference: 2.4.7 (Focus Visible), 2.1.1 (Keyboard)
- Finding: Native keyboard behavior existed, but visual focus on `summary` was not consistently explicit.
- Fix recommendation: Add `focus-visible` styles directly on `summary`.
- Status: Fixed.

### 4) Some CTA links used `aria-label` values that diverged from visible label phrasing
- Severity: Medium
- Affected: Hero/Entry Offer/Contact/product CTA links
- WCAG reference: 2.5.3 (Label in Name), 4.1.2 (Name, Role, Value)
- Finding: Several CTA links had visible text and separate `aria-label` phrasing, increasing mismatch risk for speech/assistive workflows.
- Fix recommendation: Prefer visible text as accessible name unless additional context is required.
- Status: Fixed (removed redundant CTA `aria-label`s where visible label was sufficient).

### 5) Low-contrast risk for some microcopy (`text-xs`, `text-slate-500/600`) on light backgrounds
- Severity: Medium
- Affected: CTA helper lines, promo helper copy, footer microcopy (multiple pages/components)
- WCAG reference: 1.4.3 (Contrast Minimum), 1.4.11 (Non-text Contrast, where applicable)
- Finding: Likely acceptable in many cases, but some small-text combinations may be borderline depending on final rendered colors and display conditions.
- Fix recommendation: Validate contrast values manually for smallest text styles and consider slightly stronger contrast token for critical helper text.
- Status: Not changed (needs design decision/visual QA).

### 6) No standalone `/blueprint` page (anchor-only)
- Severity: Low
- Affected: IA/URL consistency (not a direct WCAG failure)
- WCAG reference: N/A (informational)
- Finding: “Blueprint” is an anchor section (`/#blueprint`) and not a page route.
- Fix recommendation: Keep as-is if intentional; otherwise create standalone route for consistency.
- Status: Informational only.

## Quick wins (<30 min)
- Add explicit `focus-visible` ring styles to all footer links.
- Add contextual accessible names for repeated “Learn more” links.
- Add `focus-visible` styles to all FAQ `summary` elements.
- Remove redundant CTA `aria-label`s where visible text already provides a clear accessible name.
- Confirm one `<h1>` per page (already satisfied).

## Needs design decision
- Small helper/microcopy contrast policy:
  - define minimum token usage for `text-xs` helper lines on light backgrounds
  - decide whether helper copy should use stronger color token for readability on low-contrast displays
- Blueprint information architecture decision:
  - keep as anchor-only section vs add standalone route

## Manual test checklist (runtime)
Run these checks in browser before release:
1. Keyboard-only navigation:
- Tab from page start: skip link appears immediately.
- Activate skip link: focus lands on `#main-content`.
- Continue through nav, hero CTAs, cards, FAQ summaries, footer links.

2. Focus visibility:
- Verify clear visible focus on all links/buttons in header, content, FAQ summaries, and footer.

3. FAQ interaction:
- Open/close every `details` with keyboard (`Enter`/`Space`) on all three product pages.

4. Link purpose and announcements:
- In screen reader links list, confirm “Learn more” links announce specific service context.

5. Responsive checks:
- At mobile widths, verify no clipped focus rings and no hidden skip link/focus artifacts.

6. Contrast spot checks:
- Validate small helper text blocks and footer microcopy against WCAG AA contrast requirements.

## Fixes applied
Applied safe, non-layout structural fixes only.

- `src/components/Footer.astro`
  - Added explicit focus-visible styles to email + legal links.

- `src/components/FastLaunchEngineering.astro`
  - Added contextual `aria-label` on all “Learn more” links.
  - Removed redundant `aria-label` from primary CTA button (visible name used).

- `src/components/ServiceCards.astro`
  - Added contextual dynamic `aria-label` for each “Learn more” link (`service.title`).

- `src/components/Hero.astro`
  - Removed redundant CTA `aria-label`s to keep visible label as accessible name.

- `src/components/EntryOffer.astro`
  - Removed redundant CTA `aria-label`s.

- `src/pages/contact.astro`
  - Removed redundant CTA `aria-label`s.

- `src/pages/compliance-ready-landing.astro`
  - Added `focus-visible` styles to all FAQ `summary` elements.
  - Removed redundant CTA `aria-label`s.

- `src/pages/ai-feature-integration.astro`
  - Added `focus-visible` styles to all FAQ `summary` elements.
  - Removed redundant CTA `aria-label`s.

- `src/pages/eaa-structural-hardening.astro`
  - Added `focus-visible` styles to all FAQ `summary` elements.
  - Removed redundant CTA `aria-label`s.

## Notes
- No JS frameworks, heavy components, or new dependencies were introduced.
- No visual layout redesign was performed.
- This audit documents technical/structural accessibility alignment only, not legal certification.
