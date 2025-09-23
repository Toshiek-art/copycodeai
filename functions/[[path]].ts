export const onRequestGet: PagesFunction = async (ctx) => {
  const url = new URL(ctx.request.url);
  return new Response(JSON.stringify({
    ok: true,
    caught: "catch-all",
    path: url.pathname
  }), { status: 200, headers: { "content-type": "application/json" } });
};
