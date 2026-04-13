import { normalizeLeadPayload, validateLeadPayload } from './form-intake.js';

function mockProvider(payload) {
  return {
    ok: true,
    provider: 'mock',
    leadId: `mock_${Date.now()}`,
    payload
  };
}

async function brevoProvider(payload, env) {
  const apiKey = env?.BREVO_API_KEY;

  if (!apiKey) {
    throw new Error('missing_brevo_api_key');
  }

  const response = await fetch('https://api.brevo.com/v3/contacts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': apiKey,
      accept: 'application/json'
    },
    body: JSON.stringify({
      email: payload.contact.email,
      attributes: {
        FIRSTNAME: payload.contact.firstName,
        LASTNAME: payload.contact.lastName,
        PHONE: payload.contact.phone,
        COMPANY: payload.content.company,
        WEBSITE: payload.content.website,
        FLOW: payload.flow,
        PAGE_PATH: payload.source.pagePath,
        PAGE_TITLE: payload.source.pageTitle,
        UTM_SOURCE: payload.source.utmSource,
        UTM_MEDIUM: payload.source.utmMedium,
        UTM_CAMPAIGN: payload.source.utmCampaign
      },
      listIds: Array.isArray(env?.BREVO_LIST_IDS)
        ? env.BREVO_LIST_IDS.map((id) => Number(id)).filter((id) => Number.isFinite(id))
        : undefined
    })
  });

  if (!response.ok) {
    throw new Error(`brevo_request_failed_${response.status}`);
  }

  return {
    ok: true,
    provider: 'brevo'
  };
}

export async function submitLead(input, env = {}) {
  const payload = normalizeLeadPayload(input);
  const validation = validateLeadPayload(payload);

  if (!validation.ok) {
    return {
      ok: false,
      provider: 'none',
      errors: validation.errors,
      payload
    };
  }

  const provider = String(env.LEAD_PROVIDER || 'mock').toLowerCase();

  if (provider === 'brevo') {
    return brevoProvider(payload, env);
  }

  return mockProvider(payload);
}

