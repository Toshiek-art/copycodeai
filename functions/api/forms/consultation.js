import { createRedirectResponse, hasHoneypotValue, isValidEmail, isValidPhone, normalizeLeadPayload, readFormValue } from '../../_utils/form-intake.js';
import { sendBrevoTransactionalEmail, submitLead } from '../../_utils/lead-provider.js';

function hasRequiredText(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
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
  const formatValue = (value) => {
    const text = typeof value === 'string' ? value.trim() : '';
    return text || 'Not provided';
  };

  const projectBrief = typeof payload.content.message === 'string' ? payload.content.message.trim() : '';
  const greetingName = hasRequiredText(payload.contact.firstName) ? payload.contact.firstName.trim() : 'there';
  const lines = [
    `Hi ${greetingName},`,
    '',
    'Thanks for contacting CopyCode AI.',
    '',
    'We received your consultation request and will review the details shortly. If we need anything else, we will reply by email before suggesting the most useful next step.',
    '',
    'What happens next:',
    '- we review the context you shared',
    '- we check whether email is enough or a short call would help',
    '- we reply with the best next step',
    '',
    'Submission summary:',
    `Name: ${payload.contact.firstName} ${payload.contact.lastName}`.trim(),
    `Email: ${payload.contact.email}`,
    `Phone: ${formatValue(payload.contact.phone)}`,
    `Company: ${formatValue(payload.content.company)}`,
    `Website: ${formatValue(payload.content.website)}`,
    `Project brief: ${projectBrief || 'Not provided'}`
  ];

  lines.push('', 'If anything important was missing, you can simply reply to this email.', '', 'Best,', 'CopyCode AI', 'hello@copycodeai.online');

  return lines.join('\n');
}

function buildConsultationConfirmationSubject() {
  return 'We received your consultation request';
}

function buildConsultationSummaryItems(payload) {
  const formatValue = (value) => {
    const text = typeof value === 'string' ? value.trim() : '';
    return text || 'Not provided';
  };

  const projectBrief = typeof payload.content.message === 'string' ? payload.content.message.trim() : '';

  return [
    ['Name', `${payload.contact.firstName} ${payload.contact.lastName}`.trim()],
    ['Email', payload.contact.email],
    ['Phone', formatValue(payload.contact.phone)],
    ['Company', formatValue(payload.content.company)],
    ['Website', formatValue(payload.content.website)],
    ['Project brief', projectBrief || 'Not provided']
  ];
}

function buildConsultationConfirmationHtml(payload) {
  const logoUrl = 'https://copycodeai.online/logos/logo_ret_no_tag_trans.png';
  const summaryItems = buildConsultationSummaryItems(payload);
  const summaryHtml = summaryItems
    .map(([label, value]) => {
      const safeLabel = escapeHtml(label);
      const safeValue = escapeHtml(value).replaceAll('\n', '<br />');
      return `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #e5e7eb;color:#64748b;font-size:14px;vertical-align:top;width:160px;">${safeLabel}</td>
          <td style="padding:10px 0;border-bottom:1px solid #e5e7eb;color:#0f172a;font-size:14px;line-height:22px;white-space:normal;">${safeValue}</td>
        </tr>
      `;
    })
    .join('');

  return `<!doctype html>
<html lang="en">
  <body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
    <div style="max-width:640px;margin:0 auto;padding:32px 16px;">
      <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:20px;overflow:hidden;">
        <div style="padding:28px 28px 12px;text-align:center;">
          <img src="${logoUrl}" alt="CopyCode AI" width="160" style="display:block;margin:0 auto 12px;border:0;max-width:160px;height:auto;" />
          <div style="font-size:24px;line-height:32px;font-weight:700;margin:0 0 8px;">We received your request</div>
          <div style="font-size:15px;line-height:24px;color:#475569;margin:0;">
            Thanks for contacting CopyCode AI. We&apos;ll review the details shortly and reply by email before suggesting the most useful next step.
          </div>
        </div>

        <div style="padding:16px 28px 8px;">
          <div style="font-size:13px;line-height:20px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#334155;margin:0 0 10px;">What happens next</div>
          <ul style="margin:0;padding:0 0 0 18px;color:#475569;font-size:14px;line-height:22px;">
            <li style="margin:0 0 6px;">We review the context you shared.</li>
            <li style="margin:0 0 6px;">We check whether email is enough or a short call would help.</li>
            <li style="margin:0;">We reply with the best next step.</li>
          </ul>
        </div>

        <div style="padding:24px 28px 8px;">
          <div style="font-size:13px;line-height:20px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#334155;margin:0 0 12px;">Submission summary</div>
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;">
            <tbody>
              ${summaryHtml}
            </tbody>
          </table>
        </div>

        <div style="padding:20px 28px 28px;color:#475569;font-size:14px;line-height:22px;">
          <p style="margin:0 0 14px;">If anything important was missing from your first message, you can simply reply to this email.</p>
          <p style="margin:0;font-weight:700;color:#0f172a;">CopyCode AI<br /><span style="font-weight:400;color:#475569;">hello@copycodeai.online</span></p>
        </div>
      </div>
    </div>
  </body>
</html>`;
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
          subject: buildConsultationConfirmationSubject(),
          textContent: buildConsultationConfirmationText(payload),
          htmlContent: buildConsultationConfirmationHtml(payload)
        },
        context.env || {}
      );
    } catch {
      // Keep the user-facing success flow intact if the confirmation email fails.
    }
  }

  return createRedirectResponse('/contact', { contact: 'success' }, 303);
}
