
// Felles hjelpere
const DateTime = luxon.DateTime;

function toISOFromInputs(dateEl, timeEl){
  const d = dateEl.value;
  const t = timeEl.value || '00:00';
  if(!d) return null;
  const isoLocal = `${d}T${t}:00`;
  const dt = DateTime.fromISO(isoLocal);
  return dt.toUTC().toISO();
}

function setNow(dateEl, timeEl){
  const now = DateTime.now();
  dateEl.value = now.toISODate();
  timeEl.value = now.toFormat('HH:mm');
}

function alertBox(container, type, msg){
  container.innerHTML = `<div class="alert alert-${type}" role="alert">${msg}</div>`;
  setTimeout(()=> container.innerHTML='', 4000);
}

async function apiGet(path){
  const res = await fetch(`${API_BASE}/api${path}`);
  if(!res.ok) throw new Error('Feil ved GET ' + path);
  return res.json();
}

async function apiPost(path, data, adminKey){
  const headers = { 'Content-Type': 'application/json' };
  if(adminKey){ headers['x-admin-key'] = adminKey; }
  const res = await fetch(`${API_BASE}/api${path}`, { method: 'POST', headers, body: JSON.stringify(data) });
  if(!res.ok){
    const t = await res.json().catch(()=>({error:'Ukjent feil'}));
    throw new Error(t.error || 'Feil ved POST ' + path);
  }
  return res.json();
}

async function apiDelete(path, adminKey){
  const headers = {};
  if(adminKey){ headers['x-admin-key'] = adminKey; }
  const res = await fetch(`${API_BASE}/api${path}`, { method: 'DELETE', headers });
  if(!res.ok){
    const t = await res.json().catch(()=>({error:'Ukjent feil'}));
    throw new Error(t.error || 'Feil ved DELETE ' + path);
  }
  return res.json();
}
