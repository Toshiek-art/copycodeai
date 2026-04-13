# CopyCodeAI (Astro + Tailwind)

Static-first marketing site for Tallinn-based startups in the EU market.

## Positioning
AI systems built to scale, aligned with GDPR and EAA (European Accessibility Act).

Important: this site describes technical implementation and compliance-aware engineering. It does not provide legal advice.

## Project Structure

```text
src/
  components/
    Footer.astro
    forms/
      CheckboxField.astro
      ConsultationForm.astro
      FormField.astro
      FormStatus.astro
      GuideDownloadForm.astro
    Hero.astro
    HowItWorks.astro
    MiniScenarios.astro
    Navbar.astro
    ServiceCards.astro
    guides/
      GuideCTA.astro
      GuideCard.astro
      GuideHeader.astro
      GuideRelatedGuides.astro
      GuideRelatedService.astro
  layouts/
    BaseLayout.astro
  data/
    faq.ts
    guide-downloads.ts
    guides.ts
  lib/
    faq-schema.ts
  pages/
    ai-feature-integration.astro
    compliance-ready-landing.astro
    contact.astro
    guides/
      data-flow-ai-feature.astro
      eaa-startup-websites.astro
      gdpr-ai-startup.astro
    index.astro
    privacy.astro
    services.astro
  styles/
    global.css
functions/
  _utils/
    form-intake.js
    lead-provider.js
  api/
    forms/
      consultation.js
      guide-download.js
    admin/
      offer/
        tallinn-landing/
          decrement.js
    offer/
      tallinn-landing.js
```

## Local Development

```bash
npm install
npm run dev
npm run build
```

## Cloudflare Pages Deployment

1. Push the project to a Git repository.
2. In Cloudflare Pages, create a new project and connect the repo.
3. Build settings:
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Node version: 18+ (20 recommended)
4. Deploy.

Notes:
- Static pages are still the default delivery model, but the site now also uses Cloudflare Pages Functions for lead intake and guide downloads.
- Site has no public admin page and no admin links in public navigation.
- If an internal admin area is introduced, protect it behind Cloudflare Zero Trust Access.

## Tallinn Launch Offer API (Pages Functions + KV)

The site includes Cloudflare Pages Functions for a live promo counter:

- Public offer endpoint: `GET /api/offer/tallinn-landing`
- Admin decrement endpoint: `POST /api/admin/offer/tallinn-landing/decrement`

Required bindings on Cloudflare Pages:

- KV namespace binding: `OFFERS_KV`
- Secret: `ADMIN_TOKEN` (long random token)

Manual slot decrement (run when a slot is confirmed/paid):

```bash
curl -X POST https://<your-domain>/api/admin/offer/tallinn-landing/decrement \\
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

## Lead Intake and Download Flows

- Primary contact intake: `src/components/forms/ConsultationForm.astro` posts to `POST /api/forms/consultation`.
- Guide download bonus flow: `src/components/forms/GuideDownloadForm.astro` posts to `POST /api/forms/guide-download`.
- Shared server helpers live in `functions/_utils/form-intake.js` and `functions/_utils/lead-provider.js`.
- Provider selection is controlled with `LEAD_PROVIDER=mock|brevo`.
- Local development uses the mock provider; Brevo requires `BREVO_API_KEY` and optional `BREVO_LIST_IDS`.
- The site itself does not keep a dedicated submissions database.
- Guide PDF assets are expected under `public/downloads/guides/` when they are available. At the moment, the repository snapshot does not include those PDFs yet.

## Contact Strategy

- Primary contact: the consultation form on `/contact`.
- Fallbacks: `mailto:` with prefilled subject/body template and external scheduling via Calendly.
- No public admin page or internal dashboard is exposed in navigation.

## Form Behavior

- Forms are native HTML forms.
- Server-side validation checks required fields and honeypots.
- Successful submits redirect back with a query-string status.
- Lead forwarding is handled by Cloudflare Pages Functions and the configured provider adapter.

Minimal Pages Functions flow:

```text
1. Read form data server-side.
2. Validate required fields and honeypot.
3. Normalize the payload.
4. Forward the lead to the configured provider.
5. Redirect back with success or error state.
```
