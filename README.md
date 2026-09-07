# Quintumnia - Web3 Galactic War

Quintumnia Web3 galactic war oyunu. ETH, USDT veya BNB ile ön satış.

## Teknik Özellikler

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Web3**: Solana Web3.js, MetaMask (EVM)
- **Hosting**: Vercel

## Deploy

Ana domain:
- https://quintumnia.space

Vercel önizleme adresi:
- https://quintumnia.vercel.app

## Özellikleri

- ✦ Galaksi haritası
- ⌁ UFO hangarı
- ⌂ Üssüm yönetimi
- ▦ Hazine sandığı
- QMN token ön satışı
- Solana/Ethereum/BNB desteği

## QMN dağıtım ayarları

Vercel Environment Variables bölümünde şu değerleri tanımla:

- `SOLANA_RPC_URL`: Mainnet RPC adresi
- `TREASURY_ADDRESS`: `956WKowgGxqkZAU6bN9fvkhZvtbtexXxUPUjrKdFU7dJ`
- `QMN_MINT_ADDRESS`: `CsQr1Uu3TcWp9poQtVa8JSJm5xnsPjomBiTPznpFtaoQ`
- `QMN_SOURCE_TOKEN_ACCOUNT`: QMN dağıtım token hesabı
- `QMN_TOKEN_AUTHORITY_SECRET`: Dağıtım token hesabının yetkili cüzdan secret key JSON dizisi

`QMN_TOKEN_AUTHORITY_SECRET` yalnızca Vercel secret environment variable olarak tutulmalıdır; frontend dosyalarına veya git deposuna eklenmemelidir.

## Lisans

Tüm hakları saklıdır.
