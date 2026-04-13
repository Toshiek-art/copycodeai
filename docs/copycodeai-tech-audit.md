# CopyCodeAI Technical Audit

Consolidated from prompts 1-6.

This document summarizes the real public structure of the site, the current guides/FAQ/forms/tracking setup, and the most practical integration choices for the current stack.

## 0. Scope

- Repository: `/home/tosiek/code-works/copycodeai`
- Site: `copycodeai.online`
- Stack: Astro 5 + Tailwind, static-first, Cloudflare Pages Functions for small server-side endpoints
- Source basis: code in `src/`, `public/`, `functions/`, `docs/`

## 1. Public Route Map

### 1.1 Real public routes

| URL or pattern | Source | Type | Role |
|---|---|---|---|
| `/` | `src/pages/index.astro` | Static | Primary |
| `/services` | `src/pages/services.astro` | Static | Primary |
| `/contact` | `src/pages/contact.astro` | Static | Primary |
| `/compliance-ready-landing` | `src/pages/compliance-ready-landing.astro` | Static | Primary service page |
| `/ai-feature-integration` | `src/pages/ai-feature-integration.astro` | Static | Primary service page |
| `/eaa-structural-hardening` | `src/pages/eaa-structural-hardening.astro` | Static | Primary service page |
| `/work` | `src/pages/work.astro` | Static | Secondary |
| `/work/[slug]` | `src/pages/work/[slug].astro` + `src/data/work.ts` | Static generation from local array | Secondary |
| `/guides/` | `src/pages/guides/index.astro` | Static | Secondary/support |
| `/guides/gdpr-ai-startup/` | `src/pages/guides/gdpr-ai-startup.astro` | Static | Support content |
| `/guides/eaa-startup-websites/` | `src/pages/guides/eaa-startup-websites.astro` | Static | Support content |
| `/guides/data-flow-ai-feature/` | `src/pages/guides/data-flow-ai-feature.astro` | Static | Support content |
| `/privacy` | `src/pages/privacy.astro` | Static | Support/legal |
| `/accessibility` | `src/pages/accessibility.astro` | Static | Support/legal |
| `/404` | `src/pages/404.astro` | Static | Utility/support |
| `/blueprint` | `src/pages/blueprint.astro` | Static redirect page | Legacy/alias route |

### 1.2 API routes

| Route | Source | Purpose |
|---|---|---|
| `GET /api/offer/tallinn-landing` | `functions/api/offer/tallinn-landing.js` | Public promo state |
| `POST /api/admin/offer/tallinn-landing/decrement` | `functions/api/admin/offer/tallinn-landing/decrement.js` | Admin promo decrement |

### 1.3 Route notes

- The site is file-based, not CMS-driven.
- There is no Astro content collection for guides or work.
- `src/pages/work/[slug].astro` uses `getStaticPaths()` from `src/data/work.ts`.
- `/blueprint` is a real route, but it refreshes to `/#blueprint` and should be treated as a technical alias, not the canonical content URL.
- `/writing` redirects to `/guides/` via `public/_redirects`.

## 2. Redirects, Canonicals, Metadata, Sitemap, Robots

### 2.1 Redirects / legacy URLs

| Source | Destination | Type |
|---|---|---|
| `src/pages/blueprint.astro` | `/#blueprint` via meta refresh | Legacy technical alias |
| `public/_redirects` (`/writing`) | `/guides/` | Legacy alias |

### 2.2 Canonical and SEO metadata

- Central metadata shell exists in `src/layouts/BaseLayout.astro`.
- `BaseLayout` sets:
  - `meta description`
  - `meta robots=index, follow`
  - `canonical` when provided
  - `og:type`, `og:title`, `og:description`, `og:url` when canonical exists
- Canonical is set on the main pages, guide pages, work pages, privacy/accessibility, product pages, and `/blueprint`.
- Gaps:
  - no `og:image`
  - no JSON-LD structured data
  - `/404` inherits `index, follow`, which is not ideal
  - metadata is partly centralized, but not fully unified in one content source

