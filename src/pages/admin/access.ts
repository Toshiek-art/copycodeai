// src/pages/admin/access.ts
import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = ({ request, locals }) => {
  const url = new URL(request.url);

  // redirect “sicuro” e normalizzato a /admin/
  const p = url.searchParams.get('redirect') ?? '/admin/';
  let safe = p.startsWith('/') ? p : '/admin/';
  if (!safe.endsWith('/')) safe = safe + '/';

  // env lato runtime (Pages) con fallback build-time
  const runtimeEnv = (locals as any)?.runtime?.env ?? {};
  let team = String(
    runtimeEnv.CF_ACCESS_TEAM_DOMAIN ?? import.meta.env.CF_ACCESS_TEAM_DOMAIN ?? ''
  ).replace(/\/+$/, ''); // niente slash finali

  const aud = String(
    runtimeEnv.CF_ACCESS_AUD ?? import.meta.env.CF_ACCESS_AUD ?? ''
  );

  if (!team || !aud) {
    return new Response('CF_ACCESS_TEAM_DOMAIN or CF_ACCESS_AUD missing', { status: 500 });
  }

  // se manca lo schema, aggiungo https:// (serve URL assoluto)
  if (!/^https?:\/\//i.test(team)) {
    team = `https://${team}`;
  }

  const redirectURL = new URL(safe, url.origin).toString(); // https://copycodeai-bki.pages.dev/admin/
  const login = new URL('/cdn-cgi/access/login', team);
  login.searchParams.set('redirect_url', redirectURL);
  login.searchParams.set('aud', aud);

  return Response.redirect(login.toString(), 302);
};
