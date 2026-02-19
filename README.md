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
    Hero.astro
    HowItWorks.astro
    MiniScenarios.astro
    Navbar.astro
    ServiceCards.astro
  layouts/
    BaseLayout.astro
  pages/
    contact.astro
    index.astro
    services.astro
  styles/
    global.css
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
- No server is required for v1.
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

## Contact Strategy (v1)

- Default contact: `mailto:` with prefilled subject/body template.
- Optional scheduling: external booking URL.
- No database storage for contact data in v1.

## Optional Form Strategy (v2)

If you later add a contact form:
- Add Cloudflare Turnstile widget on the client.
- Verify Turnstile token in a Cloudflare Worker endpoint.
- Include honeypot field and rate-limit assumptions.
- Do not persist personal data beyond forwarding the message.

Minimal Worker verification placeholder:

```js
export default {
  async fetch(request, env) {
    if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

    const data = await request.json();
    const { turnstileToken, honeypot } = data;
    if (honeypot) return new Response('Spam blocked', { status: 400 });

    const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret: env.TURNSTILE_SECRET,
        response: turnstileToken,
      }),
    });

    const verifyData = await verifyRes.json();
    if (!verifyData.success) return new Response('Verification failed', { status: 400 });

    // Forward message to email provider/webhook and return success.
    return new Response('OK', { status: 200 });
  },
};
```
