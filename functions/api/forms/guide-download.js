import { createRedirectResponse, hasHoneypotValue, isValidEmail, normalizeLeadPayload, readFormValue } from '../../_utils/form-intake.js';
import { sendBrevoTransactionalEmail, submitLead } from '../../_utils/lead-provider.js';
import { createSignedResourceToken } from '../../_utils/resource-access.js';
import { getGuideBySlug } from '../../../src/data/guides.ts';
import { getGuideDownloadBySlug } from '../../../src/data/guide-downloads.ts';

const ERROR_BASE = '/guides/';
const GUIDE_REQUEST_SLUG = 'launch-risk-review-checklist';
const GUIDE_REQUEST_VIEW_PATH = '/guides/launch-risk-review-checklist/view/';
const RESOURCE_ACCESS_TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7;

function isSafeGuideReturnPath(value) {
  return typeof value === 'string' && /^\/guides\/[a-z0-9-]+\/?$/.test(value);
}

function resolveGuideDownload(slug) {
  return getGuideDownloadBySlug(slug) || null;
}

function resolveGuideRequest(slug) {
  return getGuideBySlug(slug) || null;
}

function getGuideViewPath(slug) {
  return slug === GUIDE_REQUEST_SLUG ? GUIDE_REQUEST_VIEW_PATH : `/guides/${slug}/view/`;
}

function buildGuideRequestEmailText(guide, accessUrl) {
  if (guide.slug === GUIDE_REQUEST_SLUG) {
    return [
      'Your Launch Risk Review Checklist',
      '',
      'Thanks for requesting the checklist.',
      '',
      'Open the full checklist here:',
      accessUrl,
      '',
      'If the link expires, request a new copy from the checklist page.',
      '',
      'This checklist is a short pre-launch review for websites, forms, consent and tracking, booking/contact flows, accessibility-sensitive journeys, ecommerce paths, and AI touchpoints where relevant.',
      '',
      'Best,',
      'CopyCode AI',
      'hello@copycodeai.online'
    ].join('\n');
  }

  return [
    `Your ${guide.title}`,
    '',
    `Thanks for requesting the guide.`,
    '',
    'Open the full guide here:',
    accessUrl,
    '',
    'If the link expires, request a new copy from the guide page.',
    '',
    guide.description,
    '',
    'Best,',
    'CopyCode AI',
    'hello@copycodeai.online'
  ].join('\n');
}

