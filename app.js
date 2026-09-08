const $ = (selector) => document.querySelector(selector);
const toast = $('#toast');
document.addEventListener('click', (event) => {
  if (!event.target.closest('#buyButton')) return;
  event.preventDefault();
  buyTokens();
}, true);
let crystals = 248;
let enemies = 5;
let energy = 65;
let walletPublicKey = null;
const saleEndsAt = Date.now() + 90 * 24 * 60 * 60 * 1000;
function mountTierAndLaunchpad() {
  const section = document.createElement('section');
  section.className = 'tier-launchpad';
  section.innerHTML = `<div class="tier-title"><small>02 / EARLY EXPLORER TIERS</small><h2>Enter early, discover more.</h2></div><div class="tier-grid"><article class="tier-card"><small>ROOKIE</small><b>0.1+ SOL</b><span>10,000 QMN / SOL</span><p>Starter badge and galaxy map access.</p><button data-tier="Rookie">Select tier</button></article><article class="tier-card featured"><em>MOST POPULAR</em><small>EXPLORER</small><b>1+ SOL</b><span>11,000 QMN / SOL</span><p>10% bonus QMN and an exclusive UFO skin.</p><button data-tier="Explorer">Select tier</button></article><article class="tier-card"><small>COMMANDER</small><b>5+ SOL</b><span>12,500 QMN / SOL</span><p>25% bonus, Jupiter core and early access.</p><button data-tier="Commander">Select tier</button></article></div><div class="launchpad-head"><div><small>03 / QUINTUMNIA LAUNCHPAD</small><h2>The galaxy's next projects.</h2></div><button id="submitProject">Submit project +</button></div><div class="launch-list"><article><span class="project-icon">◈</span><div><b>Moon Miner</b><small>$MOON · TREASURE HUNTER</small></div><strong>Launching</strong><button data-project="Moon Miner">View →</button></article><article><span class="project-icon orange-icon">✦</span><div><b>Jupiter Junkies</b><small>$JUNK · BATTLE FLEET</small></div><strong>Coming soon</strong><button data-project="Jupiter Junkies">View →</button></article></div>`;
  document.querySelector('#top').before(section);
  const style = document.createElement('style');
  style.textContent = `.tier-launchpad{padding:48px 5vw;background:#101419;color:#f1f2ed}.tier-title h2,.launchpad-head h2{font-size:28px;margin:8px 0 22px}.tier-title small,.launchpad-head small{font:10px 'DM Mono';color:#8994a0}.tier-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}.tier-card{position:relative;padding:20px;border:1px solid #303b46;background:#171d24}.tier-card.featured{border-color:#c9f35a}.tier-card em{position:absolute;right:12px;top:12px;color:#c9f35a;font:9px 'DM Mono';font-style:normal}.tier-card small{display:block;color:#ff7350;font:10px 'DM Mono'}.tier-card>b{display:block;font-size:27px;margin:15px 0 4px}.tier-card span{font:11px 'DM Mono';color:#c9f35a}.tier-card p{min-height:32px;color:#8994a0;font-size:11px;line-height:1.5}.tier-card button,.launchpad-head button{padding:10px 12px;border:1px solid #c9f35a;background:transparent;color:#c9f35a;font-size:11px}.launchpad-head{display:flex;justify-content:space-between;align-items:end;margin-top:50px}.launch-list{border-top:1px solid #303b46}.launch-list article{display:grid;grid-template-columns:42px 1fr 90px 80px;gap:12px;align-items:center;padding:14px 0;border-bottom:1px solid #303b46}.project-icon{display:grid;place-items:center;width:34px;height:34px;background:#c9f35a;color:#101419;font-size:20px}.orange-icon{background:#ff7350}.launch-list b{display:block}.launch-list small{display:block;color:#8994a0;font:9px 'DM Mono';margin-top:4px}.launch-list strong{color:#ff7350;font:10px 'DM Mono'}.launch-list button{border:0;background:none;color:#c9f35a;font-size:11px}@media(max-width:700px){.tier-launchpad{padding:35px 20px}.tier-grid{grid-template-columns:1fr}.launchpad-head{align-items:start;gap:15px;flex-direction:column}.launch-list article{grid-template-columns:38px 1fr 70px}.launch-list button{grid-column:2}.tier-card p{min-height:0}}`;
  document.head.append(style);
  section.querySelectorAll('[data-tier]').forEach((button) => button.addEventListener('click', () => notify(`${button.dataset.tier} tier selected. Confirm the network and amount in the purchase panel.`)));
  section.querySelectorAll('[data-project]').forEach((button) => button.addEventListener('click', () => notify(`${button.dataset.project} project page is coming soon.`)));
  $('#submitProject').addEventListener('click', () => notify('The project submission form is coming soon.'));
}
const treasury = {
  solana: '956WKowgGxqkZAU6bN9fvkhZvtbtexXxUPUjrKdFU7dJ',
  evm: '0xbBc387A6F5F985DCD52348137539D144b17c3f94'
};
const qmnMintAddress = 'CsQr1Uu3TcWp9poQtVa8JSJm5xnsPjomBiTPznpFtaoQ';
const minimumSolPurchase = 0.1;
const usdtContracts = {
  ethereum: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  bsc: '0x55d398326f99059fF775485246999027B3197955'
};
const solanaRpcEndpoints = [
  'https://api.mainnet-beta.solana.com',
  'https://solana-rpc.publicnode.com'
];
function loadSolanaWeb3() {
  if (window.solanaWeb3) return Promise.resolve(window.solanaWeb3);
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/@solana/web3.js@1.95.3/lib/index.iife.min.js';
    script.onload = () => resolve(window.solanaWeb3);
    script.onerror = () => reject(new Error('The Solana client could not be loaded.'));
    document.head.appendChild(script);
  });
}

