export const onRequest: PagesFunction = async ({ request }) => {
  const email = request.headers.get("CF-Access-Authenticated-User-Email") || "n/a";
  const hasJWT = request.headers.get("CF-Access-Jwt-Assertion") ? "present" : "absent";
  return new Response(JSON.stringify({ email, jwt: hasJWT }, null, 2), {
    headers: { "content-type": "application/json" },
  });
};
