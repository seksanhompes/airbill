export async function onRequestDelete({ env, params }){
  await env.DB.prepare(`DELETE FROM payments WHERE id=?`).bind(params.id).run();
  return new Response(JSON.stringify({ ok:true }), { headers:{'Content-Type':'application/json'} });
}

export async function onRequestPut({ request, env, params }){
  const body = await request.json();
  const fields = []; const binds = [];
  if(typeof body.amount !== 'undefined'){ fields.push('amount=?'); binds.push(Number(body.amount)||0); }
  if(typeof body.note !== 'undefined'){ fields.push('note=?'); binds.push(String(body.note||'')); }
  if(typeof body.paid_on !== 'undefined'){ fields.push('paid_on=?'); binds.push(String(body.paid_on)); }
  if(!fields.length) return new Response(JSON.stringify({ ok:false, error:'no fields' }), { status:400, headers:{'Content-Type':'application/json'} });
  const sql = `UPDATE payments SET ${fields.join(',')} WHERE id=?`;
  binds.push(params.id);
  await env.DB.prepare(sql).bind(...binds).run();
  return new Response(JSON.stringify({ ok:true }), { headers:{'Content-Type':'application/json'} });
}