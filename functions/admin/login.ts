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

export const onRequest: PagesFunction = async ({ request }) => {
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405, headers: { Allow: 'POST' } });
  }

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
