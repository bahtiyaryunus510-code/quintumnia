const {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction
} = require('@solana/web3.js');
const {
  TOKEN_PROGRAM_ID,
  getAccount,
  getAssociatedTokenAddress,
  getOrCreateAssociatedTokenAccount,
  transferChecked
} = require('@solana/spl-token');

const CONFIG = {
  devnet: {
    rpc: process.env.SOLANA_DEVNET_RPC || 'https://api.devnet.solana.com',
    mint: 'F6AVJ1wtj6BfTAU7qmoaN2f7FPGusifhgr2Sr9sDYqe7',
    treasury: '956WKowgGxqkZAU6bN9fvkhZvtbtexXxUPUjrKdFU7dJ'
  },
  mainnet: {
    rpc: process.env.SOLANA_MAINNET_RPC || 'https://api.mainnet-beta.solana.com',
    mint: 'CsQr1Uu3TcWp9poQtVa8JSJm5xnsPjomBiTPznpFtaoQ',
    treasury: '956WKowgGxqkZAU6bN9fvkhZvtbtexXxUPUjrKdFU7dJ'
  }
};
const TOKEN_DECIMALS = 9;
const MIN_SOL = 0.1;

function fail(response, status, message) {
  return response.status(status).json({ error: message });
}

function getAuthority() {
  const encoded = process.env.QMN_AUTHORITY_SECRET_KEY;
  if (!encoded) throw new Error('QMN_AUTHORITY_SECRET_KEY ayarlanmamış.');
  const secret = JSON.parse(encoded);
  return Keypair.fromSecretKey(Uint8Array.from(secret));
}

function getRawTokenAmount(solAmount) {
  const rate = solAmount >= 10.01 ? 9000 : 9950;
  return BigInt(Math.floor(solAmount * rate * 10 ** TOKEN_DECIMALS));
}

function hasPaymentInstruction(transaction, sender, treasury, lamports) {
  return transaction?.transaction.message.instructions.some((instruction) => {
    const parsed = instruction.parsed;
    return instruction.program === 'system' && parsed?.type === 'transfer'
      && parsed.info.source === sender
      && parsed.info.destination === treasury
      && Number(parsed.info.lamports) === lamports;
  });
}

module.exports = async function handler(request, response) {
  if (request.method !== 'POST') return fail(response, 405, 'Yalnızca POST desteklenir.');
  const { signature, buyer, amount, network = 'devnet' } = request.body || {};
  const config = CONFIG[network];
  if (!config) return fail(response, 400, 'Geçersiz Solana ağı.');
  if (network === 'mainnet' && process.env.ENABLE_MAINNET_ALLOCATIONS !== 'true') {
    return fail(response, 403, 'Mainnet dağıtımı henüz etkin değil.');
  }
  if (typeof signature !== 'string' || !/^[1-9A-HJ-NP-Za-km-z]{80,100}$/.test(signature)) {
    return fail(response, 400, 'Geçersiz işlem imzası.');
  }
  if (typeof buyer !== 'string' || !PublicKey.isOnCurve(buyer)) return fail(response, 400, 'Geçersiz alıcı adresi.');
  const solAmount = Number(amount);
  if (!Number.isFinite(solAmount) || solAmount < MIN_SOL || solAmount > 100) return fail(response, 400, 'Ödeme miktarı 0,1 ile 100 SOL arasında olmalı.');

  try {
    const authority = getAuthority();
    const treasury = new PublicKey(config.treasury);
    if (!authority.publicKey.equals(treasury)) return fail(response, 500, 'Authority treasury ile eşleşmiyor.');
    const connection = new Connection(config.rpc, 'confirmed');
    const transaction = await connection.getParsedTransaction(signature, { commitment: 'confirmed', maxSupportedTransactionVersion: 0 });
    const lamports = Math.round(solAmount * 1e9);
    if (!transaction || transaction.meta?.err || !hasPaymentInstruction(transaction, buyer, config.treasury, lamports)) {
      return fail(response, 400, 'Ödeme işlemi doğrulanamadı.');
    }

    const mint = new PublicKey(config.mint);
    const source = process.env.QMN_SOURCE_TOKEN_ACCOUNT;
    if (!source) return fail(response, 503, 'QMN_SOURCE_TOKEN_ACCOUNT ayarlanmamış.');
    const sourceAccount = await getAccount(connection, new PublicKey(source), 'confirmed', TOKEN_PROGRAM_ID);
    if (!sourceAccount.owner.equals(authority.publicKey)) return fail(response, 500, 'QMN kaynak hesabı authority ile eşleşmiyor.');
    const rawAmount = getRawTokenAmount(solAmount);
    if (sourceAccount.amount < rawAmount) return fail(response, 503, 'QMN kaynak hesabında yeterli bakiye yok.');

    const recipient = await getOrCreateAssociatedTokenAccount(connection, authority, mint, new PublicKey(buyer), false, 'confirmed', { commitment: 'confirmed' }, TOKEN_PROGRAM_ID);
    const transferSignature = await transferChecked(connection, authority, sourceAccount.address, mint, recipient.address, authority, rawAmount, TOKEN_DECIMALS, [], undefined, TOKEN_PROGRAM_ID);
    return response.status(200).json({ signature, transferSignature, amount: solAmount, qmnAmount: Number(rawAmount) / 10 ** TOKEN_DECIMALS, mint: config.mint, network });
  } catch (error) {
    console.error('QMN allocation failed', error);
    return fail(response, 500, 'QMN dağıtımı tamamlanamadı.');
  }
};
