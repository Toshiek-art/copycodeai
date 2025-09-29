import { defineMiddleware } from 'astro/middleware';
import {
  isProtectedPath,
  isPublicPath,
  parseCookies,
  SESSION_COOKIE_NAME,
  verifySessionToken,
} from './lib/server/auth';

export const onRequest = defineMiddleware(async (context, next) => {
  const { request, locals, redirect } = context;
  const url = new URL(request.url);

  const protectedRoute = isProtectedPath(url.pathname) && !isPublicPath(url.pathname);
  if (!protectedRoute) {
    return next();
  }

  const accessJwt = request.headers.get('cf-access-jwt-assertion');
  const accessEmail = request.headers.get('cf-access-authenticated-user-email') ?? undefined;
  const cookies = parseCookies(request.headers.get('cookie'));
  const hasAccessCookie = Boolean(cookies['CF_Authorization']);
  const hasCloudflareAccess = Boolean(accessJwt || hasAccessCookie);

  if (hasCloudflareAccess) {
    // Cloudflare Access already validated the request, so skip the internal login
    (locals as any).adminSession = {
      sub: accessEmail ?? 'cf-access-user',
      exp: Math.floor(Date.now() / 1000) + 60,
      source: 'cloudflare-access',
    };
    return next();
  }

  const secret = import.meta.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    if (import.meta.env.DEV) {
      console.warn('[auth] ADMIN_SESSION_SECRET non impostata: accesso bypassato in sviluppo.');
      return next();
    }
    return new Response('ADMIN_SESSION_SECRET missing', { status: 500 });
  }

  const token = cookies[SESSION_COOKIE_NAME];
  if (import.meta.env.DEV) {
    console.debug('[auth] cookie header', request.headers.get('cookie'));
    console.debug('[auth] token presente?', Boolean(token));
  }
  const session = await verifySessionToken(secret, token ?? '');

  if (!session) {
    const redirectTarget = url.pathname + (url.search || '');
    return redirect(`/admin/login?redirect=${encodeURIComponent(redirectTarget || '/admin')}`);
  }

  (locals as any).adminSession = session;
  return next();
});