### 2.3 Sitemap

- Sitemap is a static file in `public/sitemap.xml`.
- It is maintained manually, not generated from routes.
- It includes:
  - home
  - services
  - work index and work detail pages
  - contact
  - guides index
  - one guide page (`/guides/gdpr-ai-startup/`)
  - privacy
  - accessibility
  - product pages
- Missing from sitemap even though they exist:
  - `/guides/eaa-startup-websites/`
  - `/guides/data-flow-ai-feature/`
- `/blueprint` is intentionally omitted from the sitemap in practice, which is reasonable because it is a redirect-style alias.

### 2.4 Robots / indexing

- `public/robots.txt` allows crawling site-wide and points to the sitemap.
- There is no explicit `noindex`/`nofollow` mechanism in the code.
- Technical/utility URLs that should generally be excluded from indexing:
  - `/404`
  - `/blueprint`
  - `/writing`
  - `/api/*`
  - future admin, preview, or test routes

## 3. Site Architecture and Key Components

### 3.1 Layout and shell

- `src/layouts/BaseLayout.astro`
  - global metadata
  - skip link
  - cookie consent banner
  - optional offer sync script
- `src/components/Navbar.astro`
  - main nav, mobile toggle, blueprint anchor link
- `src/components/Footer.astro`
  - legal links, contact mail, cookie preferences trigger
- `src/components/layout/Section.astro`
  - section spacing/variants
- `src/components/layout/Container.astro`
  - width/layout wrapper
- `src/components/layout/CTAGroup.astro`
  - CTA layout helper

### 3.2 Content cards and proof blocks

- `src/components/Hero.astro`
- `src/components/EntryOffer.astro`
- `src/components/FastLaunchEngineering.astro`
- `src/components/ServiceCards.astro`
- `src/components/SelectedWork.astro`
- `src/components/work/ProjectCard.astro`
- `src/components/work/TechnicalAudit.astro`
- `src/components/MiniScenarios.astro`
- `src/components/WhyCopyCodeAI.astro`

### 3.3 Existing support assets

- `src/scripts/offer-sync.js`
  - fetches promo offer state from the API
  - updates offer cards on home/services/product pages
- `src/components/CookieConsent.astro`
  - consent banner and GA4 loading
- `public/_headers`
  - security headers and static cache rules

## 4. Guides: Current Implementation

### 4.1 Where guides live

- Guides are standalone Astro pages in `src/pages/guides/`.
- There is no CMS, Markdown collection, or MDX layer.
- The index page hardcodes guide metadata in a local `guides` array.

Relevant files:
- `src/pages/guides/index.astro`
- `src/pages/guides/gdpr-ai-startup.astro`
- `src/pages/guides/eaa-startup-websites.astro`
- `src/pages/guides/data-flow-ai-feature.astro`

### 4.2 Rendering model

- Each guide is a full page with:
  - `BaseLayout`
  - `Navbar`
  - `Footer`
  - `Section` / `Container`
  - article body written inline
  - CTA blocks at the end
- The guide bodies use semantic `article`, `section`, `h2`, `h3`, and `prose` classes.
- There is no shared guide template yet.

### 4.3 Metadata currently available

Supported today:
- `title`
- `description`
- `canonical`
- `ogTitle`
- `ogDescription`

Partial or implicit:
- `slug` from filename
- `publishAt` only in `src/pages/guides/index.astro`
- `category` only in the index card data

Missing today:
- `updatedAt`
- `author`
- `tags`
- `cover image`
- `FAQ` data model
- `TOC`
- reusable `related guides` model

### 4.4 Best guide extensions

Recommended priority:
- reusable CTA block
- `updatedAt`
- related service box
- guide-related links
- breadcrumbs
- FAQ inline where useful
- PDF/download box as a secondary option

Technical recommendation:
- centralize guide metadata in a small TS data module before moving to a content collection
- create a shared `GuideArticleLayout` only if the number of guides grows further

### 4.5 Structured data for guides

