import { normalizeLeadPayload, validateLeadPayload } from './form-intake.js';

function toTrimmedString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function toEmailRecipientList(value) {
  if (Array.isArray(value)) {
    return value
      .map((item) => toTrimmedString(item))
      .filter(Boolean)
      .map((email) => ({ email }));
  }

  return toTrimmedString(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .map((email) => ({ email }));
}

export function parseBrevoListIds(rawValue) {
  const values = Array.isArray(rawValue)
    ? rawValue
    : String(rawValue || '')
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean);

  return values
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value));
}

function parseBrevoSenderName(env) {
  return toTrimmedString(env?.BREVO_SENDER_NAME) || 'CopyCodeAI';
}

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

  const listIds = parseBrevoListIds(env?.BREVO_LIST_IDS);

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
      ...(listIds.length > 0 ? { listIds } : {})
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

export async function sendBrevoTransactionalEmail(message, env = {}) {
  const apiKey = env?.BREVO_API_KEY;
  const senderEmail = toTrimmedString(env?.BREVO_SENDER_EMAIL);
  const senderName = parseBrevoSenderName(env);
  const recipients = toEmailRecipientList(message?.to);
  const bccRecipients = toEmailRecipientList(env?.NOTIFICATION_EMAIL_BCC);
  const subject = toTrimmedString(message?.subject);
  const textContent = toTrimmedString(message?.textContent);

  if (!apiKey) {
    throw new Error('missing_brevo_api_key');
  }

  if (!senderEmail) {
    throw new Error('missing_brevo_sender_email');
  }

  if (recipients.length === 0) {
    throw new Error('missing_notification_email_to');
  }

  if (!subject) {
    throw new Error('missing_notification_subject');
  }

  if (!textContent) {
    throw new Error('missing_notification_body');
  }

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': apiKey,
      accept: 'application/json'
    },
    body: JSON.stringify({
      sender: {
        email: senderEmail,
        name: senderName
      },
      to: recipients,
      ...(bccRecipients.length > 0 ? { bcc: bccRecipients } : {}),
      subject,
      textContent
    })
  });

  if (!response.ok) {
    throw new Error(`brevo_notification_failed_${response.status}`);
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
