export const onRequestGet: PagesFunction = async () =>
  new Response(JSON.stringify({ templates: ["demos"] }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
