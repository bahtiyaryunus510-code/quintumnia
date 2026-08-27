const $ = (selector) => document.querySelector(selector);
const toast = $('#toast');
let crystals = 248;
let enemies = 5;
let energy = 65;
let walletPublicKey = null;
let walletAddress = '';
const saleEndsAt = Date.now() + 90 * 24 * 60 * 60 * 1000;
function mountTierAndLaunchpad() {
  const section = document.createElement('section');
  section.className = 'tier-launchpad';
  section.innerHTML = `<div class="tier-title"><small>02 / ERKEN KAŞİF TIER'LARI</small><h2>Daha erken gir, daha çok keşfet.</h2></div><div class="tier-grid"><article class="tier-card"><small>ROOKIE</small><b>0.1+ SOL</b><span>9,950 QMN / SOL</span><p>Başlangıç rozeti ve galaksi haritası erişimi.</p><button data-tier="Rookie">Tier'ı seç</button></article><article class="tier-card featured"><em>EN ÇOK TERCİH EDİLEN</em><small>EXPLORER</small><b>1+ SOL</b><span>9,950 QMN / SOL</span><p>Başlangıç fiyatı ve özel UFO kaplaması.</p><button data-tier="Explorer">Tier'ı seç</button></article><article class="tier-card"><small>COMMANDER</small><b>10+ SOL</b><span>9,000 QMN / SOL</span><p>Sonraki satış aşamasında artan fiyat uygulanır.</p><button data-tier="Commander">Tier'ı seç</button></article></div><div class="launchpad-head"><div><small>03 / QUINTUMNIA LAUNCHPAD</small><h2>Galaksinin yeni projeleri.</h2></div><button id="submitProject">Proje gönder +</button></div><div class="launch-list"><article><span class="project-icon">◈</span><div><b>Moon Miner</b><small>$MOON · HAZİNE AVCISI</small></div><strong>Başlıyor</strong><button data-project="Moon Miner">İncele →</button></article><article><span class="project-icon orange-icon">✦</span><div><b>Jupiter Junkies</b><small>$JUNK · SAVAŞ FİLOSU</small></div><strong>Yakında</strong><button data-project="Jupiter Junkies">İncele →</button></article></div>`;
  document.querySelector('#top').before(section);
  const style = document.createElement('style');
  style.textContent = `.tier-launchpad{padding:48px 5vw;background:#101419;color:#f1f2ed}.tier-title h2,.launchpad-head h2{font-size:28px;margin:8px 0 22px}.tier-title small,.launchpad-head small{font:10px 'DM Mono';color:#8994a0}.tier-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}.tier-card{position:relative;padding:20px;border:1px solid #303b46;background:#171d24}.tier-card.featured{border-color:#c9f35a}.tier-card em{position:absolute;right:12px;top:12px;color:#c9f35a;font:9px 'DM Mono';font-style:normal}.tier-card small{display:block;color:#ff7350;font:10px 'DM Mono'}.tier-card>b{display:block;font-size:27px;margin:15px 0 4px}.tier-card span{font:11px 'DM Mono';color:#c9f35a}.tier-card p{min-height:32px;color:#8994a0;font-size:11px;line-height:1.5}.tier-card button,.launchpad-head button{padding:10px 12px;border:1px solid #c9f35a;background:transparent;color:#c9f35a;font-size:11px}.launchpad-head{display:flex;justify-content:space-between;align-items:end;margin-top:50px}.launch-list{border-top:1px solid #303b46}.launch-list article{display:grid;grid-template-columns:42px 1fr 90px 80px;gap:12px;align-items:center;padding:14px 0;border-bottom:1px solid #303b46}.project-icon{display:grid;place-items:center;width:34px;height:34px;background:#c9f35a;color:#101419;font-size:20px}.orange-icon{background:#ff7350}.launch-list b{display:block}.launch-list small{display:block;color:#8994a0;font:9px 'DM Mono';margin-top:4px}.launch-list strong{color:#ff7350;font:10px 'DM Mono'}.launch-list button{border:0;background:none;color:#c9f35a;font-size:11px}@media(max-width:700px){.tier-launchpad{padding:35px 20px}.tier-grid{grid-template-columns:1fr}.launchpad-head{align-items:start;gap:15px;flex-direction:column}.launch-list article{grid-template-columns:38px 1fr 70px}.launch-list button{grid-column:2}.tier-card p{min-height:0}}`;
  document.head.append(style);
  section.querySelectorAll('[data-tier]').forEach((button) => button.addEventListener('click', () => notify(`${button.dataset.tier} tier seçildi. Satın alma panelinden ödeme ağı ve miktarı onayla.`)));
  section.querySelectorAll('[data-project]').forEach((button) => button.addEventListener('click', () => notify(`${button.dataset.project} proje sayfası yakında açılacak.`)));
  $('#submitProject').addEventListener('click', () => notify('Proje başvuru formu yakında açılacak.'));
}
const treasury = {
  solana: '956WKowgGxqkZAU6bN9fvkhZvtbtexXxUPUjrKdFU7dJ',
  mainnet: 'CxGRzBk4H4RovCuJUt82kmMnVUkww1yjKdo1j1ajDnhv',
  evm: '0xbBc387A6F5F985DCD52348137539D144b17c3f94'
};
const qmnMintAddress = 'F6AVJ1wtj6BfTAU7qmoaN2f7FPGusifhgr2Sr9sDYqe7';
const devnetWalletAddress = '6oy6eGmifqAZsUw68hBM4n8bKev6RzH8ZCy95RQa1pwg';
const usdtContracts = {
  ethereum: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  bsc: '0x55d398326f99059fF775485246999027B3197955'
};
const solanaRpcUrls = [
  'https://api.devnet.solana.com'
];
const presaleTiers = [
  { minimum: 0.1, rate: 9950 },
  { minimum: 10.01, rate: 9000 }
];

