export const onRequest: PagesFunction = async ({ request, env }) => {
  const url = new URL(request.url);
  const team = (env.CF_ACCESS_TEAM_DOMAIN || "").replace(/\/$/, ""); // es: https://tuo-team.cloudflareaccess.com
  const aud = env.CF_ACCESS_AUD || "";
  if (!team || !aud) {
    return new Response("Missing CF_ACCESS_TEAM_DOMAIN or CF_ACCESS_AUD", { status: 500 });
  }
  const redirectURL = new URL("/admin/", url.origin).toString();
  const loginURL = `${team}/cdn-cgi/access/login?redirect_url=${encodeURIComponent(redirectURL)}&aud=${encodeURIComponent(aud)}`;
  return new Response(null, { status: 302, headers: { Location: loginURL } });
};
