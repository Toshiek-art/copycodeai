import { defineMiddleware } from 'astro/middleware';
import { isProtectedPath, isPublicPath, parseCookies } from './lib/server/auth';

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
    const res = await next();

    if (res.redirected) {
      const location = res.headers.get('Location') ?? '';
      if (location.endsWith('/admin/login') || location.endsWith('/admin/login/')) {
        const safeRedirectTarget = url.pathname + (url.search || '') || '/admin';
        const accessRedirect = `/admin/access?redirect=${encodeURIComponent(safeRedirectTarget)}`;
        return new Response(null, {
          status: 302,
          headers: { Location: accessRedirect },
        });
      }
    }

    (locals as any).adminSession = {
      sub: accessEmail ?? 'cf-access-user',
      exp: Math.floor(Date.now() / 1000) + 60,
      source: 'cloudflare-access',
    };
    return res;
  }

  if (import.meta.env.DEV) {
    console.warn('[auth] Cloudflare Access non rilevato, bypass in sviluppo');
    return next();
  }

  const redirectTarget = url.pathname + (url.search || '');
  const safeRedirect = redirectTarget || '/admin';
  return redirect(`/admin/access?redirect=${encodeURIComponent(safeRedirect)}`);
});