function getQmnRate(amount) {
  return [...presaleTiers].reverse().find((tier) => amount >= tier.minimum)?.rate || presaleTiers[0].rate;
}

function updatePurchaseQuote() {
  const amount = Number($('#amount').value);
  const quote = $('#purchaseQuote');
  if (!quote || !Number.isFinite(amount) || amount < 0.1) {
    if (quote) quote.textContent = 'Minimum alım: 0,1 SOL';
    return;
  }
  const rate = getQmnRate(amount);
  quote.textContent = `${amount.toLocaleString('tr-TR')} SOL = ${(amount * rate).toLocaleString('tr-TR')} QMN (${rate.toLocaleString('tr-TR')} QMN/SOL)`;
}

function getAllocations() {
  try {
    return JSON.parse(localStorage.getItem('qmnDevnetAllocations') || '[]');
  } catch {
    return [];
  }
}

function saveAllocation(address, amount, qmnAmount, signature) {
  const allocations = getAllocations();
  allocations.push({ address, amount, qmnAmount, signature, claimAt: Date.now() + 90 * 24 * 60 * 60 * 1000 });
  localStorage.setItem('qmnDevnetAllocations', JSON.stringify(allocations));
  renderAllocations();
}

function renderAllocations() {
  const list = $('#allocationList');
  if (!list) return;
  const allocations = getAllocations();
  list.innerHTML = allocations.length ? allocations.map((allocation) => `<div><b>${allocation.address.slice(0, 6)}...${allocation.address.slice(-4)}</b><span>${allocation.qmnAmount.toLocaleString('tr-TR')} QMN · Claim: ${new Date(allocation.claimAt).toLocaleDateString('tr-TR')}</span></div>`).join('') : '<span>Henüz devnet tahsisi yok.</span>';
}

