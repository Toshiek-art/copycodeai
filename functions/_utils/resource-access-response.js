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
        max-width: 1120px;
        margin: 0 auto;
        padding: 18px 20px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
      }
      .brand {
        color: var(--text);
        font-size: 15px;
        font-weight: 700;
        letter-spacing: -0.01em;
        text-decoration: none;
      }
      .navlink {
        color: #475569;
        font-size: 14px;
        text-decoration: none;
      }
      .navlink:hover {
        color: var(--brand);
      }
      main {
        display: grid;
        place-items: center;
        padding: 32px 20px;
      }
      .card {
        width: 100%;
        max-width: 620px;
        background: var(--card);
        border: 1px solid var(--border);
        border-radius: 24px;
        padding: 32px;
        box-shadow: 0 18px 50px rgba(15, 23, 42, 0.08);
      }
      .eyebrow {
        margin: 0 0 12px;
        color: #64748b;
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.18em;
        text-transform: uppercase;
      }
      h1 {
        margin: 0;
        font-size: clamp(28px, 4vw, 40px);
        line-height: 1.1;
      }
      p {
        margin: 16px 0 0;
        color: var(--muted);
        font-size: 16px;
        line-height: 1.7;
      }
      footer {
        padding: 0 20px 20px;
      }
      .foot {
        max-width: 1120px;
        margin: 0 auto;
        color: #64748b;
        font-size: 13px;
        line-height: 1.6;
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
          <a class="brand" href="/">CopyCodeAI</a>
          <a class="navlink" href="/guides/">Guides</a>
        </div>
      </header>
      <main>
        <section class="card" aria-labelledby="access-title">
          <p class="eyebrow">CopyCodeAI</p>
          <h1 id="access-title">Access link unavailable</h1>
          <p>This link is missing, invalid, or expired.</p>
          <p>Request a new copy by email to access the ${resourceLabel} again.</p>
          <a href="${requestPath}">Request a new access link</a>
        </section>
      </main>
      <footer>
        <div class="foot">CopyCodeAI guides are written for practical launch decisions, not generic policy theatre.</div>
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
