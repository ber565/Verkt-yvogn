
const cartSelect = document.getElementById('cartSelect');
const userSelect = document.getElementById('userSelect');
const dateInput = document.getElementById('dateInput');
const timeInput = document.getElementById('timeInput');
const nowBtn = document.getElementById('nowBtn');
const outBtn = document.getElementById('outBtn');
const inBtn = document.getElementById('inBtn');
const alertDiv = document.getElementById('alertBox');
const scanBtn = document.getElementById('scanBtn');

function parseCartFromHash(){
  const m = location.hash.match(/cart=(\d+)/);
  if(m){
    const id = m[1];
    const opt = [...cartSelect.options].find(o => o.value == id);
    if(opt) cartSelect.value = id;
  }
}

async function loadLists(){
  const [carts, users] = await Promise.all([
    apiGet('/carts'),
    apiGet('/users')
  ]);
  cartSelect.innerHTML = carts.map(c=>`<option value="${c.id}">${c.label} (${c.code})</option>`).join('');
  userSelect.innerHTML = users.map(u=>`<option value="${u.id}">${u.name}</option>`).join('');
  parseCartFromHash();
}

function doNow(){ setNow(dateInput, timeInput); }
nowBtn.addEventListener('click', doNow);

document.addEventListener('DOMContentLoaded', ()=>{
  doNow();
  loadLists().catch(err=>alertBox(alertDiv,'danger',err.message));
});

async function submit(action){
  const cart_id = Number(cartSelect.value);
  const user_id = Number(userSelect.value);
  const ts_utc = toISOFromInputs(dateInput, timeInput);
  const note = document.getElementById('noteInput').value || undefined;
  if(!cart_id || !user_id){
    return alertBox(alertDiv, 'warning', 'Velg vogn og bruker');
  }
  try{
    await apiPost('/transactions', { cart_id, user_id, action, ts_utc, note });
    alertBox(alertDiv, 'success', 'Registrert!');
  }catch(err){
    alertBox(alertDiv, 'danger', err.message);
  }
}

outBtn.addEventListener('click', ()=> submit('out'));
inBtn.addEventListener('click', ()=> submit('in'));

// QR skanning
let html5QrCode;
const scanModal = new bootstrap.Modal(document.getElementById('scanModal'));
scanBtn.addEventListener('click', async ()=>{
  scanModal.show();
  if(!html5QrCode){
    html5QrCode = new Html5Qrcode("qrReader");
  }
  const config = { fps: 10, qrbox: { width: 250, height: 250 } };
  try{
    await html5QrCode.start({ facingMode: 'environment' }, config, (decodedText)=>{
      try{
        // Forventet format: URL med #cart=<id> eller bare id
        const m = decodedText.match(/cart=(\d+)/);
        let id = null;
        if(m){ id = m[1]; }
        else if(/^\d+$/.test(decodedText)){ id = decodedText; }
        if(id){
          cartSelect.value = String(id);
          scanModal.hide();
          html5QrCode.stop();
        }
      }catch(e){ console.warn(e); }
    });
  }catch(err){
    alertBox(alertDiv,'danger','Fikk ikke tilgang til kamera');
  }
});

document.getElementById('scanModal').addEventListener('hidden.bs.modal', ()=>{
  if(html5QrCode){ html5QrCode.stop().catch(()=>{}); }
});