async function getSolanaConnection() {
  await loadSolanaWeb3();
  for (const rpcUrl of solanaRpcUrls) {
    const connection = new solanaWeb3.Connection(rpcUrl, 'confirmed');
    try {
      await connection.getEpochInfo();
      return connection;
    } catch (error) {
      console.warn(`Solana RPC kullanılamadı: ${rpcUrl}`, error);
    }
  }
  throw new Error('Solana ağına erişilemedi. RPC sağlayıcıları şu anda yanıt vermiyor.');
}

function loadSolanaWeb3() {
  if (window.solanaWeb3) return Promise.resolve(window.solanaWeb3);
  return new Promise(async (resolve, reject) => {
    try {
      const bufferModule = await import('https://esm.sh/buffer@6.0.3?target=es2020');
      const browserBuffer = bufferModule.Buffer || bufferModule.default?.Buffer || bufferModule.default;
      if (typeof browserBuffer !== 'function' || typeof browserBuffer.from !== 'function') {
        reject(new Error('Solana tarayıcı Buffer desteği geçersiz.'));
        return;
      }
      window.Buffer = browserBuffer;
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/@solana/web3.js@1.95.3/lib/index.iife.min.js';
      script.onload = () => resolve(window.solanaWeb3);
      script.onerror = () => reject(new Error('Solana istemcisi yüklenemedi.'));
      document.head.appendChild(script);
    } catch (error) {
      reject(new Error(`Solana tarayıcı desteği yüklenemedi: ${error.message}`));
    }
  });
}