function buildGuideRequestEmailHtml(guide, accessUrl) {
  if (guide.slug === GUIDE_REQUEST_SLUG) {
    return `<!doctype html>
<html lang="en">
  <body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
    <div style="max-width:640px;margin:0 auto;padding:32px 16px;">
      <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:20px;padding:28px;">
        <p style="margin:0 0 10px;font-size:12px;line-height:18px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#334155;">CopyCode AI</p>
        <h1 style="margin:0 0 12px;font-size:24px;line-height:32px;font-weight:700;">Your Launch Risk Review Checklist</h1>
        <p style="margin:0 0 20px;font-size:15px;line-height:24px;color:#475569;">Thanks for requesting the checklist.</p>
        <p style="margin:0 0 20px;">
          <a href="${accessUrl}" style="display:inline-block;border-radius:12px;background:#2563eb;color:#ffffff;text-decoration:none;padding:12px 18px;font-size:14px;font-weight:700;">Open the full checklist</a>
        </p>
        <p style="margin:0;font-size:14px;line-height:22px;color:#475569;">
          It is a short pre-launch review for websites, forms, consent and tracking, booking/contact flows, accessibility-sensitive journeys, ecommerce paths, and AI touchpoints where relevant.
        </p>
        <p style="margin:14px 0 0;font-size:14px;line-height:22px;color:#475569;">If the link expires, request a new copy from the checklist page.</p>
        <p style="margin:20px 0 0;font-size:14px;line-height:22px;color:#0f172a;font-weight:700;">
          CopyCode AI<br /><span style="font-weight:400;color:#475569;">hello@copycodeai.online</span>
        </p>
      </div>
    </div>
  </body>
</html>`;
  }

  return `<!doctype html>
<html lang="en">
  <body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
    <div style="max-width:640px;margin:0 auto;padding:32px 16px;">
      <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:20px;padding:28px;">
        <p style="margin:0 0 10px;font-size:12px;line-height:18px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#334155;">CopyCode AI</p>
        <h1 style="margin:0 0 12px;font-size:24px;line-height:32px;font-weight:700;">Your ${guide.title}</h1>
        <p style="margin:0 0 20px;font-size:15px;line-height:24px;color:#475569;">Thanks for requesting the guide.</p>
        <p style="margin:0 0 20px;">
          <a href="${accessUrl}" style="display:inline-block;border-radius:12px;background:#2563eb;color:#ffffff;text-decoration:none;padding:12px 18px;font-size:14px;font-weight:700;">Open the full guide</a>
        </p>
        <p style="margin:0;font-size:14px;line-height:22px;color:#475569;">
          ${guide.description}
        </p>
        <p style="margin:14px 0 0;font-size:14px;line-height:22px;color:#475569;">If the link expires, request a new copy from the guide page.</p>
        <p style="margin:20px 0 0;font-size:14px;line-height:22px;color:#0f172a;font-weight:700;">
          CopyCode AI<br /><span style="font-weight:400;color:#475569;">hello@copycodeai.online</span>
        </p>
      </div>
    </div>
  </body>
</html>`;
}

async function handleGuideRequest(context, formData, guideRequest, safeReturnTo, email, firstName, honeypot, renew) {
  const resourceConsent = readFormValue(formData, 'resourceConsent') === 'on';
  const newsletterOptIn = readFormValue(formData, 'newsletterOptIn') === 'on';
  const errors = [];

  if (!guideRequest) {
    errors.push('invalid_guide');
  }

  if (!email || !isValidEmail(email)) {
    errors.push('invalid_email');
  }

  if (!resourceConsent) {
    errors.push('resource_consent_missing');
  }

  if (!safeReturnTo) {
    errors.push('invalid_return_to');
  }

  if (hasHoneypotValue(formData, 'website') || honeypot) {
    errors.push('honeypot_triggered');
  }

  if (errors.length > 0) {
    return createRedirectResponse(
      safeReturnTo || ERROR_BASE,
      {
        resource: 'error',
        renew: renew ? '1' : undefined,
        error: errors[0]
      },
      303
    );
  }

  const payload = normalizeLeadPayload({
    flow: 'guide_request',
    source: {
      pagePath: safeReturnTo,
      pageTitle: guideRequest.title,
      referrer: context.request.headers.get('Referer') || '',
      utmSource: '',
      utmMedium: '',
      utmCampaign: '',
      leadSource: 'guide_request'
    },
    contact: {
      firstName,
      lastName: '',
      email,
      phone: ''
    },
    content: {
      guideSlug: guideRequest.slug,
      guideTitle: guideRequest.title,
      resourceSlug: guideRequest.slug,
      resourceTitle: guideRequest.title,
      resourceUrl: getGuideViewPath(guideRequest.slug),
      returnTo: safeReturnTo
    },
    consent: {
      marketingOptIn: newsletterOptIn,
      privacyAccepted: resourceConsent,
      newsletterOptIn,
      resourceConsent
    },
    antiSpam: {
      honeypot
    }
  });

  const leadResult = await submitLead(payload, context.env || {});

  if (!leadResult.ok) {
    return createRedirectResponse(
      safeReturnTo,
      {
        resource: 'error',
        renew: renew ? '1' : undefined,
        error: 'submission_failed'
      },
      303
    );
  }

  if (leadResult.provider !== 'brevo' || !context.env?.BREVO_SENDER_EMAIL || !context.env?.BREVO_API_KEY) {
    return createRedirectResponse(
      safeReturnTo,
      {
        resource: 'error',
        renew: renew ? '1' : undefined,
        error: 'submission_failed'
      },
      303
    );
  }

  let accessToken;

  try {
    accessToken = await createSignedResourceToken(
      {
        email,
        resourceSlug: guideRequest.slug,
        ttlSeconds: RESOURCE_ACCESS_TOKEN_TTL_SECONDS
      },
      context.env || {}
    );
  } catch {
    return createRedirectResponse(
      safeReturnTo,
      {
        resource: 'error',
        renew: renew ? '1' : undefined,
        error: 'submission_failed'
      },
      303
    );
  }

  const accessUrl = new URL(GUIDE_REQUEST_VIEW_PATH, 'https://copycodeai.online');
  accessUrl.pathname = getGuideViewPath(guideRequest.slug);
  accessUrl.searchParams.set('token', accessToken);
  const emailSubject = guideRequest.slug === GUIDE_REQUEST_SLUG ? 'Your Launch Risk Review Checklist' : `Your ${guideRequest.title}`;

  try {
    await sendBrevoTransactionalEmail(
      {
        to: email,
        bcc: [],
        subject: emailSubject,
        textContent: buildGuideRequestEmailText(guideRequest, accessUrl.toString()),
        htmlContent: buildGuideRequestEmailHtml(guideRequest, accessUrl.toString())
      },
      context.env || {}
    );
  } catch {
    return createRedirectResponse(
      safeReturnTo,
      {
        resource: 'error',
        renew: renew ? '1' : undefined,
        error: 'submission_failed'
      },
      303
    );
  }

  return createRedirectResponse(
    safeReturnTo,
    {
      resource: 'success',
      renew: renew ? '1' : undefined
    },
    303
  );
}

