import { createRedirectResponse, hasHoneypotValue, isValidEmail, isValidPhone, normalizeLeadPayload, readFormValue } from '../../_utils/form-intake.js';
import { sendBrevoTransactionalEmail, submitLead } from '../../_utils/lead-provider.js';

const calendlyBookingUrl = 'https://calendly.com/aldogustavomalasomma/15min';

function hasRequiredText(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function createExternalRedirectResponse(location, status = 303) {
  return new Response(null, {
    status,
    headers: {
      Location: location,
      'Cache-Control': 'no-store'
    }
  });
}

function buildConsultationNotificationText(payload) {
  const lines = [
    'New consultation request received from copycodeai.online',
    '',
    `Name: ${payload.contact.firstName} ${payload.contact.lastName}`.trim(),
    `Email: ${payload.contact.email}`,
    `Phone: ${payload.contact.phone}`
  ];

  if (payload.content.company) {
    lines.push(`Company: ${payload.content.company}`);
  }

  if (payload.content.website) {
    lines.push(`Website: ${payload.content.website}`);
  }

  if (payload.content.message) {
    lines.push('', 'Project brief:', payload.content.message);
  }

  lines.push(
    '',
    `Marketing opt-in: ${payload.consent.marketingOptIn ? 'yes' : 'no'}`,
    `Page: ${payload.source.pagePath}`,
    `Referrer: ${payload.source.referrer || 'n/a'}`
  );

  return lines.join('\n');
}

function buildConsultationConfirmationText(payload) {
  const lines = [
    'Thanks for reaching out to CopyCode AI.',
    '',
    'We received your consultation request and will review it as soon as possible.',
    'If we need anything else, we will reply by email.',
    '',
    `Email: ${payload.contact.email}`
  ];

  if (payload.content.company) {
    lines.push(`Company: ${payload.content.company}`);
  }

  return lines.join('\n');
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
  const submissionAction = readFormValue(formData, 'submissionAction');
  const shouldBookCall = submissionAction === 'book_call';

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

  if (
    leadResult.provider === 'brevo' &&
    context.env?.NOTIFICATION_EMAIL_TO &&
    context.env?.BREVO_SENDER_EMAIL &&
    context.env?.BREVO_API_KEY
  ) {
    try {
      await sendBrevoTransactionalEmail(
        {
          to: context.env.NOTIFICATION_EMAIL_TO,
          subject: 'New consultation request from CopyCodeAI',
          textContent: buildConsultationNotificationText(payload)
        },
        context.env || {}
      );
    } catch {
      // Keep the user-facing success flow intact if notification delivery fails.
    }
  }

  if (leadResult.provider === 'brevo' && context.env?.BREVO_SENDER_EMAIL && context.env?.BREVO_API_KEY) {
    try {
      await sendBrevoTransactionalEmail(
        {
          to: payload.contact.email,
          bcc: [],
          subject: 'We received your consultation request',
          textContent: buildConsultationConfirmationText(payload)
        },
        context.env || {}
      );
    } catch {
      // Keep the user-facing success flow intact if the confirmation email fails.
    }
  }

  if (shouldBookCall) {
    return createExternalRedirectResponse(calendlyBookingUrl, 303);
  }

  return createRedirectResponse('/contact', { contact: 'success' }, 303);
}
