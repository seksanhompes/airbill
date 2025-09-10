export async function onRequestPut({ request, env, params }){
  const id = params.id;
  const body = await request.json();
  const { name, active } = body;
  if(typeof name === 'string' && name.trim()){
    await env.DB.prepare(`UPDATE people SET name=? WHERE id=?`).bind(name.trim(), id).run();
  }
  if(typeof active !== 'undefined'){
    await env.DB.prepare(`UPDATE people SET active=? WHERE id=?`).bind(active?1:0, id).run();
  }
  const row = await env.DB.prepare(`SELECT id,name,active,created_at FROM people WHERE id=?`).bind(id).all();
  return new Response(JSON.stringify({ ok:true, item: row.results[0] }), { headers:{'Content-Type':'application/json'} });
}

export async function onRequestDelete({ env, params }){
  const id = params.id;
  // soft delete -> set active=0
  await env.DB.prepare(`UPDATE people SET active=0 WHERE id=?`).bind(id).run();
  return new Response(JSON.stringify({ ok:true }), { headers:{'Content-Type':'application/json'} });
}