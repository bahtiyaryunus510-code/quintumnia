# Quintumnia - Web3 Galactic War

Quintumnia Web3 galactic war oyunu. Solana Devnet üzerinde test tahsisi.

## Teknik Özellikler

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Web3**: Solana Web3.js (Devnet test akışı)
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

Presale arayüzü şu anda yalnızca Solana Devnet üzerinde çalışır. Phantom ile bağlandıktan sonra test SOL transferi onaylanır; cüzdan public adresi, hesaplanan QMN tahsisi, işlem imzası ve 90 günlük claim tarihi tarayıcının `localStorage` alanına kaydedilir. Bu kayıt henüz on-chain presale sözleşmesi değildir ve mainnet fonu kabul edilmez.

## Lisans

Tüm hakları saklıdır.
