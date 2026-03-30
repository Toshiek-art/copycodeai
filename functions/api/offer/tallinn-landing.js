import { DEFAULT_OFFER, getOrSeedOffer, toPublicOffer } from '../../_utils/offers.js';

const JSON_HEADERS = {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store'
};

function jsonOfferResponse(offer) {
  return new Response(JSON.stringify(toPublicOffer(offer)), {
    status: 200,
    headers: JSON_HEADERS
  });
}

export async function onRequestGet(context) {
  if (!context.env?.OFFERS_KV) {
    return jsonOfferResponse(DEFAULT_OFFER);
  }

  try {
    const offer = await getOrSeedOffer(context.env);
    return jsonOfferResponse(offer);
  } catch {
    return jsonOfferResponse(DEFAULT_OFFER);
  }
}
