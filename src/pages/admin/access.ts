const redirectParam = url.searchParams.get('redirect') ?? '/admin/';
let safeRedirect = redirectParam.startsWith('/') ? redirectParam : '/admin/';
if (!safeRedirect.endsWith('/')) safeRedirect = safeRedirect + '/';

const runtimeEnv = (locals as any)?.runtime?.env ?? {};
const team = String(runtimeEnv.CF_ACCESS_TEAM_DOMAIN ?? import.meta.env.CF_ACCESS_TEAM_DOMAIN ?? '').replace(/\/$/, '');
const aud = String(runtimeEnv.CF_ACCESS_AUD ?? import.meta.env.CF_ACCESS_AUD ?? '');

if (!team || !aud) {
  return new Response('CF_ACCESS_TEAM_DOMAIN or CF_ACCESS_AUD missing', { status: 500 });
}

const redirectURL = new URL(safeRedirect, url.origin).toString();
const loginURL = `${team}/cdn-cgi/access/login?redirect_url=${encodeURIComponent(redirectURL)}&aud=${encodeURIComponent(aud)}`;

return new Response(null, {
  status: 302,
  headers: { Location: loginURL },
});
