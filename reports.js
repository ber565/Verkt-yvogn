
const fromDate = document.getElementById('fromDate');
const toDate = document.getElementById('toDate');
const filterBtn = document.getElementById('filterBtn');
const exportBtn = document.getElementById('exportBtn');
const tbody = document.querySelector('#reportTable tbody');

async function load(){
  const from = fromDate.value ? luxon.DateTime.fromISO(fromDate.value).startOf('day').toUTC().toISO() : '';
  const to = toDate.value ? luxon.DateTime.fromISO(toDate.value).endOf('day').toUTC().toISO() : '';
  const params = new URLSearchParams();
  if(from) params.set('from', from);
  if(to) params.set('to', to);
  const rows = await apiGet(`/report?${params.toString()}`);
  tbody.innerHTML = rows.map(r=>`<tr>
    <td>${luxon.DateTime.fromISO(r.ts_utc, {zone:'utc'}).toLocal().toFormat('yyyy-LL-dd HH:mm')}</td>
    <td>${r.cart_label} (${r.cart_code})</td>
    <td>${r.user_name}</td>
    <td>${r.action === 'out' ? 'Ut' : 'Inn'}</td>
    <td>${r.note || ''}</td>
  </tr>`).join('');
  return rows;
}

filterBtn.addEventListener('click', load);

document.addEventListener('DOMContentLoaded', load);

function toCSV(rows){
  const headers = ['Tid (UTC ISO)','Vognkode','Vognnavn','Bruker','Hendelse','Notat'];
  const data = rows.map(r=>[
    r.ts_utc,
    r.cart_code,
    r.cart_label,
    r.user_name,
    r.action,
    (r.note||'').replaceAll('
',' ')
  ]);
  const all = [headers, ...data];
  return all.map(row=>row.map(cell=>`"${String(cell).replaceAll('"','""')}"`).join(',')).join('
');
}

exportBtn.addEventListener('click', async ()=>{
  const rows = await load();
  const csv = toCSV(rows);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'rapport.csv';
  a.click();
  URL.revokeObjectURL(url);
});
