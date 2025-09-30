// src/pages/api/send-email.ts
import type { APIRoute } from 'astro';
import { Resend } from 'resend';

export const prerender = false;

const logPrefix = "[api/send-email]";

type ParsedBody = {
  name: string;
  email: string;
  message: string;
  token: string; // cf-turnstile-response
};

async function parseBody(request: Request): Promise<ParsedBody> {
  const ct = request.headers.get('content-type') || '';
  if (ct.includes('application/json')) {
    const j = await request.json().catch(() => ({} as any));
    return {
      name: String(j.name ?? ''),
      email: String(j.email ?? ''),
      message: String(j.message ?? ''),
      token: String(j['cf-turnstile-response'] ?? j.token ?? ''),
    };
  } else {
    const fd = await request.formData();
    return {
      name: String(fd.get('name') ?? ''),
      email: String(fd.get('email') ?? ''),
      message: String(fd.get('message') ?? ''),
      token: String(fd.get('cf-turnstile-response') ?? ''),
    };
  }
}

async function verifyTurnstile(token: string, ip: string | null, secretKey: string) {
  const body = new URLSearchParams({ secret: secretKey, response: token });
  if (ip) body.set('remoteip', ip);

  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body,
  });

  // Ritorniamo l'oggetto completo per poter vedere gli error-codes
  return (await res.json()) as { success?: boolean; ['error-codes']?: string[] };
}

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Env: in Pages/Workers arrivano da locals.runtime.env, in dev da import.meta.env
    const env = (locals as any)?.runtime?.env ?? ({} as Record<string, string>);
    const RESEND_API_KEY       = env.RESEND_API_KEY       ?? import.meta.env.RESEND_API_KEY;
    const RESEND_FROM          = env.RESEND_FROM          ?? import.meta.env.RESEND_FROM;
    const CONTACT_TO           = env.CONTACT_TO           ?? import.meta.env.CONTACT_TO;
    const TURNSTILE_SECRET_KEY = env.TURNSTILE_SECRET_KEY ?? import.meta.env.TURNSTILE_SECRET_KEY;

    console.log(`${logPrefix} env resolved`, {
      hasResendKey: Boolean(RESEND_API_KEY),
      hasResendFrom: Boolean(RESEND_FROM),
      hasContactTo: Boolean(CONTACT_TO),
      hasTurnstileSecret: Boolean(TURNSTILE_SECRET_KEY),
    });

    // Body
    const { name, email, message, token } = await parseBody(request);
    console.log(`${logPrefix} parsed body`, { hasName: Boolean(name), hasEmail: Boolean(email), hasMessage: Boolean(message), hasToken: Boolean(token) });

    // Validazioni base
    if (!name || !email || !message) {
      console.warn(`${logPrefix} validation failed`, { stage: 'validation', reason: 'missing-fields' });
      return new Response(JSON.stringify({ ok: false, stage: 'validation', error: 'Missing fields' }), { status: 400 });
    }
    if (!token) {
      console.warn(`${logPrefix} validation failed`, { stage: 'validation', reason: 'missing-turnstile-token' });
      return new Response(JSON.stringify({ ok: false, stage: 'validation', error: 'Missing Turnstile token' }), { status: 401 });
    }
    if (!TURNSTILE_SECRET_KEY) {
      console.error(`${logPrefix} config error`, { stage: 'config', reason: 'missing-turnstile-secret' });
      return new Response(JSON.stringify({ ok: false, stage: 'config', error: 'TURNSTILE_SECRET_KEY not set' }), { status: 500 });
    }
    if (!RESEND_API_KEY || !RESEND_FROM || !CONTACT_TO) {
      console.error(`${logPrefix} config error`, { stage: 'config', reason: 'missing-resend-config', hasResendKey: Boolean(RESEND_API_KEY), hasResendFrom: Boolean(RESEND_FROM), hasContactTo: Boolean(CONTACT_TO) });
      return new Response(
        JSON.stringify({ ok: false, stage: 'config', error: 'Email env vars not set (RESEND_API_KEY, RESEND_FROM, CONTACT_TO)' }),
        { status: 500 }
      );
    }

    // Verifica Turnstile
    const ip = request.headers.get('CF-Connecting-IP');
    const verify = await verifyTurnstile(token, ip, TURNSTILE_SECRET_KEY);
    console.log(`${logPrefix} turnstile verify`, { success: verify?.success ?? false, codes: verify['error-codes'] });

    if (!verify.success) {
      console.warn(`${logPrefix} turnstile failed`, { stage: 'turnstile', codes: verify['error-codes'] });
      return new Response(
        JSON.stringify({ ok: false, stage: 'turnstile', error: 'Turnstile failed', codes: verify['error-codes'] }),
        { status: 403 }
      );
    }

    // Invio email con Resend (ritorna id o errore)
    const resend = new Resend(RESEND_API_KEY);
    const result = await resend.emails.send({
      from: RESEND_FROM,      // dominio verificato
      to: CONTACT_TO,         // la tua casella
      reply_to: email,
      subject: `New contact from ${name}`,
      text: `From: ${name} <${email}>\n\n${message}`
    });

    const resendError = (result as any)?.error?.message ?? null;
    const resendId = (result as any)?.data?.id ?? null;
    console.log(`${logPrefix} resend response`, { hasError: Boolean(resendError), resendId });

    if (resendError) {
      console.error(`${logPrefix} resend failed`, { stage: 'resend', error: resendError });
      return new Response(
        JSON.stringify({ ok: false, stage: 'resend', error: resendError || 'Resend error' }),
        { status: 502 }
      );
    }

    console.log(`${logPrefix} email sent`, { resendId });
    return new Response(JSON.stringify({ ok: true, stage: 'success', id: resendId }), { status: 200 });
  } catch (err: any) {
    console.error(`${logPrefix} unhandled exception`, err);
    return new Response(JSON.stringify({ ok: false, stage: 'exception', error: err?.message ?? 'Error' }), { status: 500 });
  }
};
