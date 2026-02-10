
const statusRow = document.getElementById('statusRow');

function badge(status){
  const map = { 'Inne': 'success', 'Ute': 'danger' };
  const cls = map[status] || 'secondary';
  return `<span class="badge bg-${cls} badge-status">${status}</span>`;
}

async function refresh(){
  const list = await apiGet('/status');
  statusRow.innerHTML = list.map(s=>`<div class="col-md-4">
    <div class="card">
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-center">
          <h5 class="card-title">${s.label} <span class="text-muted">(${s.code})</span></h5>
          ${badge(s.status)}
        </div>
        <div class="mt-2 small text-muted">
          ${s.since ? `Sist: ${luxon.DateTime.fromISO(s.since, {zone:'utc'}).toLocal().toFormat('yyyy-LL-dd HH:mm')}` : 'Ingen historikk'}
          ${s.by ? ` av ${s.by}` : ''}
        </div>
        <div class="mt-2"><a class="btn btn-sm btn-outline-primary" href="/#cart=${s.id}">Registrer</a></div>
      </div>
    </div>
  </div>`).join('');
}

document.addEventListener('DOMContentLoaded', refresh);
