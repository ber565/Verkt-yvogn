
const userList = document.getElementById('userList');
const cartList = document.getElementById('cartList');
const addUserBtn = document.getElementById('addUserBtn');
const addCartBtn = document.getElementById('addCartBtn');
const newUserName = document.getElementById('newUserName');
const newCartCode = document.getElementById('newCartCode');
const newCartLabel = document.getElementById('newCartLabel');
const adminKey = document.getElementById('adminKey');

async function refresh(){
  const [users, carts] = await Promise.all([ apiGet('/users'), apiGet('/carts') ]);
  userList.innerHTML = users.map(u=>`<li class="list-group-item d-flex justify-content-between align-items-center">
    <span>${u.name}</span>
    <button data-id="${u.id}" class="btn btn-sm btn-outline-danger del-user">Slett</button>
  </li>`).join('');

  cartList.innerHTML = carts.map(c=>`<li class="list-group-item">
    <div class="d-flex justify-content-between align-items-center">
      <div>
        <div><strong>${c.label}</strong> <span class="text-muted">(${c.code})</span></div>
        <div class="qr-box mt-2" id="qr-${c.id}"></div>
      </div>
      <div class="btn-group">
        <button data-id="${c.id}" class="btn btn-sm btn-outline-danger del-cart">Slett</button>
        <button data-id="${c.id}" data-label="${encodeURIComponent(c.label)}" class="btn btn-sm btn-outline-secondary dl-qr">Last ned QR</button>
      </div>
    </div>
  </li>`).join('');

  // Generer QR-koder
  carts.forEach(c=>{
    const el = document.getElementById('qr-' + c.id);
    if(el){
      el.innerHTML='';
      const url = `${location.origin}/#cart=${c.id}`;
      new QRCode(el, { text: url, width: 140, height: 140 });
    }
  });
}

document.addEventListener('click', async (e)=>{
  if(e.target.classList.contains('del-user')){
    const id = e.target.getAttribute('data-id');
    if(confirm('Slette bruker?')){
      await apiDelete(`/users/${id}`, adminKey.value);
      refresh();
    }
  }
  if(e.target.classList.contains('del-cart')){
    const id = e.target.getAttribute('data-id');
    if(confirm('Slette vogn?')){
      await apiDelete(`/carts/${id}`, adminKey.value);
      refresh();
    }
  }
  if(e.target.classList.contains('dl-qr')){
    const id = e.target.getAttribute('data-id');
    const label = decodeURIComponent(e.target.getAttribute('data-label'));
    // Last ned ved å tegne ny QR på canvas og lagre
    const url = `${location.origin}/#cart=${id}`;
    const tmp = document.createElement('div');
    new QRCode(tmp, { text: url, width: 300, height: 300 });
    const img = tmp.querySelector('img') || tmp.querySelector('canvas');
    const link = document.createElement('a');
    link.href = img.src || img.toDataURL('image/png');
    link.download = `QR_vogn_${label}_${id}.png`;
    link.click();
  }
});

addUserBtn.addEventListener('click', async ()=>{
  const name = newUserName.value.trim();
  if(!name) return;
  await apiPost('/users', { name }, adminKey.value);
  newUserName.value='';
  refresh();
});

addCartBtn.addEventListener('click', async ()=>{
  const code = newCartCode.value.trim();
  const label = newCartLabel.value.trim();
  if(!code || !label) return;
  await apiPost('/carts', { code, label }, adminKey.value);
  newCartCode.value='';
  newCartLabel.value='';
  refresh();
});

document.addEventListener('DOMContentLoaded', refresh);
