const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));
const fmtBaht = (n) => new Intl.NumberFormat('th-TH', { style:'currency', currency:'THB' }).format(n || 0);

const state = {
  people: [],
  offlineQueue: JSON.parse(localStorage.getItem('offlineQueue') || '[]'),
};

function setOfflineQueue(q){
  state.offlineQueue = q;
  localStorage.setItem('offlineQueue', JSON.stringify(q));
  $('#saveHint').style.display = q.length ? 'block' : 'none';
  if(q.length){
    $('#saveHint').textContent = `บันทึกไว้แบบออฟไลน์ ${q.length} รายการ จะส่งเมื่อออนไลน์`;
  }
}

function setOnlineBadge(){
  const online = navigator.onLine;
  const el = $('#netBadge');
  if(online){
    el.className = 'badge-online';
    el.textContent = 'ออนไลน์';
  } else {
    el.className = 'badge-offline';
    el.textContent = 'ออฟไลน์';
  }
}
window.addEventListener('online', () => { setOnlineBadge(); syncOffline(); });
window.addEventListener('offline', setOnlineBadge);

function todayStr(){
  const d = new Date();
  const pad = (n) => (n<10?'0':'')+n;
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
}

async function api(path, opt={}){
  const res = await fetch(path, { headers:{'Content-Type':'application/json'}, ...opt });
  if(!res.ok) throw new Error((await res.text()) || res.statusText);
  return res.json();
}

async function loadPeople(){
  try{
    const data = await api('/api/people');
    state.people = data.items || [];
  }catch(e){
    // offline fallback: keep previous
  }
  renderPeopleSelects();
  renderPeopleList();
}

function renderPeopleSelects(){
  const opts = ['<option value="">— เลือกผู้จ่าย —</option>']
    .concat(state.people.filter(p=>p.active!==0).map(p => `<option value="${p.id}">${p.name}</option>`))
    .join('');
  $('#personSelect').innerHTML = opts;
  $('#filterPerson').innerHTML = `<option value="">— ทั้งหมด —</option>` + opts;
  $('#chartPerson').innerHTML = `<option value="">— ทั้งหมด —</option>` + opts;
}

function renderPeopleList(){
  const list = $('#peopleList');
  list.innerHTML = '';
  state.people.forEach(p => {
    const item = document.createElement('div');
    item.className = 'item';
    item.innerHTML = `
      <div>
        <div><strong>${p.name}</strong></div>
        <div class="meta">${p.active? 'ใช้งานอยู่':'ปิดการใช้งาน'}</div>
      </div>
      <div style="margin-left:auto;display:flex;gap:8px">
        <button class="btn-sm ghost" data-act="rename">แก้ชื่อ</button>
        <button class="btn-sm" data-act="toggle">${p.active? 'ปิด':'เปิด'}</button>
      </div>
    `;
    item.querySelector('[data-act="rename"]').onclick = async () => {
      const name = prompt('แก้ไขชื่อ', p.name);
      if(!name || !name.trim()) return;
      await api(`/api/people/${p.id}`, { method:'PUT', body: JSON.stringify({ name }) });
      await loadPeople();
    };
    item.querySelector('[data-act="toggle"]').onclick = async () => {
      await api(`/api/people/${p.id}`, { method:'PUT', body: JSON.stringify({ active: p.active?0:1 }) });
      await loadPeople();
    };
    list.appendChild(item);
  });
}

async function addPerson(name){
  if(!name || !name.trim()) return alert('กรุณากรอกชื่อ');
  await api('/api/people', { method:'POST', body: JSON.stringify({ name: name.trim() }) });
  $('#newPerson').value='';
  await loadPeople();
}

async function savePaymentOnline(payload){
  await api('/api/payments', { method:'POST', body: JSON.stringify(payload) });
}

async function syncOffline(){
  if(!navigator.onLine) return;
  const q = [...state.offlineQueue];
  if(!q.length) return;
  for(const job of q){
    try{
      await savePaymentOnline(job);
      q.shift();
      setOfflineQueue(q);
      $('#lastSaved').textContent = `ซิงค์แล้ว: ${job.paid_on} • ${fmtBaht(job.amount)}`;
    } catch(e){
      // remain queued
      break;
    }
  }
}

function pushOffline(payload){
  const q = [...state.offlineQueue, payload];
  setOfflineQueue(q);
}

