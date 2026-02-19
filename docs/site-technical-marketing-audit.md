# 0. Change Log

- Date: 2026-02-19
- Branch: `fix/audit-1-2-4`
- Scope: immediate fixes `#1` (blueprint route/sitemap coherence), `#2` (promo source unification), `#4` (security headers)

## Implemented changes
- [DONE #1] Added a real `/blueprint` route and kept sitemap URL valid.
  - Files: `src/pages/blueprint.astro`, `src/layouts/BaseLayout.astro`, `public/sitemap.xml`
  - Rationale: remove crawler mismatch where sitemap listed `/blueprint` but no route existed.
- [DONE #2] Unified promo rendering through a shared client-side offer sync script.
  - Files: `src/scripts/offer-sync.js`, `src/layouts/BaseLayout.astro`, `src/components/FastLaunchEngineering.astro`, `src/components/ServiceCards.astro`, `src/pages/compliance-ready-landing.astro`
  - Rationale: prevent stale promo drift across Home/Services/Landing and keep one API-driven state model.
- [DONE #4] Added baseline Cloudflare Pages response headers.
  - Files: `public/_headers`
  - Rationale: improve browser-side security posture without introducing CSP breakage for current inline scripts.

## Verification
- Build command:
  - `npm run build`
- Static checks:
  - `rg -n "<loc>https://copycodeai.online/blueprint</loc>" public/sitemap.xml`
  - `rg -n "data-offer-key=\"tallinn_landing_2026\"" src/components/FastLaunchEngineering.astro src/components/ServiceCards.astro src/pages/compliance-ready-landing.astro`
  - `rg -n "X-Frame-Options|X-Content-Type-Options|Referrer-Policy|Permissions-Policy|Strict-Transport-Security" public/_headers`
- Manual runtime checks (deployed/staging):
  - Open `/blueprint` and confirm redirect to `/#blueprint` (meta refresh + fallback link visible if blocked).
  - Compare promo status on `/`, `/services`, `/compliance-ready-landing` before and after offer expiry/slot depletion.
  - Run `curl -I https://<domain>/` and confirm headers from `public/_headers` are present.

## Remaining follow-ups (not in this pass)
- Race condition on slot decrement (`functions/api/admin/offer/tallinn-landing/decrement.js`) still uses read-modify-write without atomicity.
- Social metadata assets: add `og:image`, favicon/manifest.
- Quality gates: add lint/test/check scripts and CI execution.

# 1. Executive Summary

CopyCodeAI is positioned as a launch-first, compliance-aware engineering service for early-stage European startups, with delivery-focused offers (landing, automation, accessibility hardening) and clear legal boundaries (technical implementation, not legal advice). The target audience is founders and small product/engineering teams that need fast execution without creating GDPR/EAA-related structural debt. The core value proposition is fixed-scope, short delivery windows plus written technical handoff. Risk profile: technically lean and credible, but with moderate clarity risk from residual messaging inconsistencies (older SEO metadata, mixed email domains, and minor CTA/call-duration mismatches).

- Target audience: pre-seed / early-seed EU startups, especially teams shipping MVPs and first growth iterations.
- Core value proposition: fast execution + compliance-aware structure + low-friction technical assessment path.
- Complexity vs clarity: delivery architecture is simple; message architecture is mostly clear but not fully unified in metadata and contact details.

# 2. Technical Architecture Overview

## Stack and runtime model
- Framework: Astro `^5.2.0`
- Styling: Tailwind CSS `^3.4.17` via `@astrojs/tailwind`
- Build/deploy model: static output (`astro build` -> `dist`), Cloudflare Pages
- Server-side runtime extensions: Cloudflare Pages Functions for promo counter only (`/api/offer/tallinn-landing`, admin decrement endpoint)

## Rendering model
- Static HTML pages for all routes.
- No client framework hydration.
- JS surface is minimal and local:
  - `src/scripts/offer-sync.js`: shared promo fetch + state updates for all offer placeholders
  - `src/components/ServiceCards.astro`: inline script for reveal-on-scroll animation
- No third-party embed widgets.

## Accessibility baseline
- Semantic sectioning and heading structure across pages.
- Global skip link in `BaseLayout`.
- Global visible focus style in `src/styles/global.css`.
- `prefers-reduced-motion` support (smooth scroll disabled, transitions reduced).
- Native `details/summary` used for FAQ (keyboard friendly by default).

## Privacy and data surface summary
- Contact flow is `mailto:` + external Calendly link (no v1 form storage in repo).
- When users open the external Calendly booking page, Calendly privacy/cookie policies apply and Calendly may set its own cookies.
- Promo API stores offer state in Cloudflare KV (non-customer counter data).
- Admin promo decrement endpoint protected by bearer token (`ADMIN_TOKEN`).
- Privacy/Accessibility pages now present and linked in footer.

## Current dependency footprint
Runtime dependencies are intentionally small:
- `astro`
- `@astrojs/tailwind`
- `tailwindcss`
Dev dependencies:
- `autoprefixer`, `postcss`

## Identified technical strengths
- Very low runtime complexity and low JS footprint.
- Static-first architecture with predictable deployment behavior.
- Clear separation between marketing pages and minimal backend functions.
- Good baseline accessibility primitives.
- Promo logic gracefully degrades with fallback copy.

## Potential technical fragilities
- Inconsistent contact email domains in code (`hello@copycodeai.online` still present in Hero/EntryOffer/Contact vs `.online` elsewhere).
- Calendly URL path (`/30min`) may conflict with copy that says 15-minute assessment.
- Keep sitemap routes aligned with real pages (`/blueprint` route now exists; keep parity on future IA changes).
- Inline scripts are simple, but no explicit error telemetry for fetch failures.

# 3. SEO Baseline Analysis

## Page-by-page baseline

| Page | Title tag | Meta description | H1 | Heading hierarchy | Canonical | OG meta | URL evaluation |
|---|---|---|---|---|---|---|---|
| `/` Home | `CopyCodeAI | AI Systems for Tallinn Startups` | Present, but legacy scale-first wording | Present in Hero (`Launch Right. Scale When Ready.`) | Logical (`h1` then section `h2`) | Set (`https://copycodeai.online/`) | OG title/desc + og:url present | Clean root URL; strong |
| `/#blueprint` (section) | Inherits Home metadata | Inherits Home metadata | No page-level H1 (section anchor) | Correct section hierarchy under Home | N/A | Inherits Home | Useful in-funnel anchor, but not indexable as standalone offer page |
| `/services` | `Services | CopyCodeAI` | Present and coherent | Present | Correct (`h1`, multiple `h2/h3`) | Set (`https://copycodeai.online/services`) | OG title/desc + og:url present | Clean |
| `/contact` | `Contact | CopyCodeAI` | Present | Present | Correct | Set (`https://copycodeai.online/contact`) | OG title/desc + og:url present | Clean |
| `/privacy` | `Privacy Policy | CopyCodeAI` | Present | Present | Structured numbered sections | Set (`https://copycodeai.online/privacy`) | OG title/desc + og:url present | Clean |
| `/accessibility` | `Accessibility Statement | CopyCodeAI` | Present | Present | Structured numbered sections | Set (`https://copycodeai.online/accessibility`) | OG title/desc + og:url present | Clean |
| `/compliance-ready-landing` | `Compliance-Ready Landing Page | CopyCodeAI` | Present and specific | Present | Strong hierarchy + FAQ | Set | OG title/desc + og:url | Strong keyword-aligned slug |
| `/ai-feature-integration` | `AI Feature Integration | CopyCodeAI` | Present and specific | Present | Strong hierarchy + FAQ | Set | OG title/desc + og:url | Strong keyword-aligned slug |
| `/eaa-structural-hardening` | `EAA Structural Hardening | CopyCodeAI` | Present and specific | Present | Strong hierarchy + FAQ | Set | OG title/desc + og:url | Strong keyword-aligned slug |

## Internal linking map
- Global nav: `/`, `/#blueprint` (from non-home as `/#blueprint`), `/services`, `/contact`.
- Footer: `/privacy`, `/accessibility`.
- Home fast-launch cards: links to all 3 product pages.
- Services cards: links to all 3 product pages.
- Product pages: conversion links to Calendly and mailto; no strong cross-links between product pages.

## URL structure evaluation
- Readable, descriptive slugs.
- Service-product pages are semantically aligned with offer names.
- No trailing-parameter complexity.

## Canonical handling
- Canonical configured on all key pages, including Home, Services, and Contact.

## Open Graph / social meta
- `og:type`, `og:title`, `og:description` set globally.
- `og:url` only set where `canonical` is provided.
- No `og:image` currently configured.

## Sitemap / robots
- `robots.txt` present in `public/robots.txt`.
- `sitemap.xml` present in `public/sitemap.xml`.
- Meta robots (`index, follow`) present in `BaseLayout`.

## Keyword positioning hypothesis (based on copy)
Primary intent clusters likely captured:
- compliance-ready landing page
- AI feature integration for startups
- EAA / WCAG structural hardening
- GDPR-aware implementation

Secondary intent potential:
- Tallinn startup engineering
- European startup compliance engineering
- fixed-scope technical assessment

## Core semantic cluster opportunities
- Expand internal semantic mesh around:
  - “technical compliance implementation”
  - “WCAG structural fixes”
  - “startup landing GDPR data flow”
- Strengthen relationships between Home offer blocks and dedicated product pages with contextual anchor links.

## Risk of keyword dilution
- Moderate: Home title/description still emphasize legacy “AI systems built to scale for Tallinn startups,” while core body now emphasizes launch-first EU delivery.
- Moderate: Multiple offer pages are clear, but top-level metadata is not fully aligned.

## Technical SEO risks
- Keep sitemap route inventory aligned with generated pages (avoid future mismatches like orphan `/blueprint`).
- No structured data/schema (not a blocker now, but limits rich-result signaling).

# 4. Funnel Architecture Mapping

## Current funnel paths
### Entry points
- Home (`/`) is the main conversion hub.
- Secondary entry via product pages and services page.
- Legal pages are trust-supporting, not primary conversion entries.

### Decision forks
1. Home Hero:
- CTA A: Start assessment (Calendly)
- CTA B: Send brief (mailto)
2. Entry Offer (`#blueprint`):
- CTA A: Start assessment
- CTA B: Request brief review
3. Fast Launch cards:
- Branch by use case to 3 product pages
4. Product pages:
- Hero CTA + final CTA blocks repeat same two conversion actions

### CTA mapping
- Primary conversion object across site: Calendly link.
- Secondary conversion object: email brief via `mailto` templates.

## Primary conversion path
`/` -> Hero or Fast Launch selection -> product page (optional) -> “Start with a 15-min Technical Assessment” -> Calendly.

## Secondary path
`/` or `/contact` -> “Send a Brief” / “Request a brief review” -> mailto submission.

## Leakage risks
- No explicit post-click continuity between product pages (user can dead-end after reading one page).
- Services page has many details but weaker direct bottom CTA than product pages.
- Contact email domain inconsistency (`.eu` vs `.online`) can reduce trust at point of action.

## CTA consistency check
- Mostly consistent wording around “Start with a 15-min Technical Assessment.”
- Exception: Contact page button label is “Book a 15-Minute Call.”
- Potential mismatch: Calendly URL suggests 30-minute event while copy promises 15-minute assessment.

## Psychological friction review
- Positive:
  - Fixed-scope language reduces ambiguity.
  - “No sales pressure” and written follow-up reduce resistance.
  - “Not legal advice” keeps claims credible.
- Friction:
  - Inconsistent email domains create perceived operational inconsistency.
  - “Tallinn-only” promo can unintentionally narrow perceived audience if over-read outside offer context.

# 5. Copy & Positioning Audit

## Clarity of positioning
- Strong current narrative: launch first, automate when needed, harden before scale.
- Practical and non-hype framing is consistent with technical buyer expectations.

## Consistency across pages
- Strong alignment on product pages and fast-launch section.
- Partial misalignment remains in top-level metadata (Home title/description) and some contact mailto addresses.

## Tone coherence
- Engineering-first, minimal, and explicit boundaries are well maintained.
- Legal boundary statements are repeated without sounding defensive.

## Enterprise vs tactical signal balance
- Improved toward tactical/fixed-scope.
- Some historical “systems to scale” traces remain in SEO metadata and default layout copy.

## Over/under-claiming risks
- Over-claiming: low (no certification claims, no legal claims).
- Under-claiming: moderate in credibility assets (no concrete operational proof, no lightweight case evidence beyond scenario patterns).

## Differentiation clarity
- Clear differentiators:
  - compliance-aware engineering (not consulting-only)
  - fixed scope + short windows
  - launch-first sequencing
- Could be sharper in Services page hero and metadata alignment.

## Strong copy blocks
- Home Fast Launch progression and card copy.
- Product page “What this is not” sections.
- Process copy (“If scope is unclear, we don’t start.”).

## Weak or generic phrasing
- Home title/description metadata still generic/legacy.
- Services page still contains some broad phrasing where tactical outcomes could be sharper.

## High-impact refinement candidates
- Align Home/Contact metadata with current launch-first positioning.
- Normalize all contact addresses to `.online`.
- Ensure stated call duration matches actual scheduling event.

# 6. Trust & Compliance Layer

## Privacy policy adequacy
- Privacy page is present, structured, and now includes controller identity, legal bases, retention logic, cookies/tracking note (including external Calendly cookie notice), and rights/escalation.
- Adequate as an engineering-site baseline; final legal review still advisable for jurisdiction-specific precision.

## Accessibility statement credibility
- Present and credible.
- Explicit self-assessment status and no false certification claim.
- Includes response channel and Estonian authority escalation path.

## Transparency signals
- Strong:
  - Repeated “Not legal advice” boundaries
  - Clear contact channels
  - Explicit no-form/no-storage v1 statement in contact copy
- Weak points:
  - Domain inconsistency in mailto links can undermine trust signal quality.

## Authority signals
- Technical architecture and process language provide authority.
- Dedicated product pages with scope boundaries improve perceived seriousness.

## Over-claiming risk
- Low. Claims are generally constrained and technically framed.

## Under-communicating strengths
- The site under-communicates technical delivery rigor (validation criteria, acceptance conditions, before/after evidence quality).

# 7. Performance & Scalability Snapshot

## Likely performance characteristics
- Very good baseline: static HTML + single small CSS asset (~16KB in current build output).
- No client framework hydration.
- Minimal runtime scripts.

## JS surface area
- Two inline scripts total in source:
  - Promo fetch/counter logic
  - Reveal animation via IntersectionObserver
- No heavy libraries, trackers, or embed bundles.

## Layout stability risk
- Low. Mostly static content blocks; limited dynamic DOM updates (promo box text only).
- No iframe embed shifts.

## Scalability constraints
- Content scalability is manual (page/component edits), no CMS.
- Offer counter backend is simple and suitable for low write frequency use case.
- No analytics pipeline means limited data for optimization loops.

## Future technical debt risks
- Drift risk between copy and metadata across many pages.
- Drift risk in repeated CTA labels/links due decentralized constants.
- Legal page freshness risk if not date-reviewed periodically.

# 8. Monitoring & KPI Framework

## Core conversion metrics
- `assessment_click_rate`: clicks on Calendly CTA / page sessions
- `brief_click_rate`: clicks on mailto CTA / page sessions
- `primary_vs_secondary_split`: Calendly clicks vs mailto clicks
- `product_page_to_cta_rate`: CTA clicks from each product page

## Micro-conversion signals
- `learn_more_clicks_by_card`: clicks from Home/Services cards to product pages
- `blueprint_anchor_engagement`: sessions reaching `#blueprint` section
- `faq_interaction_rate`: details open events on product pages (if later measured)

## SEO metrics to track
- Impressions/clicks for offer-specific queries by page.
- Average position by cluster:
  - compliance-ready landing
  - AI feature integration
  - EAA structural hardening
- CTR by page title/description variants.
- Indexation status and canonical coverage.

## Funnel performance indicators
- Home -> product page clickthrough.
- Product page -> CTA clickthrough.
- Contact page -> CTA clickthrough.
- Drop-off points by path depth.

## Trust indicators (qualitative)
- Frequency of inbound objections about compliance scope/legal boundaries.
- Frequency of confusion on call duration.
- Frequency of email delivery/domain trust issues.

## Red flags to watch
- Rising bounce on Home despite stable traffic.
- High product page traffic with low CTA engagement.
- Indexing anomalies from sitemap/route mismatches or metadata drift.
- Increased user confusion from mixed `.eu`/`.online` addresses.

# 9. Optimization Roadmap (Non-Disruptive)

## Quick wins (low risk)
- [DONE #1] Sitemap coherence with standalone blueprint route (`src/pages/blueprint.astro`, `public/sitemap.xml`, `src/layouts/BaseLayout.astro`).
- [DONE #2] Shared promo state sync across Home/Services/Compliance Landing (`src/scripts/offer-sync.js`, `src/layouts/BaseLayout.astro`, `src/components/FastLaunchEngineering.astro`, `src/components/ServiceCards.astro`, `src/pages/compliance-ready-landing.astro`).
- [DONE #4] Baseline security headers for Cloudflare Pages (`public/_headers`).
- Align all `mailto` links to `hello@copycodeai.online`.
- Align Home title/description with current launch-first positioning.
- Align Contact title/body metadata with current offer taxonomy.
- Verify call-duration copy against actual Calendly event length.
- [DONE] Add consistent canonical tags to Home, Services, Contact (`src/pages/index.astro`, `src/pages/services.astro`, `src/pages/contact.astro`).

## Medium improvements (copy-level)
- Tighten Services hero to mirror Home sequence explicitly (Launch -> Automate -> Harden).
- Add one concise cross-link section on each product page to the other two offers.
- Standardize CTA microcopy variants to avoid cognitive drift.

## Structural improvements (future phase)
- [DONE] Add `robots.txt` and `sitemap.xml` for crawl control and index hygiene (`public/robots.txt`, `public/sitemap.xml`).
- Add lightweight event tracking (privacy-safe) for CTA/funnel observability.
- Add shared constants for core links/text to reduce copy/link drift.

## What NOT to optimize yet
- Do not add complex JS frameworks or interaction-heavy components.
- Do not add broad feature sets (blog/CMS) before baseline funnel instrumentation exists.
- Do not introduce aggressive growth-style copy that conflicts with technical trust positioning.

# 10. Version Snapshot

## Current State Snapshot
- Positioning summary:
  - Launch-first engineering for early-stage European startups, with GDPR/EAA structural alignment and explicit non-legal scope.
- Funnel summary:
  - Home-centric funnel with repeated dual CTA model (Calendly primary, mailto secondary), supported by 3 product pages.
- CTA structure:
  - Consistent primary intent across site; minor label differences and duration mismatch risk.
- Compliance state:
  - Privacy and Accessibility statements are present, structured, and credible; technical/legal boundaries are explicit.
- Technical minimalism score (qualitative):
  - `8.5/10` (very lean static architecture, minimal JS, good baseline accessibility; points deducted for metadata/contact consistency and crawl-config gaps).

## X. AI Search Optimization Audit

### 1) Audit Overview

Purpose: evaluate how AI-assisted search systems and classical crawlers interpret CopyCodeAI pages, then identify visible, non-manipulative improvements that increase semantic clarity.

In this context, “AI search” means indexing and retrieval systems that use page structure, entities, and concise answerability to generate summaries/snippets (for example AI overviews, rich snippets, and assistant answers).

Primary signals these systems use on this site:
- clear H1/H2/H3 hierarchy
- stable entity repetition across pages (`GDPR`, `EAA/WCAG`, `European startups`, `fixed scope`, `technical assessment`)
- explicit concept definitions (what the service is, not only what it sells)
- internal link semantics (anchor text quality + contextual clarity)
- FAQ answer quality for snippet extraction

### 2) Semantic Structure Analysis

#### Page-level review

| Page | Heading structure | Entity consistency | Definition clarity | Link text semantics | AI search readout |
|---|---|---|---|---|---|
| Home (`/`) | Strong (`h1` in Hero + section `h2`) | Good on `GDPR`, `EAA`, `European startups`; weaker explicit “fixed scope” at top | Partial: launch-first is implied, not explicitly defined | `Learn more` appears in service cards; context exists but anchor text is generic | Strong core page; needs clearer definitional sentence near top |
| Blueprint section (`/#blueprint`) | Uses `h2/h3` correctly under Home | Good on architecture/data-flow/accessibility | Partial: “Blueprint Sprint” scope is clear, but term definition could be one line tighter | CTA text clear; section anchor is good | High conversion intent, lower standalone indexability (section-only) |
| Services (`/services`) | Good (`h1`, `h2`, `h3`) | Good distribution across three offers | Moderate: service names are clear, but “launch-first engineering” still mostly descriptive, not defined | Card links use `Learn more` (generic) | Good support page; can improve retrieval precision with more explicit definitions |
| Contact (`/contact`) | Good (`h1`) | Mentions GDPR/EAA in meta only; page body mostly functional | N/A (contact utility page) | CTA labels are clear | Works for intent routing; low semantic depth by design |
| Privacy (`/privacy`) | Strong numbered `h2` sections | Strong legal entities (GDPR, transfers, retention, rights) | Strong legal definitions | Email links clear | High trust/explainability value for AI summaries |
| Accessibility (`/accessibility`) | Strong numbered `h2` sections | Strong accessibility entities (`WCAG 2.1 AA`, self-assessment) | Strong statement clarity | Contact/escalation links clear | Credible compliance signal for AI/crawler quality assessment |
| Compliance-Ready Landing (`/compliance-ready-landing`) | Strong (`h1`, scoped `h2`, FAQ) | Very strong on `GDPR`, `EAA/WCAG`, boundaries | Good; “what this is not” improves disambiguation | CTA links clear; no generic internal “Learn more” issue here | High semantic quality and snippet potential |
| AI Feature Integration (`/ai-feature-integration`) | Strong (`h1`, scoped `h2`, FAQ) | Good on automation + data boundaries | Moderate-high; could define “structured automation workflow” in one line | CTA links clear | Good retrieval potential for operational automation intents |
| EAA Structural Hardening (`/eaa-structural-hardening`) | Strong (`h1`, scoped `h2`, FAQ) | Very strong on accessibility hardening and legal boundary | High; clear “not legal consulting/certification” boundary | CTA links clear | Strong fit for technical accessibility intent |

#### Key structural findings
- Heading hierarchy is generally robust across all core and legal pages.
- Entity set is coherent, but top-of-funnel definitions are still partially implicit.
- Generic internal anchor text (`Learn more`) appears on Home/Services cards; context helps, but semantic precision can improve.

#### Link text semantic richness guidance
- Current acceptable pattern: `Learn more` near explicit card title.
- Better pattern for AI/crawler understanding:
  - visible text: `Learn more about Compliance-Ready Landing Page`
  - or keep `Learn more` and add explicit `aria-label` with service name.

### 3) Copy Semantic Audit

#### Where semantic explicitness is still weak
- Home Hero: strong positioning, but missing one direct definition sentence for “launch-first engineering.”
- Services intro: clear but still broad; can be made more definition-first.
- AI Feature page: “structured automation” is strong language, but can be explicitly defined in one sentence.

#### Example rewrites (minimal)
- Home (definition-first addition):
  - “Launch-first engineering means shipping a conversion-ready foundation first, then adding automation and hardening in fixed-scope steps.”
- Services intro:
  - “Each offer is a fixed-scope technical intervention: launch foundation, workflow automation, or accessibility hardening.”
- AI Feature Integration hero support line:
  - “Structured automation workflows are production tasks with defined inputs, logic, and outputs, not demo chat features.”

#### Micro-FAQ additions for snippet quality (examples)
- “What is launch-first engineering?”
  - “A delivery model that prioritizes a compliant launch baseline before adding advanced automation.”
- “Is this legal compliance consulting?”
  - “No. Services cover technical implementation and structural readiness, not legal advice.”
- “What does fixed scope mean?”
  - “Deliverables, timeline, and boundaries are agreed before implementation starts.”
- “When should a startup add AI features?”
  - “When manual onboarding, support, or routing starts creating operational bottlenecks.”

### 4) Entity Mapping

| Entity / concept | Currently present on | Coverage gap / recommendation |
|---|---|---|
| European startups | Home, Services, product pages, footer | Good coverage; keep wording stable (`European startups`) |
| GDPR | Home support line, Services, Compliance page, Privacy, AI FAQ | Good coverage; add one concise definition on Home/Services |
| EAA / WCAG | Home support line, Services, Compliance page, EAA page, Accessibility | Strong coverage |
| Compliance-ready | Fast Launch cards, Services, Compliance page slug/title | Good; ensure Home metadata reflects this term |
| Launch-first engineering | Services/Home narrative | Explicit definition missing on-page (currently implied) |
| Fixed scope | Process sections, CTA microcopy, Services | Present but fragmented; add one canonical definition sentence |
| Structured automation | Fast Launch + AI page | Definition can be made more explicit in AI page intro |
| Technical assessment | CTAs across site | Strong operational consistency; verify duration consistency |
| Not legal advice / boundaries | Product pages, privacy, footer | Strong trust signal; continue consistent phrasing |
| Tallinn launch offer | Home + compliance page | Clear but geographically narrow; keep scoped to promo context |

### 5) AI Search KPI Suggestions

Track these as recurring signals (monthly):
- `SERP_snippet_coverage`: percentage of target queries where Google shows meaningful snippet text from your page copy.
- `Featured_snippet_presence`: count of tracked queries where your domain appears in featured snippet/AI overview source set.
- `PAA_alignment_rate`: share of “People also ask” questions already answered directly in on-page FAQ copy.
- `Heading_structure_score`: manual score (0-100) based on one H1, logical H2/H3 flow, and explicit section purpose.
- `Entity_cohesion_score`: manual score (0-100) for consistent use of core entities across Home, Services, and product pages.
- `Internal_link_semantic_graph_completeness`: percentage of core offer entities with at least one contextual internal link from Home + Services + peer product pages.
- `Snippet_answerability_rate`: percentage of FAQ answers that can be quoted in <=2 sentences without ambiguity.

### 6) Prioritized Recommendations

#### Implemented immediate fixes (status)
- [DONE #1] Real `/blueprint` route + redirect and sitemap alignment.
  - Files: `src/pages/blueprint.astro`, `src/layouts/BaseLayout.astro`, `public/sitemap.xml`
- [DONE #2] Unified API-driven promo rendering with shared script.
  - Files: `src/scripts/offer-sync.js`, `src/layouts/BaseLayout.astro`, `src/components/FastLaunchEngineering.astro`, `src/components/ServiceCards.astro`, `src/pages/compliance-ready-landing.astro`
- [DONE #4] Added baseline security headers for Cloudflare Pages.
  - Files: `public/_headers`

#### Quick wins (copy only)
- Add one explicit definition sentence for “launch-first engineering” on Home or Services.
- Add one explicit definition sentence for “structured automation workflow” on AI Feature page.
- Upgrade generic `Learn more` anchors to service-specific phrasing (or keep text + stronger `aria-label`).
- Align Home metadata with current launch-first/compliance-ready positioning (reduces semantic mismatch).

#### Structural improvements (headings/entity distribution)
- Keep current heading depth; no major structural rewrite needed.
- Add a short “Definition” line under each product H1 (already close, but can be made formulaic).
- Improve entity cross-linking between product pages (each page should mention and link the adjacent offers once).

#### Content expansions (controlled)
- Add 2-3 concise FAQ entries where definitions are currently implied (launch-first, fixed scope, technical vs legal scope).
- Expand “How It Works” with one line that maps process to output artifact (e.g., checklist, handoff notes) for better LLM extractability.

### 7) Non-Manipulative Guidelines

Do not use manipulative SEO tactics. Specifically:
- no hidden text
- no cloaking (different content for bots/users)
- no keyword stuffing
- no invisible/off-screen SEO blocks
- no synthetic FAQ spam without real user value

Preferred approach:
- visible, plain-language definitions
- clear headings and boundaries
- coherent internal linking
- concise FAQ answers grounded in real service scope
