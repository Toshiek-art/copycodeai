// functions/api/ping.ts
const CORS: Record<string, string> = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET,POST,PATCH,OPTIONS",
  "access-control-allow-headers": "content-type",
};

export const onRequestOptions: PagesFunction = async () =>
  new Response(null, { status: 204, headers: CORS });

export const onRequestGet: PagesFunction = async () => {
  const body = JSON.stringify({ ok: true, version: "v3" });
  const headers = {
    "content-type": "application/json",
    ...CORS,
    "x-func-version": "v3",
  };
  return new Response(body, { status: 200, headers });
};