- No JSON-LD exists today.
- Best schema candidates:
  - `Article`
  - `BreadcrumbList`
  - `FAQPage` only when the page has real visible FAQ content
- Best insertion point:
  - either a shared layout prop in `BaseLayout`
  - or a small page-level JSON-LD helper imported into each guide page

## 5. FAQ Strategy

### 5.1 Current state

- The site already uses native `<details>/<summary>` FAQ blocks in:
  - `src/pages/compliance-ready-landing.astro`
  - `src/pages/ai-feature-integration.astro`
  - `src/pages/eaa-structural-hardening.astro`
- There is no central FAQ page.
- There is no reusable FAQ component.
- There is no FAQ JSON-LD.

### 5.2 Best architecture

Recommended approach for this site:
- create reusable FAQ components
- keep FAQ inside service pages and selected guide pages
- postpone a dedicated `/faq` page until there is enough cross-page demand

Recommended component set:
- `src/components/faq/FAQSection.astro`
- `src/components/faq/FAQItem.astro`
- `src/data/faq.ts`
- optional `src/lib/faq-schema.ts`

Recommended data model:
- TS object/module, not a content collection yet
- reuse the same data for visible FAQ and schema

### 5.3 Structured data

- `FAQPage` makes sense on the existing offer pages if the FAQ content is visible.
- Do not use it on pages without actual FAQ sections.
- Do not add FAQ schema as decoration; keep it tied to real Q/A blocks.

## 6. Forms, Booking, and Conversion Paths

### 6.1 Current state

- There are no public HTML forms in the site.
- Contact is done through:
  - `mailto:` links
  - external Calendly links
- No form library exists.
- No form validation library exists.
- No form submit handlers exist for user intake.

Relevant files:
- `src/components/Hero.astro`
- `src/components/EntryOffer.astro`
- `src/pages/contact.astro`
- `src/pages/compliance-ready-landing.astro`
- `src/pages/ai-feature-integration.astro`
- `src/pages/eaa-structural-hardening.astro`

### 6.2 Existing booking integration

- Booking is external via Calendly URLs hardcoded in several pages/components.
- There is no embedded booking widget.

### 6.3 Best insertion points for new flows

Recommended flow placement:
- guide download form: inside guide pages, near the end of the article
- consultation form: on `src/pages/contact.astro`
- booking widget: optionally on `src/pages/contact.astro`
- CTA links: keep in hero, entry offer, guides, services, and contact

### 6.4 Clean technical direction

For download guide:
- email required
- name optional
- separate marketing opt-in checkbox if needed
- privacy note below the form

For consultation booking:
- first name
- last name
- email
- phone
- optional company/project/website fields

Technical recommendation:
- keep the HTML form simple
- validate natively first
- send to a Cloudflare Function endpoint
- forward to email/CRM/provider

## 7. Analytics and Funnel Tracking

### 7.1 Current state

- GA4 is the only analytics provider visible in code.
- It loads only after cookie consent.
- The consent banner is in `src/components/CookieConsent.astro`.
- `BaseLayout` injects that component globally.

### 7.2 What is currently tracked

- Standard GA4 pageviews after consent
- Cookie preference choice is stored locally, but not sent as analytics event
- No explicit custom event taxonomy is present

### 7.3 Gaps

Useful funnel events not yet tracked:
- guide view
- relevant scroll milestones
- CTA clicks
- download clicks
- form open
- submit success/failure
- booking open / booking click
- booking completion
- journey steps from guide to service to contact

### 7.4 Recommended tracking architecture

- Create a light internal analytics helper in `src/scripts/analytics.ts`.
- Keep event names in a central file such as `src/lib/analytics-events.ts`.
- Use data attributes like `data-track="guide_download_click"`.
- Dispatch events only when GA consent is active.
- Avoid adding a third-party tracking library.

Recommended naming style:
- `guide_view`
- `guide_download_click`
- `guide_download_submit`
- `service_cta_click`
- `booking_open`
- `booking_submit`

