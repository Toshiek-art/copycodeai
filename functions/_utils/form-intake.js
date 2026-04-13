const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[+()0-9\s.-]{6,}$/;

function toStringValue(value) {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim();
}

function fromFormData(formData, key) {
  if (!formData) {
    return '';
  }

  const value = formData.get(key);
  return toStringValue(typeof value === 'string' ? value : '');
}

export function trimString(value) {
  return toStringValue(value);
}

export function readFormValue(formData, key) {
  return fromFormData(formData, key);
}

export function readFormValues(formData, keys) {
  return keys.reduce((acc, key) => {
    acc[key] = readFormValue(formData, key);
    return acc;
  }, {});
}

export function isValidEmail(value) {
  const normalized = toStringValue(value);
  return EMAIL_REGEX.test(normalized);
}

export function isValidPhone(value) {
  const normalized = toStringValue(value);

  if (!normalized) {
    return false;
  }

  return PHONE_REGEX.test(normalized);
}

export function hasHoneypotValue(formData, fieldName = 'website') {
  return Boolean(readFormValue(formData, fieldName));
}

export function normalizeLeadPayload(input) {
  const payload = input || {};
  const contact = payload.contact || {};
  const source = payload.source || {};
  const content = payload.content || {};
  const consent = payload.consent || {};
  const antiSpam = payload.antiSpam || {};

  return {
    flow: toStringValue(payload.flow),
    source: {
      pagePath: toStringValue(source.pagePath),
      pageTitle: toStringValue(source.pageTitle),
      referrer: toStringValue(source.referrer),
      utmSource: toStringValue(source.utmSource),
      utmMedium: toStringValue(source.utmMedium),
      utmCampaign: toStringValue(source.utmCampaign)
    },
    contact: {
      firstName: toStringValue(contact.firstName),
      lastName: toStringValue(contact.lastName),
      email: toStringValue(contact.email).toLowerCase(),
      phone: toStringValue(contact.phone)
    },
    content: {
      guideSlug: toStringValue(content.guideSlug),
      guideTitle: toStringValue(content.guideTitle),
      pdfUrl: toStringValue(content.pdfUrl),
      company: toStringValue(content.company),
      website: toStringValue(content.website),
      message: toStringValue(content.message),
      returnTo: toStringValue(content.returnTo)
    },
    consent: {
      marketingOptIn: Boolean(consent.marketingOptIn),
      privacyAccepted: consent.privacyAccepted !== false
    },
    antiSpam: {
      honeypot: toStringValue(antiSpam.honeypot)
    }
  };
}

export function validateLeadPayload(payload) {
  const errors = {};

  if (!payload?.flow) {
    errors.flow = 'missing_flow';
  }

  if (!payload?.contact?.email || !isValidEmail(payload.contact.email)) {
    errors.email = 'invalid_email';
  }

  if (payload?.flow === 'consultation') {
    if (!payload.contact?.firstName) {
      errors.firstName = 'missing_first_name';
    }

    if (!payload.contact?.lastName) {
      errors.lastName = 'missing_last_name';
    }

    if (!payload.contact?.phone || !isValidPhone(payload.contact.phone)) {
      errors.phone = 'invalid_phone';
    }
  }

  if (payload?.flow === 'guide_download') {
    if (!payload.content?.guideSlug) {
      errors.guideSlug = 'missing_guide_slug';
    }

    if (!payload.content?.returnTo) {
      errors.returnTo = 'missing_return_to';
    }
  }

  if (payload?.antiSpam?.honeypot) {
    errors.honeypot = 'honeypot_triggered';
  }

  return {
    ok: Object.keys(errors).length === 0,
    errors
  };
}

export function buildRedirectUrl(basePath, params = {}, origin = 'https://copycodeai.online') {
  const url = new URL(basePath, origin);

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }

    url.searchParams.set(key, String(value));
  });

  return url.pathname + url.search + url.hash;
}

export function createRedirectResponse(basePath, params = {}, status = 303, origin = 'https://copycodeai.online') {
  return new Response(null, {
    status,
    headers: {
      Location: buildRedirectUrl(basePath, params, origin),
      'Cache-Control': 'no-store'
    }
  });
}

