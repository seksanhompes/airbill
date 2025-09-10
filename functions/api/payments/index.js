function buildWhere(u){
  const w = [], b = [];
  if(u.person_id){ w.push('p.person_id=?'); b.push(u.person_id); }
  if(u.from){ w.push('p.paid_on >= ?'); b.push(u.from); }
  if(u.to){ w.push('p.paid_on <= ?'); b.push(u.to); }
  const where = w.length ? 'WHERE '+w.join(' AND ') : '';
  return { where, b };
}

export async function onRequestGet({ request, env }){
  const url = new URL(request.url);
  const u = Object.fromEntries(url.searchParams.entries());
  const { where, b } = buildWhere(u);
  const sql = `
    SELECT p.id,p.person_id,pe.name AS person_name,p.amount,p.paid_on,p.note,p.created_at
    FROM payments p
    JOIN people pe ON pe.id=p.person_id
    ${where}
    ORDER BY p.paid_on DESC, p.created_at DESC
    LIMIT 500
  `;
  const rows = await env.DB.prepare(sql).bind(...b).all();
  return new Response(JSON.stringify({ ok:true, items: rows.results }), { headers:{'Content-Type':'application/json'} });
}

export async function onRequestPost({ request, env }){
  const body = await request.json();
  const { person_id, amount, paid_on, note='' } = body||{};
  if(!person_id || !(amount>0) || !paid_on) {
    return new Response(JSON.stringify({ ok:false, error:'missing fields' }), { status:400, headers:{'Content-Type':'application/json'} });
  }
  const id = crypto.randomUUID();
  const ts = Date.now();
  await env.DB.prepare(`INSERT INTO payments (id,person_id,amount,paid_on,note,created_at) VALUES (?,?,?,?,?,?)`)
    .bind(id, person_id, amount, paid_on, note, ts).run();
  const row = await env.DB.prepare(`SELECT id,person_id,amount,paid_on,note,created_at FROM payments WHERE id=?`).bind(id).all();
  return new Response(JSON.stringify({ ok:true, item: row.results[0] }), { headers:{'Content-Type':'application/json'} });
}