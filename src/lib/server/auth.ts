import { webcrypto as nodeWebCrypto } from 'node:crypto';

const encoder = new TextEncoder();

function getCrypto(): Crypto {
  if (globalThis.crypto?.subtle) return globalThis.crypto as Crypto;
  if (nodeWebCrypto?.subtle) return nodeWebCrypto as unknown as Crypto;
  throw new Error('Web Crypto API not available');
}

function base64UrlEncode(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return Buffer.from(binary, 'binary')
    .toString('base64')
    .replace(/=+$/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecode(input: string): Uint8Array {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  const padLength = (4 - (normalized.length % 4)) % 4;
  const padded = normalized + '='.repeat(padLength);
  const binary = Buffer.from(padded, 'base64').toString('binary');
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function derivePBKDF2(password: string, salt: Uint8Array, iterations: number): Promise<ArrayBuffer> {
  const crypto = getCrypto();
  const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
  return crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
    key,
    256,
  );
}

export const PASSWORD_SCHEME = 'pbkdf2-sha256';

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  if (!storedHash) return false;
  const [scheme, iterationsRaw, saltPart, hashPart] = storedHash.split('$');
  if (scheme !== PASSWORD_SCHEME) return false;
  const iterations = Number(iterationsRaw);
  if (!iterations || !saltPart || !hashPart) return false;
  const salt = base64UrlDecode(saltPart);
  const derived = await derivePBKDF2(password, salt, iterations);
  const expected = base64UrlDecode(hashPart);
  const derivedBytes = new Uint8Array(derived);
  if (derivedBytes.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < derivedBytes.length; i++) diff |= derivedBytes[i] ^ expected[i];
  return diff === 0;
}

export type SessionPayload = {
  sub: string;
  exp: number;
};

export const SESSION_COOKIE_NAME = 'ccai_admin_session';
export const SESSION_TTL_SECONDS = 60 * 60 * 8; // 8 hours

async function importHmacKey(secret: string) {
  const crypto = getCrypto();
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );
}

export async function createSessionToken(secret: string, payload: SessionPayload): Promise<string> {
  const crypto = getCrypto();
  const key = await importHmacKey(secret);
  const payloadJson = JSON.stringify(payload);
  const payloadBytes = encoder.encode(payloadJson);
  const payloadEncoded = base64UrlEncode(payloadBytes);
  const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(payloadEncoded));
  const signature = base64UrlEncode(signatureBuffer);
  return `${payloadEncoded}.${signature}`;
}

export async function verifySessionToken(secret: string, token: string): Promise<SessionPayload | null> {
  if (!token) return null;
  const [payloadEncoded, signatureEncoded] = token.split('.');
  if (!payloadEncoded || !signatureEncoded) return null;
  const crypto = getCrypto();
  const key = await importHmacKey(secret);
  const signature = base64UrlDecode(signatureEncoded);
  const valid = await crypto.subtle.verify('HMAC', key, signature, encoder.encode(payloadEncoded));
  if (!valid) return null;
  const payloadBytes = base64UrlDecode(payloadEncoded);
  const payloadJson = Buffer.from(payloadBytes).toString('utf-8');
  const payload = JSON.parse(payloadJson) as SessionPayload;
  if (typeof payload.exp !== 'number' || typeof payload.sub !== 'string') return null;
  if (payload.exp * 1000 < Date.now()) return null;
  return payload;
}

export function parseCookies(header: string | null | undefined): Record<string, string> {
  const result: Record<string, string> = {};
  if (!header) return result;
  const parts = header.split(';');
  for (const part of parts) {
    const [name, ...rest] = part.trim().split('=');
    if (!name) continue;
    const value = rest.join('=');
    if (value) result[name] = value;
  }
  return result;
}

type CookieOptions = {
  secure?: boolean;
};

export function buildSessionCookie(token: string, maxAgeSeconds: number, options: CookieOptions = {}): string {
  const secure = options.secure ?? true;
  const expires = new Date(Date.now() + maxAgeSeconds * 1000).toUTCString();
  let cookie = `${SESSION_COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAgeSeconds}; Expires=${expires}`;
  if (secure) cookie += '; Secure';
  return cookie;
}

export function clearSessionCookie(options: CookieOptions = {}): string {
  const secure = options.secure ?? true;
  let cookie = `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  if (secure) cookie += '; Secure';
  return cookie;
}

export const PROTECTED_PATHS = ['/admin', '/studio'];

export function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PATHS.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export function isPublicPath(pathname: string): boolean {
  if (!pathname.startsWith('/admin') && !pathname.startsWith('/studio')) return true;
  return (
    pathname === '/admin/login' ||
    pathname === '/admin/logout' ||
    pathname === '/admin/login/' ||
    pathname === '/admin/logout/'
  );
}
