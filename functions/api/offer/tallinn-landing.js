import { getOrSeedOffer, toPublicOffer } from '../../_utils/offers.js';

const JSON_HEADERS = {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store'
};

export async function onRequestGet(context) {
  if (!context.env?.OFFERS_KV) {
    return new Response(JSON.stringify({ error: 'missing_kv_binding' }), {
      status: 500,
      headers: JSON_HEADERS
    });
  }

  const offer = await getOrSeedOffer(context.env);

  return new Response(JSON.stringify(toPublicOffer(offer)), {
    status: 200,
    headers: JSON_HEADERS
  });
}