async function savePayment(){
  const paid_on = $('#paidOn').value || todayStr();
  const person_id = $('#personSelect').value;
  const amount = parseFloat($('#amount').value||'0');
  const note = $('#note').value || '';
  if(!person_id) return alert('เลือกผู้จ่าย');
  if(!(amount>0)) return alert('กรอกจำนวนเงินให้ถูกต้อง');

  const payload = { person_id, amount, note, paid_on };
  if(navigator.onLine){
    try{
      await savePaymentOnline(payload);
      $('#lastSaved').textContent = `บันทึกแล้ว: ${paid_on} • ${fmtBaht(amount)}`;
      $('#amount').value=''; $('#note').value='';
      return;
    }catch(e){
      // fallthrough to offline
    }
  }
  pushOffline(payload);
  $('#amount').value=''; $('#note').value='';
  $('#lastSaved').textContent = `บันทึกแบบออฟไลน์: ${paid_on} • ${fmtBaht(amount)}`;
}

async function loadHistory(){
  const params = new URLSearchParams();
  const from = $('#fromDate').value;
  const to = $('#toDate').value;
  const person_id = $('#filterPerson').value;
  if(from) params.set('from', from);
  if(to) params.set('to', to);
  if(person_id) params.set('person_id', person_id);
  const data = await api('/api/payments?'+params.toString());
  const list = $('#historyList');
  list.innerHTML='';
  let total = 0;
  data.items.forEach(r => {
    total += r.amount;
    const item = document.createElement('div');
    item.className = 'item';
    item.innerHTML = `
      <div>
        <div><strong>${r.person_name}</strong> • <span class="meta">${r.paid_on}</span></div>
        <div class="meta">${r.note||''}</div>
      </div>
      <div class="amt">฿${Number(r.amount).toFixed(2)}</div>
      <div style="display:flex;gap:6px;margin-left:8px">
        <button class="btn-sm ghost" data-act="edit">แก้</button>
        <button class="btn-sm danger" data-act="del">ลบ</button>
      </div>
    `;
    item.querySelector('[data-act="del"]').onclick = async () => {
      if(!confirm('ลบรายการนี้?')) return;
      await api(`/api/payments/${r.id}`, { method:'DELETE' });
      await loadHistory();
    };
    item.querySelector('[data-act="edit"]').onclick = async () => {
      const amt = prompt('จำนวนเงินใหม่', r.amount);
      if(amt===null) return;
      const note = prompt('หมายเหตุ', r.note||'');
      if(note===null) return;
      await api(`/api/payments/${r.id}`, { method:'PUT', body: JSON.stringify({ amount: parseFloat(amt), note }) });
      await loadHistory();
    };
    list.appendChild(item);
  });
  $('#historyTotal').textContent = fmtBaht(total);
}

let chart;
async function loadChart(){
  const params = new URLSearchParams();
  const group = $('#groupBy').value;
  const from = $('#chartFrom').value;
  const to = $('#chartTo').value;
  const person_id = $('#chartPerson').value;
  params.set('group', group);
  if(from) params.set('from', from);
  if(to) params.set('to', to);
  if(person_id) params.set('person_id', person_id);
  const data = await api('/api/payments/stats?'+params.toString());
  const labels = data.items.map(x=>x.label);
  const values = data.items.map(x=>x.total);

  const ctx = $('#chart').getContext('2d');
  if(chart) chart.destroy();
  chart = new Chart(ctx, {
    type: 'bar',
    data: { labels, datasets:[{ label:'รวมค่าแอร์', data: values }] },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true } }
    }
  });
}

// Tab handling
function switchTab(name){
  $$('[data-tab]').forEach(s => s.hidden = true);
  $('#tab-'+name).hidden = false;
  $$('[data-tabbtn]').forEach(b => b.classList.toggle('active', b.dataset.tabbtn===name));
}

function initDates(){
  $('#paidOn').value = todayStr();
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = (d.getMonth()+1).toString().padStart(2,'0');
  const dd = d.getDate().toString().padStart(2,'0');
  $('#fromDate').value = `${yyyy}-${mm}-01`;
  $('#toDate').value = `${yyyy}-${mm}-${dd}`;
  $('#chartFrom').value = `${yyyy}-01-01`;
  $('#chartTo').value = `${yyyy}-${mm}-${dd}`;
}

function initUI(){
  // tab events
  $$('[data-tabbtn]').forEach(b => b.addEventListener('click', () => switchTab(b.dataset.tabbtn)));
  $('#btnSave').onclick = savePayment;
  $('#btnAddPerson').onclick = () => addPerson($('#newPerson').value);
  $('#btnAddPersonQuick').onclick = async () => {
    const name = prompt('ชื่อผู้จ่ายใหม่');
    if(name) await addPerson(name);
  };
  $('#btnLoadHistory').onclick = loadHistory;
  $('#btnLoadChart').onclick = loadChart;
  $('#btnSync').onclick = syncOffline;
}

(async function(){
  setOnlineBadge();
  initDates();
  initUI();
  setOfflineQueue(state.offlineQueue);
  await loadPeople();
  await loadHistory();
  await loadChart();
})();