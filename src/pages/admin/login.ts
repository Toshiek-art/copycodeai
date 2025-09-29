import type { APIRoute } from 'astro';

export const prerender = false;

function safeRedirect(target: FormDataEntryValue | null): string {
  if (typeof target !== 'string' || !target) return '/admin';
  if (target.startsWith('/')) return target;
  try {
    const url = new URL(target, 'https://dummy.local');
    return url.pathname + url.search;
  } catch (_error) {
    return '/admin';
  }
}

export const POST: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const form = await request.formData();
  const redirectTarget = safeRedirect(form.get('redirect'));

  const accessUrl = new URL('/admin/access', url.origin);
  accessUrl.searchParams.set('redirect', redirectTarget);

  return new Response(null, {
    status: 302,
    headers: { Location: accessUrl.toString() },
  });
};
