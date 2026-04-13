import { getOrSeedOffer, saveOffer, toPublicOffer } from '../../../../_utils/offers.js';

const JSON_HEADERS = {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store',
  'X-Robots-Tag': 'noindex, nofollow'
};

export async function onRequestPost(context) {
  if (!context.env?.OFFERS_KV) {
    return new Response(JSON.stringify({ error: 'missing_kv_binding' }), {
      status: 500,
      headers: JSON_HEADERS
    });
  }

  const configuredToken = context.env?.ADMIN_TOKEN;
  const authHeader = context.request.headers.get('Authorization') || '';

  if (!configuredToken || authHeader !== `Bearer ${configuredToken}`) {
    return new Response(JSON.stringify({ error: 'unauthorized' }), {
      status: 401,
      headers: JSON_HEADERS
    });
  }

  const current = await getOrSeedOffer(context.env);
  const next = {
    ...current,
    slotsRemaining: Math.max(0, current.slotsRemaining - 1)
  };

  const saved = await saveOffer(context.env, next);

  return new Response(JSON.stringify(toPublicOffer(saved)), {
    status: 200,
    headers: JSON_HEADERS
  });
}
