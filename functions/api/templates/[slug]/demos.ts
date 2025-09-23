const send=(d:unknown,s=200)=>new Response(JSON.stringify(d),{status:s,headers:{'content-type':'application/json'}});

// GET /api/templates/:slug/demos?limit=50
export const onRequestGet: PagesFunction = async ({ env, params, request }) => {
  try {
    const DB=(env as any)?.DB as D1Database; if(!DB) return send({error:"D1 binding 'DB' missing"},500);
    const slug=String(params?.slug||"");
    const url=new URL(request.url);
    const limitRaw=parseInt(url.searchParams.get("limit")||"50",10);
    const limit=Number.isNaN(limitRaw)?50:Math.min(Math.max(limitRaw,1),200);
    const { results } = await DB.prepare(
      "SELECT id, payload, result, created_at FROM demos WHERE template_slug=?1 ORDER BY id DESC LIMIT ?2"
    ).bind(slug, limit).all();
    return send(results??[]);
  } catch(e:any){
    return send({error:"Unhandled error (GET demos)", detail:String(e?.message||e)},500);
  }
};

// POST /api/templates/:slug/demos
export const onRequestPost: PagesFunction = async ({ env, params, request }) => {
  try {
    const DB=(env as any)?.DB as D1Database; if(!DB) return send({error:"D1 binding 'DB' missing"},500);
    const templateSlug=String(params?.slug||"");

    // verifica esistenza template
    const exists=await DB.prepare("SELECT 1 FROM templates WHERE slug=?1").bind(templateSlug).first();
    if(!exists) return send({error:"Template not found"},404);

    // body opzionale; nel tuo schema client_email ed expires_at sono NOT NULL
    let body:any; try{ body=await request.json(); } catch{ body=null; }

    const clientEmail=(typeof body?.client_email==="string" && body.client_email.trim()) || "anon@local";
    let expiresAt:string;
    if(typeof body?.expires_at==="string" && body.expires_at.trim()){
      expiresAt=body.expires_at.trim();
    } else {
      const d=new Date(Date.now()+24*60*60*1000);
      expiresAt=d.toISOString();
    }

    const payload=body?JSON.stringify(body):"{}";

    const res=await DB.prepare(
      "INSERT INTO demos (template_slug, client_email, expires_at, payload, result, created_at) VALUES (?1, ?2, ?3, ?4, NULL, strftime('%Y-%m-%dT%H:%M:%fZ','now'))"
    ).bind(templateSlug, clientEmail, expiresAt, payload).run();

    return send({ok:true, template_slug: templateSlug, demo_id: res.meta.last_row_id},201);
  } catch(e:any){
    return send({error:"Unhandled error (POST demo)", detail:String(e?.message||e)},500);
  }
};
