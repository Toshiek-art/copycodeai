// functions/_middleware.ts

// --- CORS condiviso ---
const CORS: Record<string, string> = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET,POST,PATCH,OPTIONS",
  "access-control-allow-headers": "content-type",
};

// preserva tutti gli header esistenti e aggiunge CORS + extra
function withCors(res: Response, extra: Record<string, string> = {}): Response {
  const headers = new Headers(res.headers);
  for (const [k, v] of Object.entries(CORS)) headers.set(k, v);
  for (const [k, v] of Object.entries(extra)) headers.set(k, v);
  return new Response(res.body, { status: res.status, headers });
}

export const onRequest: PagesFunction = async ({ request, next }) => {
  const url = new URL(request.url);

  // 1) Risposta immediata per OPTIONS (globale, prima di tutto)
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS });
  }

  // 2) GATE /admin (logica esistente, invariata)
  if (url.pathname.startsWith("/admin")) {
    // Pagine pubbliche sotto /admin
    if (
      url.pathname.startsWith("/admin/login") ||
      url.pathname.startsWith("/admin/access") ||
      url.pathname.startsWith("/admin/logout") ||
      url.pathname.startsWith("/admin/_debug")
    ) {
      const res = await next();
      // anche per queste risposte, aggiungiamo CORS + versione
      return withCors(res, { "x-func-version": "v3" });
    }

    // Se Access ha autenticato, avrai header o cookie
    const hasHeader = !!request.headers.get("CF-Access-Jwt-Assertion");
    const hasCookie = (request.headers.get("Cookie") || "").includes("CF_Authorization=");

    if (!hasHeader && !hasCookie) {
      // redirect come prima, ma con CORS
      return withCors(
        new Response(null, { status: 302, headers: { Location: "/admin/login" } })
      );
    }

    // già autenticato → passa
    const res = await next();
    return withCors(res, { "x-func-version": "v3" });
  }

  // 3) Tutto il resto dell’app (non /admin) → passa e aggiungi CORS + versione
  const res = await next();
  return withCors(res, { "x-func-version": "v3" });
};
