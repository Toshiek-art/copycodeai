export const onRequest: PagesFunction = async ({ env }) => {
  const team = (env.CF_ACCESS_TEAM_DOMAIN || "").replace(/\/$/, "");
  const url = team ? `${team}/cdn-cgi/access/logout` : "/";
  return new Response(null, { status: 302, headers: { Location: url } });
};
