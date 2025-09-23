// /api/templates-v3 — GET list + POST create (forza versione e headers)
const send = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json", "X-Func-Version": "v3" },
  });

// GET /api/templates-v3?limit=50&q=...
export const onRequestGet: PagesFunction = async ({ env, request }) => {
  try {
    const DB = (env as any)?.DB as D1Database;
    if (!DB) return send({ version: "v3", error: "D1 binding 'DB' missing" }, 500);

    const url = new URL(request.url);
    const limitRaw = parseInt(url.searchParams.get("limit") || "50", 10);
    const limit = Number.isNaN(limitRaw) ? 50 : Math.min(Math.max(limitRaw, 1), 200);
    const q = url.searchParams.get("q");

    let stmt: D1PreparedStatement;
    if (q) {
      stmt = DB.prepare(
        "SELECT slug, title, created_at FROM templates WHERE title LIKE ?1 ORDER BY created_at DESC LIMIT ?2"
      ).bind("%" + q + "%", limit);
    } else {
      stmt = DB.prepare(
        "SELECT slug, title, created_at FROM templates ORDER BY created_at DESC LIMIT ?1"
      ).bind(limit);
    }

    const { results } = await stmt.all();
    return send({ version: "v3", results: results ?? [] });
  } catch (e: any) {
    return send({ version: "v3", error: "Unhandled error (GET)", detail: String(e?.message || e) }, 500);
  }
};

// POST /api/templates-v3
export const onRequestPost: PagesFunction = async ({ env, request }) => {
  try {
    const DB = (env as any)?.DB as D1Database;
    if (!DB) return send({ version: "v3", error: "D1 binding 'DB' missing" }, 500);

    let body: any;
    try { body = await request.json(); } catch { return send({ version: "v3", error: "Invalid JSON" }, 400); }

    const title = typeof body?.title === "string" ? body.title.trim() : "";
    if (!title) return send({ version: "v3", error: "Missing field: title" }, 400);

    // default univoci
    const slug =
      (typeof body.slug === "string" && body.slug.trim()) || crypto.randomUUID();
    const projectName =
      (typeof body.project_name === "string" && body.project_name.trim()) || slug;
    const subdomain =
      (typeof body.subdomain === "string" && body.subdomain.trim()) || slug;

    const content = typeof body.body === "string" ? body.body : null;
    const meta = body?.meta !== undefined ? JSON.stringify(body.meta) : null;

    try {
      await DB.prepare(
        "INSERT INTO templates (slug, title, project_name, subdomain, body, meta, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, strftime('%Y-%m-%dT%H:%M:%fZ','now'))"
      ).bind(slug, title, projectName, subdomain, content, meta).run();
    } catch (err: any) {
      return send({ version: "v3", error: "DB error (INSERT)", detail: String(err?.message || err) }, 500);
    }

    return send({ version: "v3", ok: true, slug }, 201);
  } catch (e: any) {
    return send({ version: "v3", error: "Unhandled error (POST)", detail: String(e?.message || e) }, 500);
  }
};

