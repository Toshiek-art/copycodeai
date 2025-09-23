// In: functions/api/send-email.ts

import { Resend } from 'resend';

// Interfaccia per definire la struttura dei dati che ci aspettiamo dal frontend
interface EmailPayload {
  name: string;
  email: string;
  message: string;
  'cf-turnstile-response': string; // Token di Turnstile
}

// Interfaccia per definire la struttura delle variabili d'ambiente
interface Env {
  RESEND_API_KEY: string;
  TURNSTILE_SECRET_KEY: string;
}

// La funzione principale che viene eseguita da Cloudflare
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const payload: EmailPayload = await request.json();

    // 1. Verifica del token di Turnstile
    const turnstileSuccess = await verifyTurnstile(payload['cf-turnstile-response'], request.headers.get('CF-Connecting-IP'), env.TURNSTILE_SECRET_KEY);
    
    if (!turnstileSuccess) {
      return new Response('Invalid Turnstile token.', { status: 401 });
    }

    // 2. Inizializzazione del client di Resend
    const resend = new Resend(env.RESEND_API_KEY);

    // 3. Invio dell'email
    await resend.emails.send({
      from: 'onboarding@resend.dev', // Indirizzo predefinito di Resend (non cambiarlo)
      to: 'aldomalasomma@proton.me', // <-- MODIFICA QUI con la tua email verificata su Resend
      subject: `New Contact Form Submission from ${payload.name}`,
      html: `
        <h1>New Message from your Portfolio</h1>
        <p><strong>Name:</strong> ${payload.name}</p>
        <p><strong>Email:</strong> ${payload.email}</p>
        <hr>
        <p><strong>Message:</strong></p>
        <p>${payload.message}</p>
      `,
    });

    // 4. Risposta di successo al frontend
    return new Response('Email sent successfully!', { status: 200 });

  } catch (error) {
    console.error('Error sending email:', error);
    return new Response('Failed to send email.', { status: 500 });
  }
};

// Funzione helper per verificare il token di Turnstile
async function verifyTurnstile(token: string, ip: string | null, secretKey: string): Promise<boolean> {
  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      secret: secretKey,
      response: token,
      remoteip: ip,
    } ),
  });

  const data = await response.json();
  return data.success;
}
