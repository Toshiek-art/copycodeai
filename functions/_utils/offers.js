export const OFFER_KEY = 'tallinn_landing_2026';

export const DEFAULT_OFFER = Object.freeze({
  price: 650,
  regularPrice: 750,
  currency: 'EUR',
  slotsRemaining: 5,
  endsAt: '2026-03-31T23:59:59+02:00',
  city: 'Tallinn'
});

function normalizeOffer(input) {
  const merged = { ...DEFAULT_OFFER, ...(input || {}) };

  return {
    price: Number.isFinite(Number(merged.price)) ? Number(merged.price) : DEFAULT_OFFER.price,
    regularPrice: Number.isFinite(Number(merged.regularPrice)) ? Number(merged.regularPrice) : DEFAULT_OFFER.regularPrice,
    currency: typeof merged.currency === 'string' && merged.currency ? merged.currency : DEFAULT_OFFER.currency,
    slotsRemaining: Math.max(
      0,
      Number.isFinite(Number(merged.slotsRemaining)) ? Math.floor(Number(merged.slotsRemaining)) : DEFAULT_OFFER.slotsRemaining
    ),
    endsAt: typeof merged.endsAt === 'string' && merged.endsAt ? merged.endsAt : DEFAULT_OFFER.endsAt,
    city: typeof merged.city === 'string' && merged.city ? merged.city : DEFAULT_OFFER.city
  };
}

export function toPublicOffer(offer) {
  const normalized = normalizeOffer(offer);
  return {
    price: normalized.price,
    regularPrice: normalized.regularPrice,
    currency: normalized.currency,
    slotsRemaining: normalized.slotsRemaining,
    endsAt: normalized.endsAt,
    city: normalized.city
  };
}

export async function getOrSeedOffer(env) {
  const raw = await env.OFFERS_KV.get(OFFER_KEY);

  if (!raw) {
    const seeded = normalizeOffer(DEFAULT_OFFER);
    await env.OFFERS_KV.put(OFFER_KEY, JSON.stringify(seeded));
    return seeded;
  }

  try {
    return normalizeOffer(JSON.parse(raw));
  } catch {
    const seeded = normalizeOffer(DEFAULT_OFFER);
    await env.OFFERS_KV.put(OFFER_KEY, JSON.stringify(seeded));
    return seeded;
  }
}

export async function saveOffer(env, offer) {
  const normalized = normalizeOffer(offer);
  await env.OFFERS_KV.put(OFFER_KEY, JSON.stringify(normalized));
  return normalized;
}
