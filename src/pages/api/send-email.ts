// In: src/pages/api/send-email.ts

import type { APIRoute } from 'astro';
import { Resend } from 'resend';

// Aggiungi questa riga fondamentale!
export const runtime = 'node';

// Le interfacce rimangono le stesse
interface EmailPayload {
  name: string;
  email: string;
  message: string;
  'cf-turnstile-response': string;
}

// La funzione principale, adattata per Astro
export const POST: APIRoute = async ({ request, locals }) => {
  // Le variabili d'ambiente sono in `locals.runtime.env`
  const env = locals.runtime.env;

  try {
    const payload: EmailPayload = await request.json();

    // 1. Verifica di Turnstile
    const ip = request.headers.get('CF-Connecting-IP');
    const turnstileSuccess = await verifyTurnstile(payload['cf-turnstile-response'], ip, env.TURNSTILE_SECRET_KEY);
    
    if (!turnstileSuccess) {
      return new Response('Invalid Turnstile token.', { status: 401 });
    }

    // 2. Inizializzazione di Resend
    const resend = new Resend(env.RESEND_API_KEY);

    // 3. Invio dell'email (il tuo codice qui è perfetto)
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'aldomalasomma@proton.me',
      subject: `New Contact Form Submission from ${payload.name}`,
      html: `... il tuo template HTML ...`,
    });

    // 4. Risposta di successo
    return new Response('Email sent successfully!', { status: 200 });

  } catch (error) {
    console.error('Error sending email:', error);
    return new Response('Failed to send email.', { status: 500 });
  }
};

// La funzione helper non cambia
async function verifyTurnstile(token: string, ip: string | null, secretKey: string): Promise<boolean> {
  // ... il tuo codice per verifyTurnstile è perfetto e rimane identico ...
}