function notify(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(notify.timer);
  notify.timer = setTimeout(() => toast.classList.remove('show'), 4000);
}
function updateResource() {
  $('#crystal').textContent = crystals.toLocaleString('tr-TR');
  $('#energy').textContent = `${energy}%`;
  $('#energyBar').style.width = `${energy}%`;
  $('#shieldBar').style.width = '82%';
}
function showView(name) {
  document.querySelectorAll('.view').forEach((view) => view.classList.add('hidden'));
  const view = $(`#${name === 'galaxy' ? 'galaxyView' : `${name}View`}`);
  if (view) view.classList.remove('hidden');
  document.querySelectorAll('.game-nav button').forEach((button) => button.classList.toggle('active', button.dataset.view === name));
}
function updateCountdown() {
  const remaining = Math.max(0, saleEndsAt - Date.now());
  const seconds = Math.floor(remaining / 1000);
  $('#days').textContent = Math.floor(seconds / 86400).toString().padStart(2, '0');
  $('#hours').textContent = Math.floor((seconds % 86400) / 3600).toString().padStart(2, '0');
  $('#minutes').textContent = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
  $('#seconds').textContent = (seconds % 60).toString().padStart(2, '0');
  $('#saleDate').textContent = `${Math.ceil(seconds / 86400)} GÜN`;
}
async function connectWallet() {
  const network = $('#network').value;
  try {
    if (network === 'solana') {
      const provider = window.phantom?.solana || window.solana;
      if (!provider?.isPhantom) throw new Error('Phantom bulunamadı.');
      const result = await provider.connect();
      walletPublicKey = result.publicKey;
      walletAddress = walletPublicKey.toString();
    } else {
      if (!window.ethereum) throw new Error('MetaMask bulunamadı.');
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      walletPublicKey = accounts[0];
      walletAddress = walletPublicKey;
    }
    const address = walletAddress;
    $('#connectWallet').textContent = `${address.slice(0, 5)}...${address.slice(-4)}`;
    $('#walletStatus').textContent = `Bağlandı: ${address.slice(0, 6)}...${address.slice(-4)}`;
    notify('Cüzdan bağlandı. Satın alma işlemi için miktar gir.');
    return walletPublicKey;
  } catch (error) {
    notify(error.message || 'Cüzdan bağlantısı iptal edildi.');
    return null;
  }
}
function decimalToBaseUnits(value, decimals) {
  const [whole, fraction = ''] = String(value).split('.');
  return (BigInt(whole || '0') * (10n ** BigInt(decimals)) + BigInt((fraction + '0'.repeat(decimals)).slice(0, decimals))).toString(16).padStart(64, '0');
}
async function buyTokens() {
  const network = $('#network').value;
  const asset = $('#asset').value;
  const amount = Number($('#amount').value);
  const buyButton = $('#buyButton');
  if (network !== 'solana') return notify('Bu sayfa yalnızca Solana Devnet testi içindir.');
  if (!Number.isFinite(amount) || amount < 0.1) return notify('En az 0,1 SOL gir.');
  buyButton.disabled = true;
  buyButton.textContent = 'İşlem bekleniyor...';
  const key = walletPublicKey || await connectWallet();
  if (!key) {
    buyButton.disabled = false;
    buyButton.textContent = 'QMN satın al →';
    return;
  }
  try {
    if (network === 'solana') {
      const provider = window.phantom?.solana || window.solana;
      if (!provider?.isPhantom || !walletPublicKey?.toBase58) throw new Error('Önce Phantom cüzdanını bağla.');
      const connection = await getSolanaConnection();
      const lamports = Math.round(amount * solanaWeb3.LAMPORTS_PER_SOL);
      const balance = await connection.getBalance(walletPublicKey);
      const feeBuffer = 5000;
      if (balance < lamports + feeBuffer) throw new Error('Yetersiz SOL: ödeme ve ağ ücretini karşılayacak bakiye gerekli.');
      const transaction = new solanaWeb3.Transaction().add(solanaWeb3.SystemProgram.transfer({ fromPubkey: walletPublicKey, toPubkey: new solanaWeb3.PublicKey(treasury.solana), lamports }));
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
      transaction.recentBlockhash = blockhash;
      transaction.lastValidBlockHeight = lastValidBlockHeight;
      transaction.feePayer = walletPublicKey;
      const signed = await provider.signAndSendTransaction(transaction);
      await connection.confirmTransaction({ signature: signed.signature, blockhash, lastValidBlockHeight }, 'confirmed');
      saveAllocation(walletAddress, amount, amount * getQmnRate(amount), signed.signature);
      notify(`SOL transferi gönderildi: ${signed.signature.slice(0, 12)}...`);
      return;
    }
    const chains = { ethereum: '0x1', bsc: '0x38' };
    await window.ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: chains[network] }] });
    const data = asset === 'USDT' ? `0xa9059cbb${treasury.evm.slice(2).padStart(64, '0')}${decimalToBaseUnits(amount, 6)}` : '0x';
    const value = asset === 'USDT' ? '0x0' : `0x${BigInt(Math.round(amount * 1e18)).toString(16)}`;
    const tx = { from: key, to: asset === 'USDT' ? usdtContracts[network] : treasury.evm, value, ...(asset === 'USDT' ? { data } : {}) };
    const hash = await window.ethereum.request({ method: 'eth_sendTransaction', params: [tx] });
    notify(`Ödeme gönderildi: ${hash.slice(0, 12)}...`);
  } catch (error) {
    notify(error.message || 'İşlem reddedildi veya ağ bağlantısı başarısız.');
  } finally {
    buyButton.disabled = false;
    buyButton.textContent = 'QMN satın al →';
  }
}
document.querySelectorAll('.game-nav button').forEach((button) => button.addEventListener('click', () => showView(button.dataset.view)));
document.querySelectorAll('.planet-node').forEach((node) => node.addEventListener('click', () => {
  if (node.classList.contains('locked')) return notify('Andromeda kilitli. Komutanlık seviyen 10 olmalı.');
  document.querySelectorAll('.planet-node').forEach((item) => item.classList.remove('selected'));
  node.classList.add('selected');
  $('#selectedPlanet').textContent = node.dataset.planet;
  $('#planetStatus').textContent = node.dataset.planet === 'Jupiter' ? 'Savaş alanı aktif. Düşman filosu bekliyor.' : `${node.dataset.planet} keşfedildi. Rotanı ayarlamaya hazır.`;
}));
$('#connectWallet').addEventListener('click', connectWallet);
$('#buyButton').addEventListener('click', buyTokens);
$('#amount').addEventListener('input', updatePurchaseQuote);
$('#network').addEventListener('change', () => {
  const network = $('#network').value;
  $('#asset').innerHTML = '<option value="SOL">SOL</option>';
  walletPublicKey = null;
  $('#connectWallet').textContent = 'Cüzdan bağla';
  $('#walletStatus').textContent = 'Cüzdan bağlı değil';
});
$('#missionButton').addEventListener('click', () => { showView('battle'); notify('Savaş alanına giriş yapıldı.'); });
$('#travelButton').addEventListener('click', () => {
  if ($('#selectedPlanet').textContent === 'Jupiter') return showView('battle');
  $('#ufo').style.left = `${20 + Math.random() * 55}%`;
  $('#ufo').style.top = `${25 + Math.random() * 50}%`;
  notify(`${$('#selectedPlanet').textContent} rotasına uçuş başladı.`);
});
$('#retreatButton').addEventListener('click', () => showView('galaxy'));
$('#fireButton').addEventListener('click', () => {
  if (enemies <= 0) return notify('Bu dalga temizlendi.');
  if (energy < 12) return notify('Enerji düşük.');
  energy -= 12;
  enemies -= 1;
  $('#enemyCount').textContent = enemies;
  document.querySelector('.enemy')?.remove();
  $('#battleLog').textContent = enemies ? 'Lazer isabet etti. Formasyon dağılıyor.' : 'Dalga temizlendi! +80 kristal.';
  if (!enemies) { crystals += 80; $('#wave').textContent = '2'; notify('Savaş kazanıldı. +80 kristal!'); }
  updateResource();
});
$('#photoInput').addEventListener('change', (event) => {
  const [file] = event.target.files;
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas'); canvas.width = 512; canvas.height = 512;
      const context = canvas.getContext('2d'); const scale = Math.max(512 / image.width, 512 / image.height);
      context.drawImage(image, (512 - image.width * scale) / 2, (512 - image.height * scale) / 2, image.width * scale, image.height * scale);
      context.globalCompositeOperation = 'color'; context.fillStyle = '#9fcf68'; context.fillRect(0, 0, 512, 512);
      context.globalCompositeOperation = 'multiply'; context.fillStyle = '#172328'; context.fillRect(0, 0, 512, 512);
      context.globalCompositeOperation = 'screen'; context.fillStyle = '#c9f35a'; context.beginPath(); context.ellipse(185, 245, 65, 34, 0, 0, Math.PI * 2); context.ellipse(327, 245, 65, 34, 0, 0, Math.PI * 2); context.fill();
      const result = `url(${canvas.toDataURL('image/jpeg', 0.88)})`;
      $('#avatar').style.backgroundImage = result; $('#profileAvatar').style.backgroundImage = result;
      $('#avatar').textContent = ''; $('#profileAvatar').textContent = '';
    }; image.src = reader.result;
  }; reader.readAsDataURL(file); notify('Alien avatarın hazırlanıyor.');
});
document.querySelectorAll('.build-button').forEach((button) => button.addEventListener('click', () => {
  const cost = Number(button.dataset.cost || 0);
  if (cost && crystals < cost) return notify('Daha fazla kristal gerekli.');
  crystals -= cost; button.textContent = 'Hazır ✓'; button.disabled = true; updateResource(); notify('Yeni UFO/tesis hazır.');
}));
$('#digButton').addEventListener('click', () => { const reward = 25 + Math.floor(Math.random() * 35); crystals += reward; updateResource(); notify(`Kazı tamamlandı: +${reward} kristal.`); });
setInterval(updateCountdown, 1000); setInterval(() => { if (energy < 86) { energy += 1; updateResource(); } }, 2200);
mountTierAndLaunchpad(); updateCountdown(); updateResource(); updatePurchaseQuote(); renderAllocations(); $('#qmnMintAddress').textContent = qmnMintAddress;