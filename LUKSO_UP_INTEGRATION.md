# LUKSO Universal Profile Integration

## Özet

Gridotto projesi LUKSO Universal Profile (UP) provider ile uyumlu hale getirilmiştir. Bu entegrasyon, kullanıcıların hem EOA (Externally Owned Account) hem de Universal Profile hesapları ile işlem yapabilmesini sağlar.

## Yapılan Değişiklikler

### 1. Transaction Helper (`src/utils/luksoTransactionHelper.ts`)

LUKSO UP ile uyumlu transaction gönderimi için merkezi bir helper modülü oluşturuldu:

- **Universal Profile Tespiti**: Hesabın UP olup olmadığını kontrol eder
- **Key Manager Desteği**: UP hesapları için Key Manager üzerinden işlem gönderimi
- **EOA Fallback**: EOA hesapları için standart transaction desteği

### 2. Hook Güncellemeleri

Tüm transaction gönderen hook'lar LUKSO UP uyumlu hale getirildi:

- `useGridottoCoreV2.ts`: Draw oluşturma ve ticket satın alma
- `useGridottoExecutionV2.ts`: Draw çekiliş işlemleri
- `useGridottoRefund.ts`: Ödül talep ve iade işlemleri

### 3. Key Manager Entegrasyonu

Universal Profile'lar Key Manager üzerinden işlem yapar. Sistem otomatik olarak:

1. Hesabın UP olup olmadığını kontrol eder
2. UP ise Key Manager adresini bulur
3. İşlemi Key Manager'ın `execute` fonksiyonu üzerinden gönderir

## Teknik Detaylar

### Universal Profile Tespiti

```typescript
async function checkIfUniversalProfile(web3: Web3, address: string): Promise<boolean> {
  const code = await web3.eth.getCode(address);
  return code !== '0x' && code !== '0x0';
}
```

### Key Manager Adresi Bulma

```typescript
const LSP6_KEY = '0x4b80742de2bf393a64c70290360c27e3e68c2a02c8ab5b7c4e88e3a5f6c02a9e';
const keyManagerAddress = await web3.eth.getStorageAt(upAddress, LSP6_KEY);
```

### Transaction Gönderimi

UP hesapları için:
1. Transaction data'sı encode edilir
2. Key Manager kontratı üzerinden `execute` çağrılır
3. Operation type: 0 (CALL)

## Kullanım

Mevcut kod yapısında herhangi bir değişiklik yapmanıza gerek yoktur. Sistem otomatik olarak hesap tipini algılar ve uygun transaction metodunu kullanır.

## Test Etme

1. LUKSO UP Browser Extension'ı yükleyin
2. Testnet'te bir Universal Profile oluşturun
3. Gridotto'ya bağlanın ve işlem yapmayı deneyin

## Notlar

- Diamond kontrat adresi: `0x5Ad808FAE645BA3682170467114e5b80A70bF276`
- LUKSO Testnet RPC: `https://rpc.testnet.lukso.network`
- UP Extension: https://docs.lukso.tech/guides/browser-extension/install-browser-extension/