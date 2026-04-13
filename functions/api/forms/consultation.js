import { createRedirectResponse, hasHoneypotValue, isValidEmail, isValidPhone, normalizeLeadPayload, readFormValue } from '../../_utils/form-intake.js';
import { submitLead } from '../../_utils/lead-provider.js';

function hasRequiredText(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

export async function onRequestPost(context) {
  const formData = await context.request.formData();

  const firstName = readFormValue(formData, 'firstName');
  const lastName = readFormValue(formData, 'lastName');
  const email = readFormValue(formData, 'email');
  const phone = readFormValue(formData, 'phone');
  const company = readFormValue(formData, 'company');
  const website = readFormValue(formData, 'website');
  const message = readFormValue(formData, 'message');
  const marketingOptIn = readFormValue(formData, 'marketingOptIn') === 'on';
  const privacyAccepted = readFormValue(formData, 'privacyAccepted') !== 'false';
  const honeypot = readFormValue(formData, 'websiteHp');

  const errors = [];

  if (!hasRequiredText(firstName)) {
    errors.push('missing_first_name');
  }

  if (!hasRequiredText(lastName)) {
    errors.push('missing_last_name');
  }

  if (!email || !isValidEmail(email)) {
    errors.push('invalid_email');
  }

  if (!phone || !isValidPhone(phone)) {
    errors.push('invalid_phone');
  }

  if (hasHoneypotValue(formData, 'websiteHp') || honeypot) {
    errors.push('honeypot_triggered');
  }

  if (!privacyAccepted) {
    errors.push('privacy_not_accepted');
  }

  if (errors.length > 0) {
    return createRedirectResponse('/contact', { contact: 'error', error: errors[0] }, 303);
  }

  const payload = normalizeLeadPayload({
    flow: 'consultation',
    source: {
      pagePath: '/contact',
      pageTitle: 'Contact | CopyCodeAI',
      referrer: context.request.headers.get('Referer') || '',
      utmSource: '',
      utmMedium: '',
      utmCampaign: ''
    },
    contact: {
      firstName,
      lastName,
      email,
      phone
    },
    content: {
      company,
      website,
      message
    },
    consent: {
      marketingOptIn,
      privacyAccepted
    },
    antiSpam: {
      honeypot
    }
  });

  const leadResult = await submitLead(payload, context.env || {});

  if (!leadResult.ok) {
    return createRedirectResponse('/contact', { contact: 'error', error: 'submission_failed' }, 303);
  }

  return createRedirectResponse('/contact', { contact: 'success' }, 303);
}
