const send = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json" } });

export const onRequestGet: PagesFunction = async ({ env, params }) => {
  try {
    const DB = (env as any)?.DB as D1Database;
    if (!DB) return send({ error: "D1 binding 'DB' missing" }, 500);
    const slug = String(params?.slug || "");

    const row = await DB.prepare(
      "SELECT slug, title, body, meta, project_name, subdomain, status, created_at, updated_at FROM templates WHERE slug=?1"
    ).bind(slug).first();
    return row ? send(row) : send({ error: "Not found" }, 404);
  } catch (e: any) {
    return send({ error: "Unhandled error (GET one)", detail: String(e?.message || e) }, 500);
  }
};

export const onRequestPatch: PagesFunction = async ({ env, params, request }) => {
  try {
    const DB = (env as any)?.DB as D1Database;
    if (!DB) return send({ error: "D1 binding 'DB' missing" }, 500);
    const slug = String(params?.slug || "");

    let body: any; try { body = await request.json(); } catch { return send({ error: "Invalid JSON" }, 400); }

    const fields: string[] = [];
    const binds: any[] = [];

    if (typeof body.title === "string")                    { fields.push("title=?"        + (fields.length+1)); binds.push(body.title.trim()); }
    if (typeof body.body === "string" || body.body === null) { fields.push("body=?"      + (fields.length+1)); binds.push(body.body ?? null); }
    if (body.meta !== undefined)                           { fields.push("meta=?"         + (fields.length+1)); binds.push(body.meta===null?null:JSON.stringify(body.meta)); }
    if (typeof body.project_name === "string")             { fields.push("project_name=?" + (fields.length+1)); binds.push(body.project_name.trim()); }
    if (typeof body.subdomain === "string")                { fields.push("subdomain=?"    + (fields.length+1)); binds.push(body.subdomain.trim()); }
    if (typeof body.status === "string")                   { fields.push("status=?"       + (fields.length+1)); binds.push(body.status.trim()); }

    fields.push("updated_at=?" + (fields.length+1)); binds.push(new Date().toISOString());
    if (!fields.length) return send({ error: "No updatable fields" }, 400);

    const sql = "UPDATE templates SET " + fields.join(", ") + " WHERE slug=?" + (fields.length+1);
    binds.push(slug);

    const res = await DB.prepare(sql).bind(...binds).run();
    if (res.meta.changes === 0) return send({ error: "Not found" }, 404);
    return send({ ok: true });
  } catch (e: any) {
    return send({ error: "Unhandled error (PATCH)", detail: String(e?.message || e) }, 500);
  }
};
