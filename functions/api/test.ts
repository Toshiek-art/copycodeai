// File: src/pages/api/test.ts
import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ request }) => {
  console.log("Richiesta di test ricevuta!");
  return new Response(
    JSON.stringify({ message: "Ciao dal server!" }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
};
