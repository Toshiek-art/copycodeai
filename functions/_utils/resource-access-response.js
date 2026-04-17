export function createAccessLockedResponse(requestPath, resourceLabel = 'guide') {
  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex, nofollow" />
    <title>Access link unavailable | CopyCodeAI</title>
    <style>
      :root {
        color-scheme: light;
        --bg: #f8fafc;
        --card: #ffffff;
        --border: #dbe4ee;
        --text: #0f172a;
        --muted: #475569;
        --brand: #1d4ed8;
        --brand-soft: #eff6ff;
      }

      * { box-sizing: border-box; }
      body {
        margin: 0;
        background: linear-gradient(180deg, #f8fafc 0%, #eef4fb 100%);
        color: var(--text);
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }
      .shell {
        min-height: 100vh;
        display: grid;
        grid-template-rows: auto 1fr auto;
      }
      header, footer {
        width: 100%;
      }
      .bar {
        max-width: 80rem;
        margin: 0 auto;
        padding: 18px 24px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
      }
      .brand {
        display: inline-flex;
        align-items: center;
        line-height: 0;
        color: var(--text);
        font-weight: 700;
        text-decoration: none;
      }
      .brand img {
        display: block;
        width: auto;
        height: 32px;
      }
      .nav {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: flex-end;
        gap: 18px;
      }
      .navlink {
        color: #334155;
        font-size: 14px;
        text-decoration: none;
      }
      .navlink:hover {
        color: var(--brand);
      }
      .navlink[aria-current="page"] {
        color: var(--text);
        font-weight: 600;
      }
      main {
        padding: 24px 20px 40px;
      }
      .container {
        width: 100%;
        max-width: 80rem;
        margin: 0 auto;
      }
      .crumbs {
        margin: 0 0 18px;
        color: #64748b;
        font-size: 13px;
        line-height: 1.5;
      }
      .crumbs a {
        display: inline;
        margin: 0;
        padding: 0;
        border: 0;
        background: transparent;
        color: #475569;
        font-weight: 600;
        text-decoration: none;
      }
      .crumbs a:hover {
        color: var(--brand);
      }
      .card {
        width: 100%;
        background: var(--card);
        border: 1px solid var(--border);
        border-radius: 28px;
        padding: clamp(28px, 5vw, 56px);
        box-shadow: 0 18px 50px rgba(15, 23, 42, 0.08);
      }
      .eyebrow,
      .section-label {
        margin: 0;
        color: #64748b;
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.18em;
        text-transform: uppercase;
      }
      .hero {
        display: grid;
        gap: 20px;
        align-items: start;
      }
      .hero-grid {
        display: grid;
        gap: 24px;
      }
      h1 {
        margin: 10px 0 0;
        font-size: clamp(34px, 4.6vw, 54px);
        line-height: 1.1;
        letter-spacing: -0.03em;
        max-width: 12ch;
      }
      p {
        margin: 16px 0 0;
        color: var(--muted);
        font-size: 17px;
        line-height: 1.7;
      }
      .copy {
        max-width: 58ch;
      }
      .panel {
        margin-top: 28px;
        border: 1px solid var(--border);
        border-radius: 24px;
        background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
        padding: 22px;
      }
      .panel-title {
        margin: 0;
        font-size: 14px;
        font-weight: 700;
        color: var(--text);
      }
      .panel-copy {
        margin-top: 8px;
        font-size: 15px;
        color: var(--muted);
      }
      footer {
        padding: 0 20px 20px;
      }
      .foot {
        max-width: 80rem;
        margin: 0 auto;
        color: #64748b;
        font-size: 13px;
        line-height: 1.6;
      }
      .foot-top {
        display: flex;
        flex-wrap: wrap;
        gap: 12px 20px;
        align-items: center;
        justify-content: space-between;
        border-top: 1px solid #dbe4ee;
        padding-top: 14px;
      }
      .foot-meta {
        display: grid;
        gap: 4px;
      }
      .foot strong {
        color: var(--text);
      }
      .foot-links {
        display: flex;
        flex-wrap: wrap;
        gap: 14px 18px;
        align-items: center;
      }
      .foot-links a,
      .foot-links button {
        display: inline;
        margin-top: 0;
        padding: 0;
        border: 0;
        background: transparent;
        color: #334155;
        font-size: 13px;
        font-weight: 500;
        text-decoration: none;
      }
      .foot-links a:hover,
      .foot-links button:hover {
        color: var(--brand);
      }
      a {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        margin-top: 24px;
        padding: 12px 18px;
        border-radius: 12px;
        background: var(--brand);
        color: #fff;
        text-decoration: none;
        font-size: 14px;
        font-weight: 700;
      }
      a:focus-visible {
        outline: 2px solid #2563eb;
        outline-offset: 3px;
      }
    </style>
  </head>
  <body>
    <div class="shell">
      <header>
        <div class="bar">
          <a class="brand" href="/" aria-label="Go to CopyCodeAI home page">
            <img src="/logos/logo_ret_no_tag_trans_400w.png" alt="CopyCodeAI logo" width="400" height="80" decoding="async" />
          </a>
          <nav class="nav" aria-label="Main navigation">
            <a class="navlink" href="/">Home</a>
            <a class="navlink" href="/services">Services</a>
            <a class="navlink" href="/guides/" aria-current="page">Guides</a>
            <a class="navlink" href="/work">Work</a>
            <a class="navlink" href="/contact">Contact</a>
          </nav>
        </div>
      </header>
      <main>
        <div class="container">
          <p class="crumbs"><a href="/guides/">Guides</a> / Access link unavailable</p>
          <section class="card" aria-labelledby="access-title">
            <div class="hero">
              <p class="eyebrow">CopyCodeAI guides</p>
              <div class="hero-grid">
                <div>
                  <h1 id="access-title">Access link unavailable</h1>
                  <p class="copy">This link is missing, invalid, or expired.</p>
                  <p class="copy">Request a new copy by email to access the ${resourceLabel} again.</p>
                  <a href="${requestPath}">Request a new access link</a>
                </div>
                <aside class="panel" aria-label="Access note">
                  <p class="panel-title">Need the current version?</p>
                  <p class="panel-copy">Request a fresh link and we&apos;ll send you back to the full guide page.</p>
                </aside>
              </div>
            </div>
          </section>
        </div>
      </main>
      <footer>
        <div class="foot">
          <div class="foot-top">
            <div class="foot-meta">
              <strong>CopyCodeAI</strong>
              <span>Engineering-first support for startups and digital businesses across Europe that need clarity before they launch or scale.</span>
            </div>
            <nav class="foot-links" aria-label="Compliance statements">
              <a href="/privacy">Privacy Policy</a>
              <a href="/accessibility">Accessibility Statement</a>
              <button type="button" data-open-cookie-banner>Cookie Preferences</button>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  </body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store'
    }
  });
}
