import { verifySignedResourceToken } from '../../_utils/resource-access.js';
import { createAccessLockedResponse } from '../../_utils/resource-access-response.js';

const RESOURCE_SLUG = 'launch-risk-review-checklist';
const REQUEST_PATH = '/guides/launch-risk-review-checklist/';

export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const token = url.searchParams.get('token');
  const verification = await verifySignedResourceToken(token, RESOURCE_SLUG, context.env || {});

  if (verification.ok) {
    return context.next();
  }

  return createAccessLockedResponse(REQUEST_PATH, 'checklist');
}
