const OFFER_KEY = 'tallinn_landing_2026';
const OFFER_ENDPOINT = '/api/offer/tallinn-landing';
const FALLBACK_END_DATE = '31 Mar 2026';

function formatTallinnDate(isoString) {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) {
    return FALLBACK_END_DATE;
  }

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'Europe/Tallinn'
  }).format(date);
}

function setVisibility(elements, isVisible) {
  elements.forEach((element) => {
    element.classList.toggle('hidden', !isVisible);
  });
}

function updateOfferContainer(container, offer) {
  const priceEl = container.querySelector('[data-offer="price"]');
  const deadlineEl = container.querySelector('[data-offer="deadline"]');
  const slotsEl = container.querySelector('[data-offer="slots"]');
  const activeEls = container.querySelectorAll('[data-offer="active"]');

  const price = Number(offer?.price);
  const regularPrice = Number(offer?.regularPrice);
  const slotsRemaining = Number(offer?.slotsRemaining);
  const endsAtDate = new Date(offer?.endsAt);

  const isExpired = !Number.isNaN(endsAtDate.getTime()) && Date.now() >= endsAtDate.getTime();
  const isSoldOut = Number.isFinite(slotsRemaining) && slotsRemaining <= 0;
  const isActive = !isExpired && !isSoldOut;

  if (!isActive) {
    if (priceEl) {
      const fallbackRegular = Number.isFinite(regularPrice) ? regularPrice : 750;
      priceEl.textContent = `Offer ended — regular price EUR ${fallbackRegular}`;
    }
    if (deadlineEl) deadlineEl.classList.add('hidden');
    if (slotsEl) slotsEl.classList.add('hidden');
    setVisibility(activeEls, false);
    return;
  }

  if (priceEl && Number.isFinite(price)) {
    priceEl.textContent = `Tallinn Launch Offer: EUR ${price}`;
  }

  if (deadlineEl) {
    deadlineEl.textContent = `First 5 Tallinn startups · Ends ${formatTallinnDate(offer?.endsAt)} (EET)`;
    deadlineEl.classList.remove('hidden');
  }

  if (slotsEl) {
    if (Number.isFinite(slotsRemaining)) {
      slotsEl.textContent = `Slots left: ${slotsRemaining}`;
      slotsEl.classList.remove('hidden');
    } else {
      slotsEl.classList.add('hidden');
    }
  }

  setVisibility(activeEls, true);
}

async function syncOffers() {
  const containers = document.querySelectorAll(`[data-offer-key="${OFFER_KEY}"]`);
  if (!containers.length) return;

  let offer;

  try {
    const response = await fetch(OFFER_ENDPOINT, {
      method: 'GET',
      headers: {
        accept: 'application/json'
      },
      cache: 'no-store'
    });

    if (!response.ok) return;
    offer = await response.json();
  } catch {
    return;
  }

  containers.forEach((container) => updateOfferContainer(container, offer));
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', syncOffers, { once: true });
} else {
  syncOffers();
}
