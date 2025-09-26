import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = ({ request }) => {
  const email = request.headers.get('CF-Access-Authenticated-User-Email') ?? null;
  const hasJwt = Boolean(request.headers.get('CF-Access-Jwt-Assertion'));

  const body = JSON.stringify({ email, jwt: hasJwt ? 'present' : 'absent' }, null, 2);

  return new Response(body, {
    headers: { 'content-type': 'application/json' },
  });
};
