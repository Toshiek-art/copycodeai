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

  // 2) GATE per /admin/*
  if (url.pathname.startsWith("/admin")) {
    // Se Access ha autenticato, troverai header o cookie
    const hasHeader = !!request.headers.get("CF-Access-Jwt-Assertion");
    const cookie = request.headers.get("Cookie") || "";
    const hasCookie = cookie.includes("CF_Authorization=");

    if (!hasHeader && !hasCookie) {
      // Redirect a Cloudflare Access login
      const loginUrl = new URL("/cdn-cgi/access/login", url.origin);
      loginUrl.searchParams.set("redirect_url", url.toString());

      return withCors(
        new Response(null, {
          status: 302,
          headers: { Location: loginUrl.toString() },
        })
      );
    }

    // già autenticato → passa
    const res = await next();
    return withCors(res, { "x-func-version": "v4" });
  }

  // 3) Tutto il resto dell’app → passa e aggiungi CORS + versione
  const res = await next();
  return withCors(res, { "x-func-version": "v4" });
};