Priority order:
1. CTA click tracking
2. guide view
3. guide-to-service / guide-to-contact paths
4. download clicks
5. form open/submit
6. booking completion
7. scroll milestones and abandonment

## 8. Integrations: Best Fit Services

### 8.1 Current stack constraints

- Static-first site
- Cloudflare Pages Functions available
- No persistent backend today
- No heavy application state
- GA4 already present
- Existing promo storage uses Cloudflare KV

### 8.2 Service-by-service assessment

#### Brevo
- Best fit for the current phase
- Good for transactional email, lead collection, and lightweight CRM
- Can absorb download email flows and consultation confirmations
- Less operational overhead than a full backend

#### Cal.com
- Good booking alternative if you want more control than Calendly
- Best for a later phase when you want embedded booking and custom questions
- Not required immediately

#### Appwrite
- Too heavy for the current site stage
- Good only if the site becomes a real app with auth, storage, and more backend features

#### PocketBase
- Good lightweight self-hosted storage option
- Useful if you want to own lead data
- Still more operational work than Brevo-only

#### n8n
- Very good once you have multiple automations
- Overkill for a single intake flow
- Strong choice for lead routing, notifications, and enrichment after the first forms exist

#### Provider email transazionale
- Excellent lightweight option
- Best for confirmations and simple automated replies
- Does not solve CRM/storage by itself

#### CRM leggero
- Brevo CRM is the most coherent lightweight choice here
- Avoid adding a separate heavy CRM unless pipeline management is a real need

### 8.3 Recommended combinations

Initial light phase:
- Brevo
- Cloudflare Functions
- Calendly as-is
- GA4 for measurement

Later phase:
- Brevo
- Cal.com
- n8n
- PocketBase only if you want owned storage

Avoid for now:
- Appwrite
- a full separate backend platform
- a second heavy CRM

## 9. Operational Conclusions

### 9.1 What is already solid

- clean static-first architecture
- clear public route structure
- good semantic page markup
- existing CTA-driven funnel
- existing GA4 consent gating
- existing small backend function pattern via Cloudflare Pages Functions
- existing promo KV pattern as a lightweight state example

### 9.2 What should be improved next

- make guide metadata and content structure more reusable
- introduce a reusable FAQ pattern
- complete the sitemap for all public guides
- add real form intake for download and consultation
- add funnel tracking helpers
- keep `/blueprint` as alias or replace it with a cleaner canonical decision

### 9.3 Most sensible next technical moves

1. Create reusable FAQ components and a shared data module.
2. Create guide/article helper components and add JSON-LD.
3. Add a download-guide form to guide pages.
4. Add a consultation form to `contact`.
5. Add a small analytics helper and event taxonomy.
6. Use Brevo plus Cloudflare Functions for email and lead handling.
7. Keep Calendly initially, and evaluate Cal.com later only if booking ownership becomes important.

## 10. Key Files

- `src/layouts/BaseLayout.astro`
- `src/components/CookieConsent.astro`
- `src/components/Navbar.astro`
- `src/components/Footer.astro`
- `src/components/Hero.astro`
- `src/components/EntryOffer.astro`
- `src/components/FastLaunchEngineering.astro`
- `src/components/SelectedWork.astro`
- `src/components/ServiceCards.astro`
- `src/pages/index.astro`
- `src/pages/services.astro`
- `src/pages/contact.astro`
- `src/pages/work.astro`
- `src/pages/work/[slug].astro`
- `src/pages/guides/index.astro`
- `src/pages/guides/gdpr-ai-startup.astro`
- `src/pages/guides/eaa-startup-websites.astro`
- `src/pages/guides/data-flow-ai-feature.astro`
- `src/pages/compliance-ready-landing.astro`
- `src/pages/ai-feature-integration.astro`
- `src/pages/eaa-structural-hardening.astro`
- `public/sitemap.xml`
- `public/robots.txt`
- `public/_redirects`
- `public/_headers`
- `functions/api/offer/tallinn-landing.js`
- `functions/api/admin/offer/tallinn-landing/decrement.js`
- `functions/_utils/offers.js`

