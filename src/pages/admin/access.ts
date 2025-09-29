import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = ({ request, locals }) => {
  const url = new URL(request.url);

  // redirect “sicuro” solo su path locali
  const redirectParam = url.searchParams.get('redirect') ?? '/admin';
  const safeRedirect = redirectParam.startsWith('/') ? redirectParam : '/admin';

  // env lato server (Pages) o fallback a build-time
  const runtimeEnv = (locals as any)?.runtime?.env ?? {};
  let team = String(
    runtimeEnv.CF_ACCESS_TEAM_DOMAIN ?? import.meta.env.CF_ACCESS_TEAM_DOMAIN ?? ''
  ).replace(/\/+$/, ''); // togli eventuale slash finale

  const aud = String(
    runtimeEnv.CF_ACCESS_AUD ?? import.meta.env.CF_ACCESS_AUD ?? ''
  );

  if (!team || !aud) {
    return new Response('CF_ACCESS_TEAM_DOMAIN or CF_ACCESS_AUD missing', { status: 500 });
  }

  // Se manca lo schema, aggiungi https://
  if (!/^https?:\/\//i.test(team)) {
    team = `https://${team}`;
  }

  // redirect assoluto verso il tuo origin
  const redirectURL = new URL(safeRedirect, url.origin).toString();

  const login = new URL('/cdn-cgi/access/login', team);
  login.searchParams.set('redirect_url', redirectURL);
  login.searchParams.set('aud', aud);

  return new Response(null, {
    status: 302,
    headers: { Location: login.toString() },
  });
};
