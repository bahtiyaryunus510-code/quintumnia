# Quintumnia - Web3 Galactic War

Quintumnia Web3 galactic war oyunu. Solana Devnet üzerinde test tahsisi.

## Teknik Özellikler

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Web3**: Solana Web3.js ve Vercel Serverless Function
- **Hosting**: Vercel

## Deploy ve Domain

Bu proje Vercel'de canlı:
- https://www.quintumnia.space
- https://quintumnia.vercel.app (geçici)

Apex domain `quintumnia.space` otomatik olarak `https://www.quintumnia.space` adresine yönlendirilir.

Domainleri Vercel projesine eklemek için PowerShell'de Vercel token oluşturup şu komutları çalıştırın:

```powershell
$env:VERCEL_TOKEN = "<vercel-token>"
.\scripts\add_vercel_domains.ps1
```

Script `quintumnia.space` ve `www.quintumnia.space` alan adlarını `quintumnia` projesine ekler ve hata oluşursa işlemi durdurur. Namecheap Advanced DNS'te mevcut parking kayıtlarını silip şu kayıtları ekleyin:

```text
A      @      76.76.21.21
CNAME  www    cname.vercel-dns.com
```

`www` için `parkingpage.namecheap.com` ve apex için `162.255.119.191` kayıtları kalırsa site Vercel'e ulaşmaz. DNS değişikliğinden sonra 5-30 dakika bekleyip domain durumunu kontrol edin:

```powershell
vercel domains inspect quintumnia.space --token $env:VERCEL_TOKEN
vercel domains inspect www.quintumnia.space --token $env:VERCEL_TOKEN
```

## Özellikleri

- ✦ Galaksi haritası
- ⌁ UFO hangarı
- ⌂ Üssüm yönetimi
- ▦ Hazine sandığı
- QMN token ön satışı
- Solana Devnet tahsis testi

## Devnet test akışı

Presale arayüzü Solana Devnet üzerinde çalışır. Phantom ile bağlandıktan sonra SOL transferi onaylanır; `/api/allocate` backend'i işlemi treasury adresine karşı doğrular ve QMN kaynak token hesabından alıcının ATA'sine token gönderir. Tahsis, token transferi başarıyla tamamlandıktan sonra tarayıcının `localStorage` alanına kaydedilir.

## Backend kurulumu

```powershell
npm install
vercel env add QMN_AUTHORITY_SECRET_KEY production
vercel env add QMN_DEVNET_SOURCE_TOKEN_ACCOUNT production
vercel env add QMN_MAINNET_SOURCE_TOKEN_ACCOUNT production
vercel env add ENABLE_MAINNET_ALLOCATIONS production
```

`QMN_AUTHORITY_SECRET_KEY`, QMN kaynak token hesaplarının sahibi olan treasury keypair'inin JSON secret-key dizisidir. Bu değeri frontend'e, Git'e veya sohbet mesajına koymayın. `QMN_DEVNET_SOURCE_TOKEN_ACCOUNT` ve `QMN_MAINNET_SOURCE_TOKEN_ACCOUNT`, ilgili ağdaki QMN token hesaplarıdır; treasury wallet adresi bu alanlara yazılmamalıdır. Mainnet için `ENABLE_MAINNET_ALLOCATIONS` yalnızca dağıtım hesabı ve testleri doğrulandıktan sonra `true` yapılmalıdır; varsayılan değer `false`'dur.

## Lisans

Tüm hakları saklıdır.