async function getSolanaConnection(web3) {
  let lastError;
  for (const endpoint of solanaRpcEndpoints) {
    const connection = new web3.Connection(endpoint, 'confirmed');
    try {
      await connection.getLatestBlockhash('confirmed');
      return connection;
    } catch (error) {
      lastError = error;
    }
  }
  throw new Error(`Solana mainnet RPC is unavailable: ${lastError?.message || 'unknown error'}`);
}

async function getLatestBlockhashWithFallback(web3) {
  let lastError;
  for (const endpoint of solanaRpcEndpoints) {
    const connection = new web3.Connection(endpoint, 'confirmed');
    try {
      const latest = await Promise.race([
        connection.getLatestBlockhash('confirmed'),
        new Promise((_, reject) => setTimeout(() => reject(new Error('RPC request timed out')), 8000))
      ]);
      return { connection, ...latest };
    } catch (error) {
      lastError = error;
    }
  }
  throw new Error(`The Solana network is unavailable: ${lastError?.message || 'unknown error'}`);
}

function getPhantomProvider() {
  const provider = window.phantom?.solana || (window.solana?.isPhantom ? window.solana : null);
  if (!provider) throw new Error('Phantom Wallet was not detected. Install or unlock Phantom and try again.');
  return provider;
}

function notify(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(notify.timer);
  notify.timer = setTimeout(() => toast.classList.remove('show'), 4000);
}
function translatePageToEnglish() {
  const translations = {
    'SEZON 01': 'SEASON 01',
    'Komutan': 'Commander',
    'Oyuna katıl, QMN al.': 'Join the game, earn QMN.',
    'Phantom ile Solana mainnet üzerinde ödeme yap; cüzdan onayından sonra QMN aynı cüzdana gönderilir.': 'Pay on Solana mainnet with Phantom; QMN is sent to the same wallet after approval.',
    'ÖN SATIŞ BİTİŞİ': 'PRESALE ENDS',
    'GÜN': 'DAYS',
    'Cüzdan bağla': 'Connect wallet',
    '01 / QMN TOKEN ÖN SATIŞI': '01 / QMN TOKEN PRESALE',
    'Galaksinin ekonomisine erken katıl.': 'Get early access to the galactic economy.',
    'Şeffaf fiyat. Solana mainnet üzerinde 0,1 SOL = 10.000 QMN, 1 SOL = 100.000 QMN, 10 SOL = 1.000.000 QMN.': 'Transparent pricing. On Solana mainnet, 0.1 SOL = 10,000 QMN, 1 SOL = 100,000 QMN, 10 SOL = 1,000,000 QMN.',
    'Cüzdan bağlı değil': 'Wallet not connected',
    'SÜRE KALANI': 'TIME LEFT',
    'SAAT': 'HOURS',
    'DAKİKA': 'MINUTES',
    'SANİYE': 'SECONDS',
    'QMN satıldı': 'QMN sold',
    'QMN SATIN AL': 'BUY QMN',
    'QMN satın al →': 'Buy QMN →',
    'FON HAZİNESİ: ': 'TREASURY: ',
    'QMN MINT: ': 'QMN MINT: ',
    'Ödeme Solana mainnet üzerinde yalnızca cüzdan onayından sonra gönderilir; QMN doğrulanmış ödeme sonrası aynı cüzdana dağıtılır.': 'Payment is sent on Solana mainnet only after wallet approval; QMN is distributed to the same wallet after payment verification.',
    'OYUNCU 001': 'PLAYER 001',
    "Fotoğrafı alien'a çevir": 'Turn photo into alien',
    'Galaksi haritası': 'Galaxy map',
    'UFO hangarı': 'UFO hangar',
    'Üssüm': 'My base',
    'Hazine sandığı': 'Treasure chest',
    'KAYNAKLAR': 'RESOURCES',
    'Kristal': 'Crystal',
    'Metal': 'Metal',
    'Enerji': 'Energy',
    'SEKTÖR 07 / ANDROMEDA SINIRI': 'SECTOR 07 / ANDROMEDA FRONTIER',
    'Galaksiye hükmet.': 'Rule the galaxy.',
    'RÜTBE': 'RANK',
    'AKTİF GÖREV / SAVAŞ': 'ACTIVE MISSION / BATTLE',
    'Jupiter yörüngesini düşmanlardan temizle': 'Clear the Jupiter orbit of enemies',
    '3 dalga kaldı · Ödül: 80 kristal + Jupiter çekirdeği': '3 waves left · Reward: 80 crystal + Jupiter core',
    'Göreve git ': 'Go to mission ',
    'KEŞİF ROTASI': 'EXPLORATION ROUTE',
    'Gezegenlerini seç.': 'Choose your planets.',
    'Keşfedildi': 'Discovered',
    'Savaş alanı': 'Battle zone',
    'Kilitli': 'Locked',
    'KEŞFEDİLDİ': 'DISCOVERED',
    'SAVAŞ ALANI': 'BATTLE ZONE',
    'LVL 10 GEREKLİ': 'LEVEL 10 REQUIRED',
    'SEÇİLİ GEZEGEN': 'SELECTED PLANET',
    'Üssün burada. Filonu hazırla ve savaşa kat.': 'Your base is here. Prepare your fleet and join the battle.',
    'UFO ile git ↗': 'Travel by UFO ↗',
    'UFO ile git': 'Travel by UFO',
    'JUPITER YÖRÜNGESİ / SAVAŞ': 'JUPITER ORBIT / BATTLE',
    'Dalga ': 'Wave ',
    ' DÜŞMAN KALDI': ' ENEMIES REMAINING',
    'Düşman filosu algılandı.': 'Enemy fleet detected.',
    'KALKAN': 'SHIELD',
    'ENERJİ': 'ENERGY',
    'LAZERİ ATEŞLE ✦': 'FIRE LASER ✦',
    'Geri dön': 'Return',
    'FİLO': 'FLEET',
    'UFO hangarın.': 'Your UFO hangar.',
    'UFO hangarn.': 'Your UFO hangar.',
    'Hızlı keşif gemisi · Aktif': 'Fast exploration ship · Active',
    'Seçili gemi ✓': 'Selected ship ✓',
    'Savaş sınıfı · Kilitli': 'Battle class · Locked',
    'Savaş sınıfı': 'Battle class',
    'Kilidi aç · ': 'Unlock · ',
    'Üssünü büyüt.': 'Expand your base.',
    'İNŞAAT': 'CONSTRUCTION',
    'HAZİNE': 'TREASURE',
    'Kristal sera': 'Crystal greenhouse',
    'Crystal sera': 'Crystal greenhouse',
    'Kristal üretimini hızlandırır.': 'Accelerates crystal production.',
    'Crystal üretimini hızlandırır.': 'Accelerates crystal production.',
    'İnşa et · ': 'Build · ',
    'Kalkan kulesi': 'Shield tower',
    'Üssünü korur.': 'Protects your base.',
    'Hazine': 'TREASURE',
    'Kazdığın ganimetler.': 'Your excavated loot.',
    'Kristal çekirdeği': 'Crystal core',
    'Crystal çekirdeği': 'Crystal core',
    'Ay taşı': 'Moonstone',
    'Antik parça': 'Ancient relic',
    'Dalga temizlendi!': 'Wave cleared!',
    'Dünya': 'Earth',
    'ÜSSÜN': 'YOUR BASE',
    'Mars': 'Mars',
    'Ay': 'Moon',
    'Jupiter': 'Jupiter',
    'Yeni kazı başlat ✦': 'Start new dig ✦'
  };
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const textNodes = [];
  while (walker.nextNode()) textNodes.push(walker.currentNode);
  textNodes.forEach((node) => {
    let text = node.nodeValue;
    Object.entries(translations).forEach(([source, target]) => { text = text.replaceAll(source, target); });
    node.nodeValue = text;
  });
  document.documentElement.lang = 'en';
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
  $('#saleDate').textContent = `${Math.ceil(seconds / 86400)} DAYS`;
}
async function connectWallet() {
  const network = $('#network').value;
  try {
    if (network === 'solana') {
      const provider = getPhantomProvider();
      const result = await provider.connect();
      walletPublicKey = result.publicKey.toString();
    } else {
      if (!window.ethereum) throw new Error('MetaMask was not detected.');
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      walletPublicKey = accounts[0];
    }
    const address = walletPublicKey.toString();
    $('#connectWallet').textContent = `${address.slice(0, 5)}...${address.slice(-4)}`;
    $('#walletStatus').textContent = `Connected: ${address.slice(0, 6)}...${address.slice(-4)}`;
    notify('Wallet connected. Enter an amount to continue.');
    return walletPublicKey;
  } catch (error) {
    notify(error.message || 'Wallet connection was cancelled.');
    return null;
  }
}
function decimalToBaseUnits(value, decimals) {
  const [whole, fraction = ''] = String(value).split('.');
  return (BigInt(whole || '0') * (10n ** BigInt(decimals)) + BigInt((fraction + '0'.repeat(decimals)).slice(0, decimals))).toString(16).padStart(64, '0');
}
function decimalToLamports(value) {
  const [whole, fraction = ''] = String(value).split('.');
  const normalizedFraction = `${fraction}000000000`.slice(0, 9);
  return BigInt(whole || '0') * 1000000000n + BigInt(normalizedFraction || '0');
}
function getTreasuryPublicKey(web3) {
  try {
    return new web3.PublicKey(treasury.solana);
  } catch {
    throw new Error('The Solana treasury address is invalid. No payment was sent.');
  }
}
async function buyTokens() {
  const buyButton = $('#buyButton');
  if (buyButton.disabled) return;
  const network = $('#network').value;
  const asset = $('#asset').value;
  if (network !== 'solana' || asset !== 'SOL') return notify('Only Solana mainnet is currently supported.');
  const amountValue = $('#amount').value.trim();
  const amount = Number(amountValue);
  if (!amountValue || !Number.isFinite(amount) || amount < minimumSolPurchase || !/^\d+(\.\d{1,9})?$/.test(amountValue)) {
    return notify(`Enter at least ${minimumSolPurchase} SOL.`);
  }
  const key = walletPublicKey || await connectWallet();
  if (!key) return;
  try {
    if (network === 'solana') {
      notify('Preparing Solana transaction...');
      const web3 = await loadSolanaWeb3();
      const provider = getPhantomProvider();
      const fromPubkey = new web3.PublicKey(key.toString());
      if (provider.publicKey && provider.publicKey.toString() !== fromPubkey.toString()) {
        throw new Error('Phantom is connected to a different wallet. Reconnect Phantom and try again.');
      }
      const treasuryPublicKey = getTreasuryPublicKey(web3);
      const paymentLamports = decimalToLamports(amountValue);
      const { connection, blockhash, lastValidBlockHeight } = await getLatestBlockhashWithFallback(web3);
      const transaction = new web3.Transaction({ feePayer: fromPubkey, recentBlockhash: blockhash }).add(web3.SystemProgram.transfer({ fromPubkey, toPubkey: treasuryPublicKey, lamports: paymentLamports }));
      buyButton.disabled = true;
      buyButton.textContent = 'Processing...';
      notify('Opening Phantom approval...');
      let signature;
      if (typeof provider.sendTransaction === 'function') {
        signature = await provider.sendTransaction(transaction, connection, { preflightCommitment: 'confirmed' });
      } else if (typeof provider.signAndSendTransaction === 'function') {
        const result = await provider.signAndSendTransaction(transaction, { preflightCommitment: 'confirmed' });
        signature = typeof result === 'string' ? result : result?.signature;
      } else if (typeof provider.signTransaction === 'function') {
        const signedTransaction = await provider.signTransaction(transaction);
        signature = await connection.sendRawTransaction(signedTransaction.serialize(), { preflightCommitment: 'confirmed' });
      } else {
        throw new Error('Phantom cannot approve transactions in this browser. Update or unlock Phantom and try again.');
      }
      if (!signature) throw new Error('Phantom did not return a transaction signature.');
      await connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight }, 'confirmed');
      const distributionResponse = await fetch('/api/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signature, buyer: fromPubkey.toString(), amount: amountValue })
      });
      const distribution = await distributionResponse.json();
      if (!distributionResponse.ok) {
        throw new Error(`${distribution.error || 'QMN distribution failed.'} Payment signature: ${signature}`);
      }
      notify(`QMN sent: ${distribution.distributionSignature.slice(0, 12)}...`);
      return;
    }
  } catch (error) {
    const message = error?.code === 4001 || /reject|cancel/i.test(error?.message || '')
      ? 'Transaction was rejected in Phantom.'
      : error.message || 'The transaction failed before payment confirmation.';
    notify(message);
  } finally {
    buyButton.disabled = false;
    buyButton.textContent = 'Buy QMN →';
  }
}
document.querySelectorAll('.game-nav button').forEach((button) => button.addEventListener('click', () => showView(button.dataset.view)));
document.querySelectorAll('.planet-node').forEach((node) => node.addEventListener('click', () => {
  if (node.classList.contains('locked')) return notify('Andromeda is locked. Commander level 10 is required.');
  document.querySelectorAll('.planet-node').forEach((item) => item.classList.remove('selected'));
  node.classList.add('selected');
  $('#selectedPlanet').textContent = node.dataset.planet;
  $('#planetStatus').textContent = node.dataset.planet === 'Jupiter' ? 'Battle zone active. Enemy fleet awaiting orders.' : `${node.dataset.planet} discovered. Ready to set your route.`;
}));
$('#connectWallet').addEventListener('click', connectWallet);
$('#network').addEventListener('change', () => {
  const network = $('#network').value;
  $('#asset').innerHTML = '<option value="SOL">SOL</option>';
  walletPublicKey = null;
  $('#connectWallet').textContent = 'Connect wallet';
  $('#walletStatus').textContent = 'Wallet not connected';
});
$('#missionButton').addEventListener('click', () => { showView('battle'); notify('Entering the battle zone.'); });
$('#travelButton').addEventListener('click', () => {
  if ($('#selectedPlanet').textContent === 'Jupiter') return showView('battle');
  $('#ufo').style.left = `${20 + Math.random() * 55}%`;
  $('#ufo').style.top = `${25 + Math.random() * 50}%`;
  notify(`Flight started toward ${$('#selectedPlanet').textContent}.`);
});
$('#retreatButton').addEventListener('click', () => showView('galaxy'));
$('#fireButton').addEventListener('click', () => {
  if (enemies <= 0) return notify('Bu dalga temizlendi.');
  if (energy < 12) return notify('Energy is low.');
  energy -= 12;
  enemies -= 1;
  $('#enemyCount').textContent = enemies;
  document.querySelector('.enemy')?.remove();
  $('#battleLog').textContent = enemies ? 'Laser hit. Formation breaking.' : 'Wave cleared! +80 crystal.';
  if (!enemies) { crystals += 80; $('#wave').textContent = '2'; notify('Battle won. +80 crystal!'); }
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
  }; reader.readAsDataURL(file); notify('Preparing your alien avatar.');
});
document.querySelectorAll('.build-button').forEach((button) => button.addEventListener('click', () => {
  const cost = Number(button.dataset.cost || 0);
  if (cost && crystals < cost) return notify('Daha fazla kristal gerekli.');
  crystals -= cost; button.textContent = 'Ready ✓'; button.disabled = true; updateResource(); notify('New UFO/facility ready.');
}));
$('#digButton').addEventListener('click', () => { const reward = 25 + Math.floor(Math.random() * 35); crystals += reward; updateResource(); notify(`Dig complete: +${reward} crystal.`); });
setInterval(updateCountdown, 1000); setInterval(() => { if (energy < 86) { energy += 1; updateResource(); } }, 2200);
mountTierAndLaunchpad(); updateCountdown(); updateResource(); translatePageToEnglish();