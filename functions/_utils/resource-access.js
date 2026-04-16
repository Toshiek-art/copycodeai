const DEFAULT_RESOURCE_ACCESS_TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7;

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

function trimString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function getCrypto() {
  const subtle = globalThis.crypto?.subtle;

  if (!subtle) {
    throw new Error('crypto_unavailable');
  }

  return subtle;
}

function bytesToBase64Url(bytes) {
  let binary = '';

  for (let index = 0; index < bytes.length; index += 1) {
    binary += String.fromCharCode(bytes[index]);
  }

  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function base64UrlToBytes(value) {
  const normalized = String(value || '').replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

function bytesToUtf8(bytes) {
  return textDecoder.decode(bytes);
}

function utf8ToBytes(value) {
  return textEncoder.encode(value);
}

function constantTimeEqual(left, right) {
  if (left.length !== right.length) {
    return false;
  }

  let mismatch = 0;

  for (let index = 0; index < left.length; index += 1) {
    mismatch |= left[index] ^ right[index];
  }

  return mismatch === 0;
}

export function getResourceAccessSecret(env = {}) {
  return trimString(env?.RESOURCE_ACCESS_SECRET);
}

export function normalizeResourceAccessClaims(input = {}) {
  const email = trimString(input.email).toLowerCase();
  const resourceSlug = trimString(input.resourceSlug);
  const exp = Number(input.exp);

  return {
    email,
    resourceSlug,
    exp: Number.isFinite(exp) ? Math.floor(exp) : 0
  };
}

async function signResourceAccessPayload(payload, secret) {
  const key = await getCrypto().importKey(
    'raw',
    utf8ToBytes(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await getCrypto().sign('HMAC', key, utf8ToBytes(payload));
  return bytesToBase64Url(new Uint8Array(signature));
}

async function verifyResourceAccessSignature(payload, signature, secret) {
  try {
    const expectedSignature = await signResourceAccessPayload(payload, secret);
    const expectedBytes = base64UrlToBytes(expectedSignature);
    const providedBytes = base64UrlToBytes(signature);

    return constantTimeEqual(expectedBytes, providedBytes);
  } catch {
    return false;
  }
}

export async function createSignedResourceToken(input = {}, envOrSecret = {}) {
  const claims = normalizeResourceAccessClaims(input);
  const secret = typeof envOrSecret === 'string' ? trimString(envOrSecret) : getResourceAccessSecret(envOrSecret);
  const ttlSeconds = Number.isFinite(Number(input.ttlSeconds))
    ? Number(input.ttlSeconds)
    : DEFAULT_RESOURCE_ACCESS_TOKEN_TTL_SECONDS;
  const exp = claims.exp || Math.floor(Date.now() / 1000) + Math.max(1, Math.floor(ttlSeconds));

  if (!secret) {
    throw new Error('missing_resource_access_secret');
  }

  if (!claims.email) {
    throw new Error('missing_resource_access_email');
  }

  if (!claims.resourceSlug) {
    throw new Error('missing_resource_access_resource_slug');
  }

  const payload = JSON.stringify({
    email: claims.email,
    resourceSlug: claims.resourceSlug,
    exp
  });
  const signature = await signResourceAccessPayload(payload, secret);

  return `${bytesToBase64Url(utf8ToBytes(payload))}.${signature}`;
}

export async function verifySignedResourceToken(token, expectedResourceSlug, envOrSecret = {}) {
  if (!token) {
    return {
      ok: false,
      error: 'missing_token'
    };
  }

  const secret = typeof envOrSecret === 'string' ? trimString(envOrSecret) : getResourceAccessSecret(envOrSecret);

  if (!secret) {
    return {
      ok: false,
      error: 'missing_resource_access_secret'
    };
  }

  const tokenParts = String(token).split('.');

  if (tokenParts.length !== 2) {
    return {
      ok: false,
      error: 'invalid_signature'
    };
  }

  const [encodedPayload, signature] = tokenParts;

  let payload;

  try {
    payload = bytesToUtf8(base64UrlToBytes(encodedPayload));
  } catch {
    return {
      ok: false,
      error: 'invalid_signature'
    };
  }

  let claims;

  try {
    claims = normalizeResourceAccessClaims(JSON.parse(payload));
  } catch {
    return {
      ok: false,
      error: 'invalid_signature'
    };
  }

  if (!claims.email || !claims.resourceSlug || !claims.exp) {
    return {
      ok: false,
      error: 'invalid_signature'
    };
  }

  const signatureValid = await verifyResourceAccessSignature(payload, signature, secret);

  if (!signatureValid) {
    return {
      ok: false,
      error: 'invalid_signature'
    };
  }

  const now = Math.floor(Date.now() / 1000);

  if (claims.exp <= now) {
    return {
      ok: false,
      error: 'expired_token'
    };
  }

  if (expectedResourceSlug && claims.resourceSlug !== trimString(expectedResourceSlug)) {
    return {
      ok: false,
      error: 'resource_mismatch'
    };
  }

  return {
    ok: true,
    claims
  };
}

export { DEFAULT_RESOURCE_ACCESS_TOKEN_TTL_SECONDS };
