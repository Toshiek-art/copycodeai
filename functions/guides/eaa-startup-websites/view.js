import { verifySignedResourceToken } from '../../_utils/resource-access.js';
import { createAccessLockedResponse } from '../../_utils/resource-access-response.js';

const RESOURCE_SLUG = 'eaa-startup-websites';
const REQUEST_PATH = '/guides/eaa-startup-websites/';

export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const token = url.searchParams.get('token');
  const verification = await verifySignedResourceToken(token, RESOURCE_SLUG, context.env || {});

  if (verification.ok) {
    return context.next();
  }

  return createAccessLockedResponse(REQUEST_PATH, 'guide');
}
