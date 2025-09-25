// src/pages/api/send-email.ts
import type { APIRoute } from 'astro';
import { Resend } from 'resend';

export const prerender = false;

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

    // Body
    const { name, email, message, token } = await parseBody(request);

    // Validazioni base
    if (!name || !email || !message) {
      return new Response(JSON.stringify({ ok: false, error: 'Missing fields' }), { status: 400 });
    }
    if (!token) {
      return new Response(JSON.stringify({ ok: false, error: 'Missing Turnstile token' }), { status: 401 });
    }
    if (!TURNSTILE_SECRET_KEY) {
      return new Response(JSON.stringify({ ok: false, error: 'TURNSTILE_SECRET_KEY not set' }), { status: 500 });
    }
    if (!RESEND_API_KEY || !RESEND_FROM || !CONTACT_TO) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Email env vars not set (RESEND_API_KEY, RESEND_FROM, CONTACT_TO)' }),
        { status: 500 }
      );
    }

    // Verifica Turnstile
    const ip = request.headers.get('CF-Connecting-IP');
    const verify = await verifyTurnstile(token, ip, TURNSTILE_SECRET_KEY);

    if (!verify.success) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Turnstile failed', codes: verify['error-codes'] }),
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
      text: `From: ${name} <${email}>\n\n${message}`,
    });

    if ((result as any)?.error) {
      return new Response(
        JSON.stringify({ ok: false, stage: 'resend', error: (result as any).error?.message || 'Resend error' }),
        { status: 502 }
      );
    }

    return new Response(JSON.stringify({ ok: true, id: (result as any)?.data?.id ?? null }), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ ok: false, error: err?.message ?? 'Error' }), { status: 500 });
  }
};
