export async function onRequestGet({ env }) {
  const rows = await env.DB.prepare(`SELECT id,name,active,created_at FROM people ORDER BY name`).all();
  return new Response(JSON.stringify({ ok:true, items: rows.results }), { headers:{'Content-Type':'application/json'} });
}

export async function onRequestPost({ request, env }) {
  const body = await request.json();
  const name = (body.name||'').trim();
  if(!name) return new Response(JSON.stringify({ ok:false, error:'missing name' }), { status:400, headers:{'Content-Type':'application/json'} });
  const id = crypto.randomUUID();
  const ts = Date.now();
  try{
    await env.DB.prepare(`INSERT INTO people (id,name,active,created_at) VALUES (?,?,1,?)`).bind(id, name, ts).run();
  }catch(e){
    return new Response(JSON.stringify({ ok:false, error:String(e) }), { status:400, headers:{'Content-Type':'application/json'} });
  }
  const row = await env.DB.prepare(`SELECT id,name,active,created_at FROM people WHERE id=?`).bind(id).all();
  return new Response(JSON.stringify({ ok:true, item: row.results[0] }), { headers:{'Content-Type':'application/json'} });
}