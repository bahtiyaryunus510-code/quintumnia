const {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  LAMPORTS_PER_SOL
} = require('@solana/web3.js');
const {
  getMint,
  getOrCreateAssociatedTokenAccount,
  getAccount,
  transferChecked
} = require('@solana/spl-token');

const RPC_URL = process.env.SOLANA_RPC_URL || 'https://solana-rpc.publicnode.com';
const TREASURY_ADDRESS = process.env.TREASURY_ADDRESS || '956WKowgGxqkZAU6bN9fvkhZvtbtexXxUPUjrKdFU7dJ';
const MINT_ADDRESS = process.env.QMN_MINT_ADDRESS || process.env.CsQr1Uu3TcWp9poQtVa8JSJm5xnsPjomBiTPznpFtaoQ || 'CsQr1Uu3TcWp9poQtVa8JSJm5xnsPjomBiTPznpFtaoQ';
const SOURCE_TOKEN_ACCOUNT = process.env.QMN_SOURCE_TOKEN_ACCOUNT || process.env.QMN_MAINNET_SOURCE_TOKEN_ACCOUNT;
const TOKEN_AUTHORITY_SECRET = process.env.QMN_TOKEN_AUTHORITY_SECRET || process.env.QMN_AUTHORITY_SECRET_KEY;
const QMN_PER_SOL = 10000n;

function json(res, status, body) {
  res.status(status);
  res.setHeader('Content-Type', 'application/json');
  return res.send(JSON.stringify(body));
}

function parseLamports(value) {
  const [whole, fraction = ''] = String(value).split('.');
  if (!/^\d+$/.test(whole || '') || !/^\d*$/.test(fraction) || fraction.length > 9) throw new Error('Geçersiz SOL miktarı.');
  return BigInt(whole || '0') * BigInt(LAMPORTS_PER_SOL) + BigInt(`${fraction}000000000`.slice(0, 9) || '0');
}

function parseKeypair() {
  if (!TOKEN_AUTHORITY_SECRET) throw new Error('QMN_TOKEN_AUTHORITY_SECRET tanımlı değil.');
  const bytes = JSON.parse(TOKEN_AUTHORITY_SECRET);
  return Keypair.fromSecretKey(Uint8Array.from(bytes));
}

async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Yalnızca POST desteklenir.' });
  try {
    const { signature, buyer, amount } = req.body || {};
    if (!signature || !buyer || amount === undefined) throw new Error('signature, buyer ve amount zorunlu.');

    const buyerKey = new PublicKey(buyer);
    const treasuryKey = new PublicKey(TREASURY_ADDRESS);
    const mintKey = new PublicKey(MINT_ADDRESS);
    const expectedLamports = parseLamports(amount);
    if (expectedLamports < 10000000n) throw new Error('Minimum satın alma 0.01 SOL.');

    const connection = new Connection(RPC_URL, 'confirmed');
    const parsed = await connection.getParsedTransaction(signature, { commitment: 'confirmed', maxSupportedTransactionVersion: 0 });
    if (!parsed || parsed.meta?.err) throw new Error('Ödeme transaction doğrulanamadı.');

    const payment = parsed.transaction.message.instructions.find((instruction) => instruction.program === 'system' && instruction.parsed?.type === 'transfer' && instruction.parsed.info.destination === treasuryKey.toBase58() && instruction.parsed.info.source === buyerKey.toBase58());
    if (!payment || BigInt(payment.parsed.info.lamports) !== expectedLamports) throw new Error('Ödeme tutarı veya hazine adresi eşleşmiyor.');

    const authority = parseKeypair();
    if (!SOURCE_TOKEN_ACCOUNT) throw new Error('QMN_SOURCE_TOKEN_ACCOUNT tanımlı değil.');
    const sourceTokenAccount = new PublicKey(SOURCE_TOKEN_ACCOUNT);
    const sourceAccount = await getAccount(connection, sourceTokenAccount);
    if (sourceAccount.owner.toBase58() !== authority.publicKey.toBase58()) throw new Error('QMN dağıtım hesabı yetkili cüzdana ait değil.');

    const mint = await getMint(connection, mintKey);
    if (sourceAccount.mint.toBase58() !== mintKey.toBase58()) throw new Error('QMN dağıtım hesabı belirtilen mint adresine ait değil.');
    const qmnAmount = expectedLamports * QMN_PER_SOL * (10n ** BigInt(mint.decimals)) / BigInt(LAMPORTS_PER_SOL);
    if (sourceAccount.amount < qmnAmount) throw new Error('QMN dağıtım hesabında yeterli token bakiyesi yok.');
    const destination = await getOrCreateAssociatedTokenAccount(connection, authority, mintKey, buyerKey);
    const distributionSignature = await transferChecked(connection, authority, sourceTokenAccount, mintKey, destination.address, authority, qmnAmount, mint.decimals);

    return json(res, 200, { paymentSignature: signature, distributionSignature, mint: mintKey.toBase58(), amount: qmnAmount.toString() });
  } catch (error) {
    return json(res, 400, { error: error.message || 'Satın alma tamamlanamadı.' });
  }
}

module.exports = handler;
