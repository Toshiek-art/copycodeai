import { createRedirectResponse, hasHoneypotValue, isValidEmail, normalizeLeadPayload, readFormValue } from '../../../_utils/form-intake.js';
import { submitLead } from '../../../_utils/lead-provider.js';
import { getGuideDownloadBySlug } from '../../../src/data/guide-downloads.ts';

const ERROR_BASE = '/guides/';

function isSafeGuideReturnPath(value) {
  return typeof value === 'string' && /^\/guides\/[a-z0-9-]+\/?$/.test(value);
}

function resolveGuideDownload(slug) {
  return getGuideDownloadBySlug(slug) || null;
}

export async function onRequestPost(context) {
  const formData = await context.request.formData();

  const email = readFormValue(formData, 'email');
  const guideSlug = readFormValue(formData, 'guideSlug');
  const returnTo = readFormValue(formData, 'returnTo');
  const firstName = readFormValue(formData, 'firstName');
  const marketingOptIn = readFormValue(formData, 'marketingOptIn') === 'on';
  const honeypot = readFormValue(formData, 'website');

  const guide = resolveGuideDownload(guideSlug);
  const safeReturnTo = isSafeGuideReturnPath(returnTo) ? returnTo : guide?.returnTo || null;

  const errors = [];

  if (!guide) {
    errors.push('invalid_guide');
  }

  if (!email || !isValidEmail(email)) {
    errors.push('invalid_email');
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
        download: 'error',
        error: errors[0]
      },
      303
    );
  }

  const payload = normalizeLeadPayload({
    flow: 'guide_download',
    source: {
      pagePath: safeReturnTo,
      pageTitle: guide.title,
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
      guideSlug: guide.slug,
      guideTitle: guide.title,
      pdfUrl: guide.pdfUrl,
      returnTo: safeReturnTo
    },
    consent: {
      marketingOptIn,
      privacyAccepted: true
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
        download: 'error',
        error: 'submission_failed'
      },
      303
    );
  }

  return createRedirectResponse(
    safeReturnTo,
    {
      download: 'success'
    },
    303
  );
}
