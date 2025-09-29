import {
  buildSessionCookie,
  clearSessionCookie,
  createSessionToken,
  SESSION_TTL_SECONDS,
  verifyPassword,
} from '../../src/lib/server/auth';

function safeRedirect(target: string | null): string {
  if (!target) return '/admin';
  if (target.startsWith('/')) return target;
  try {
    const url = new URL(target, 'https://dummy.local');
    return url.pathname + url.search;
  } catch (_error) {
    return '/admin';
  }
}

export const onRequest: PagesFunction = async ({ request, env }) => {
  if (env.ENVIRONMENT !== 'production') {
    console.debug('[fn-login] handling request', request.url);
  }
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', {
      status: 405,
      headers: { Allow: 'POST' },
    });
  }

  const secureCookie = new URL(request.url).protocol === 'https:';
  const passwordHash = env.ADMIN_PASSWORD_HASH as string | undefined;
  const sessionSecret = env.ADMIN_SESSION_SECRET as string | undefined;
  if (!passwordHash || !sessionSecret) {
    return new Response('ADMIN_PASSWORD_HASH or ADMIN_SESSION_SECRET missing', { status: 500 });
  }

  const form = await request.formData();
  const password = form.get('password');
  const redirectTarget = safeRedirect(form.get('redirect') as string | null);

  if (typeof password !== 'string' || !password.trim()) {
    if (env.ENVIRONMENT !== 'production') {
      console.debug('[fn-login] password mancante');
    }
    const response = new Response(null, {
      status: 302,
      headers: {
        Location: `/admin/login?redirect=${encodeURIComponent(redirectTarget)}&error=missing`,
        'Set-Cookie': clearSessionCookie({ secure: secureCookie }),
      },
    });
    if (env.ENVIRONMENT !== 'production') {
      console.debug('[fn-login] set-cookie (missing)', response.headers.get('set-cookie'));
    }
    return response;
  }

  const isValid = await verifyPassword(password, passwordHash);
  if (env.ENVIRONMENT !== 'production') {
    console.debug('[fn-login] password valida?', isValid);
  }
  if (!isValid) {
    const response = new Response(null, {
      status: 302,
      headers: {
        Location: `/admin/login?redirect=${encodeURIComponent(redirectTarget)}&error=invalid`,
        'Set-Cookie': clearSessionCookie({ secure: secureCookie }),
      },
    });
    if (env.ENVIRONMENT !== 'production') {
      console.debug('[fn-login] set-cookie (invalid)', response.headers.get('set-cookie'));
    }
    return response;
  }

  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const token = await createSessionToken(sessionSecret, { sub: 'admin', exp: expiresAt });
  if (env.ENVIRONMENT !== 'production') {
    console.debug('[fn-login] emetto token', token.slice(0, 10) + '...');
  }

  const response = new Response(null, {
    status: 302,
    headers: {
      Location: redirectTarget || '/admin',
      'Set-Cookie': buildSessionCookie(token, SESSION_TTL_SECONDS, { secure: secureCookie }),
    },
  });
  if (env.ENVIRONMENT !== 'production') {
    console.debug('[fn-login] set-cookie (success)', response.headers.get('set-cookie'));
  }
  return response;
};
