import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = (_ctx) => {
  const runtimeEnv = (_ctx.locals as any)?.runtime?.env ?? {};
  const team = String(runtimeEnv.CF_ACCESS_TEAM_DOMAIN ?? import.meta.env.CF_ACCESS_TEAM_DOMAIN ?? '').replace(/\/$/, '');
  const target = team ? `${team}/cdn-cgi/access/logout` : '/';

  return new Response(null, {
    status: 302,
    headers: { Location: target },
  });
};
