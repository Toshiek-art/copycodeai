import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  const headers = request.headers;

  const jwt = headers.get('CF-Access-Jwt-Assertion');
  const email = headers.get('CF-Access-Authenticated-User-Email');
  const userId = headers.get('CF-Access-Authenticated-User-Id');
  const groups = headers.get('CF-Access-Authenticated-User-Groups');
  const appId = headers.get('CF-Access-Client-Id');
  const team = headers.get('CF-Access-Team');

  const cookieHeader = headers.get('cookie') ?? '';
  const hasAccessCookie = cookieHeader.includes('CF_Authorization=');

  const payload = {
    timestamp: new Date().toISOString(),
    ok: Boolean(jwt || hasAccessCookie),
    headers: {
      'CF-Access-Authenticated-User-Email': email ?? null,
      'CF-Access-Authenticated-User-Id': userId ?? null,
      'CF-Access-Authenticated-User-Groups': groups ?? null,
      'CF-Access-Client-Id': appId ?? null,
      'CF-Access-Team': team ?? null,
      'CF-Access-Jwt-Assertion': jwt ? `${jwt.slice(0, 24)}…${jwt.slice(-10)}` : null,
    },
    cookies: {
      'CF_Authorization': hasAccessCookie,
    },
    request: {
      url: request.url,
      method: request.method,
    },
  };

  return new Response(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  });
};
