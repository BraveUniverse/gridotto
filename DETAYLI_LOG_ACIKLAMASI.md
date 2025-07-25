# Detaylı Log Sistemi Açıklaması

## Yeni Log Sistemi

Artık contract çağrıları ve veri akışını daha iyi takip edebilmek için detaylı log sistemi eklendi.

## Log Kategorileri

### 1. Platform Bilgi Çağrıları
```
[getPlatformDrawsInfo] Contract not available
[getPlatformDrawsInfo] Calling contract method...
[getPlatformDrawsInfo] Raw response from contract: {...}
[getPlatformDrawsInfo] Raw response type: object
[getPlatformDrawsInfo] Raw response is array: false
[getPlatformDrawsInfo] Object properties:
  weeklyDrawId: 1n (type: bigint)
  monthlyDrawId: 0n (type: bigint)
  ...
[getPlatformDrawsInfo] Parsed object format: {...}
```

### 2. Official Draw Bilgileri
```
[getOfficialDrawInfo] Starting...
[getOfficialDrawInfo] Platform info received: {...}
[getOfficialDrawInfo] Final result: {...}
```

### 3. Prize Bilgileri
```
[getCurrentDrawPrize] Called - returning hardcoded 0
[getMonthlyPrize] Called - returning hardcoded 0
[getTicketPrice] Called - returning: 100000000000000000
```

### 4. HeroSection Data Loading
```
[HeroSection] Starting to load data...
[HeroSection] getCurrentDrawInfo result: {...}
[HeroSection] Weekly prize: 0
[HeroSection] Monthly prize: 0
[HeroSection] Ticket price: 100000000000000000
```

## BigInt Değerler

BigInt değerler artık düzgün bir şekilde loglanıyor:
- `1n` = BigInt(1)
- `0n` = BigInt(0)
- `100000000000000000n` = BigInt için wei değeri

## Contract Response Formatları

### Array Format
Eğer contract bir array döndürürse:
```
[getPlatformDrawsInfo] Raw response is array: true
[getPlatformDrawsInfo] Array elements:
  [0]: 1n (type: bigint)
  [1]: 0n (type: bigint)
  [2]: 0n (type: bigint)
  ...
```

### Object Format
Eğer contract bir object döndürürse:
```
[getPlatformDrawsInfo] Raw response is array: false
[getPlatformDrawsInfo] Object properties:
  weeklyDrawId: 1n (type: bigint)
  monthlyDrawId: 0n (type: bigint)
  ...
```

## Sorun Giderme

### "[object Object]" Sorunu Çözüldü
- Artık `JSON.stringify(obj, bigIntReplacer, 2)` kullanılıyor
- BigInt değerler "1n" formatında gösteriliyor
- Object'ler nested olarak görüntüleniyor

### Veri Tip Kontrolü
- Her property'nin tipi gösteriliyor
- Array vs Object kontrolü yapılıyor
- Değerlerin gerçek içeriği görülüyor

## Test Etmek İçin

1. Development modunda çalıştır: `npm run dev`
2. Browser'da localhost:3000'e git
3. F12 ile Developer Tools'u aç
4. Console tab'ına bak
5. Log'ları incele

## Beklenen Log Akışı

1. `[HeroSection] Starting to load data...`
2. `[getPlatformDrawsInfo] Calling contract method...`
3. `[getPlatformDrawsInfo] Raw response from contract: {...}`
4. `[getPlatformDrawsInfo] Parsed object format: {...}`
5. `[getOfficialDrawInfo] Starting...`
6. `[getOfficialDrawInfo] Platform info received: {...}`
7. `[getCurrentDrawPrize] Called - returning hardcoded 0`
8. `[getMonthlyPrize] Called - returning hardcoded 0`
9. `[getTicketPrice] Called - returning: 100000000000000000`
10. `[HeroSection] getCurrentDrawInfo result: {...}`

Artık hangi verilerin ne zaman çekildiği ve ne format'ta geldiği net bir şekilde görülüyor!