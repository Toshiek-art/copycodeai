import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = ({ request, locals }) => {
  const url = new URL(request.url);
  const runtimeEnv = (locals as any)?.runtime?.env ?? {};
  const team = String(runtimeEnv.CF_ACCESS_TEAM_DOMAIN ?? import.meta.env.CF_ACCESS_TEAM_DOMAIN ?? '').replace(/\/$/, '');

  const returnToParam = url.searchParams.get('returnTo') ?? '/admin';
  const returnTo = new URL(returnToParam, url.origin).toString();

  const target = team
    ? `${team}/cdn-cgi/access/logout?return_to=${encodeURIComponent(returnTo)}`
    : returnTo;

  return new Response(null, {
    status: 302,
    headers: { Location: target },
  });
};