export async function onRequestPost(context) {
  const formData = await context.request.formData();

  const email = readFormValue(formData, 'email');
  const guideSlug = readFormValue(formData, 'guideSlug');
  const returnTo = readFormValue(formData, 'returnTo');
  const renew = readFormValue(formData, 'renew') === '1';
  const firstName = readFormValue(formData, 'firstName');
  const resourceConsent = readFormValue(formData, 'resourceConsent') === 'on';
  const newsletterOptIn = readFormValue(formData, 'newsletterOptIn') === 'on';
  const honeypot = readFormValue(formData, 'website');

  const guideDownload = resolveGuideDownload(guideSlug);
  const guideRequest = resolveGuideRequest(guideSlug);
  const safeReturnTo = isSafeGuideReturnPath(returnTo) ? returnTo : guideDownload?.returnTo || guideRequest?.href || null;

  if (guideRequest) {
    return handleGuideRequest(context, formData, guideRequest, safeReturnTo, email, firstName, honeypot, renew);
  }

  const errors = [];

  if (!guideDownload) {
    errors.push('invalid_guide');
  }

  if (!email || !isValidEmail(email)) {
    errors.push('invalid_email');
  }

  if (!safeReturnTo) {
    errors.push('invalid_return_to');
  }

  if (!resourceConsent) {
    errors.push('resource_consent_missing');
  }

  if (hasHoneypotValue(formData, 'website') || honeypot) {
    errors.push('honeypot_triggered');
  }

  if (errors.length > 0) {
    return createRedirectResponse(
      safeReturnTo || ERROR_BASE,
      {
        resource: 'error',
        renew: renew ? '1' : undefined,
        error: errors[0]
      },
      303
    );
  }

  const payload = normalizeLeadPayload({
    flow: 'guide_download',
    source: {
      pagePath: safeReturnTo,
      pageTitle: guideDownload.title,
      referrer: context.request.headers.get('Referer') || '',
      utmSource: '',
      utmMedium: '',
      utmCampaign: ''
    },
    contact: {
      firstName,
      lastName: '',
      email,
      phone: ''
    },
    content: {
      guideSlug: guideDownload.slug,
      guideTitle: guideDownload.title,
      pdfUrl: guideDownload.pdfUrl,
      returnTo: safeReturnTo
    },
    consent: {
      marketingOptIn: newsletterOptIn,
      privacyAccepted: resourceConsent,
      newsletterOptIn,
      resourceConsent
    },
    antiSpam: {
      honeypot
    }
  });

  const leadResult = await submitLead(payload, context.env || {});

  if (!leadResult.ok) {
    return createRedirectResponse(
      safeReturnTo,
      {
        resource: 'error',
        renew: renew ? '1' : undefined,
        error: 'submission_failed'
      },
      303
    );
  }

  if (leadResult.provider !== 'brevo' || !context.env?.BREVO_SENDER_EMAIL || !context.env?.BREVO_API_KEY) {
    return createRedirectResponse(
      safeReturnTo,
      {
        resource: 'error',
        renew: renew ? '1' : undefined,
        error: 'submission_failed'
      },
      303
    );
  }

  let accessToken;

  try {
    accessToken = await createSignedResourceToken(
      {
        email,
        resourceSlug: guideDownload.slug,
        ttlSeconds: RESOURCE_ACCESS_TOKEN_TTL_SECONDS
      },
      context.env || {}
    );
  } catch {
    return createRedirectResponse(
      safeReturnTo,
      {
        resource: 'error',
        renew: renew ? '1' : undefined,
        error: 'submission_failed'
      },
      303
    );
  }

  const accessUrl = new URL(getGuideViewPath(guideDownload.slug), 'https://copycodeai.online');
  accessUrl.searchParams.set('token', accessToken);

  try {
    await sendBrevoTransactionalEmail(
      {
        to: email,
        bcc: [],
        subject: `Your ${guideDownload.title}`,
        textContent: [
          `Your ${guideDownload.title}`,
          '',
          'Thanks for requesting the guide.',
          '',
          'Open the full guide here:',
          accessUrl.toString(),
          '',
          'If the link expires, request a new copy from the guide page.',
          '',
          'Best,',
          'CopyCode AI',
          'hello@copycodeai.online'
        ].join('\n'),
        htmlContent: `<!doctype html>
<html lang="en">
  <body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
    <div style="max-width:640px;margin:0 auto;padding:32px 16px;">
      <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:20px;padding:28px;">
        <p style="margin:0 0 10px;font-size:12px;line-height:18px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#334155;">CopyCode AI</p>
        <h1 style="margin:0 0 12px;font-size:24px;line-height:32px;font-weight:700;">Your ${guideDownload.title}</h1>
        <p style="margin:0 0 20px;font-size:15px;line-height:24px;color:#475569;">Thanks for requesting the guide.</p>
        <p style="margin:0 0 20px;">
          <a href="${accessUrl}" style="display:inline-block;border-radius:12px;background:#2563eb;color:#ffffff;text-decoration:none;padding:12px 18px;font-size:14px;font-weight:700;">Open the full guide</a>
        </p>
        <p style="margin:0;font-size:14px;line-height:22px;color:#475569;">If the link expires, request a new copy from the guide page.</p>
        <p style="margin:20px 0 0;font-size:14px;line-height:22px;color:#0f172a;font-weight:700;">
          CopyCode AI<br /><span style="font-weight:400;color:#475569;">hello@copycodeai.online</span>
        </p>
      </div>
    </div>
  </body>
</html>`
      },
      context.env || {}
    );
  } catch {
    return createRedirectResponse(
      safeReturnTo,
      {
        resource: 'error',
        renew: renew ? '1' : undefined,
        error: 'submission_failed'
      },
      303
    );
  }

  return createRedirectResponse(
    safeReturnTo,
    {
      resource: 'success',
      renew: renew ? '1' : undefined
    },
    303
  );
}
