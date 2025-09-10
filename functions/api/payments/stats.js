export async function onRequestGet({ request, env }){
  const url = new URL(request.url);
  const group = url.searchParams.get('group') || 'day';
  const person_id = url.searchParams.get('person_id');
  const from = url.searchParams.get('from');
  const to = url.searchParams.get('to');

  let labelExpr = 'p.paid_on';
  if(group === 'month') labelExpr = "substr(p.paid_on,1,7)";
  else if(group === 'year') labelExpr = "substr(p.paid_on,1,4)";

  const where = [];
  const binds = [];
  if(person_id){ where.push('p.person_id = ?'); binds.push(person_id); }
  if(from){ where.push('p.paid_on >= ?'); binds.push(from); }
  if(to){ where.push('p.paid_on <= ?'); binds.push(to); }

  const sql = `
    SELECT ${labelExpr} AS label, ROUND(SUM(p.amount),2) AS total
    FROM payments p
    ${where.length ? 'WHERE '+where.join(' AND ') : ''}
    GROUP BY label
    ORDER BY label ASC
  `;
  const rows = await env.DB.prepare(sql).bind(...binds).all();
  return new Response(JSON.stringify({ ok:true, items: rows.results }), { headers:{'Content-Type':'application/json'} });
}