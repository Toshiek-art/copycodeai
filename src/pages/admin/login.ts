import type { APIRoute } from 'astro';
import {
  buildSessionCookie,
  clearSessionCookie,
  createSessionToken,
  SESSION_TTL_SECONDS,
  verifyPassword,
} from '../../lib/server/auth';

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

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const passwordHash = import.meta.env.ADMIN_PASSWORD_HASH;
  const sessionSecret = import.meta.env.ADMIN_SESSION_SECRET;
  const url = new URL(request.url);
  const secureCookie = url.protocol === 'https:';

  if (!passwordHash || !sessionSecret) {
    if (import.meta.env.DEV) {
      console.warn('[auth] Variabili ADMIN_* mancanti: bypass login in sviluppo.');
      return new Response(null, { status: 302, headers: { Location: '/admin' } });
    }
    return new Response('ADMIN_PASSWORD_HASH or ADMIN_SESSION_SECRET missing', { status: 500 });
  }

  const form = await request.formData();
  const password = form.get('password');
  const redirectTarget = safeRedirect(form.get('redirect') as string | null);

  if (typeof password !== 'string' || !password.trim()) {
    return new Response(null, {
      status: 302,
      headers: {
        Location: `/admin/login?redirect=${encodeURIComponent(redirectTarget)}&error=missing`,
        'Set-Cookie': clearSessionCookie({ secure: secureCookie }),
      },
    });
  }

  const isValid = await verifyPassword(password, passwordHash);
  if (import.meta.env.DEV) {
    console.debug('[auth] verify password result', isValid);
  }
  if (!isValid) {
    return new Response(null, {
      status: 302,
      headers: {
        Location: `/admin/login?redirect=${encodeURIComponent(redirectTarget)}&error=invalid`,
        'Set-Cookie': clearSessionCookie({ secure: secureCookie }),
      },
    });
  }

  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const token = await createSessionToken(sessionSecret, { sub: 'admin', exp: expiresAt });
  if (import.meta.env.DEV) {
    console.debug('[auth] issuing session token', token.slice(0, 10) + '...');
  }

  return new Response(null, {
    status: 302,
    headers: {
      Location: redirectTarget || '/admin',
      'Set-Cookie': buildSessionCookie(token, SESSION_TTL_SECONDS, { secure: secureCookie }),
    },
  });
};
