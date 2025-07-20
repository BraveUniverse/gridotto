# Gridotto Diamond Contract - Eksik Fonksiyonlar

Bu dosya, Gridotto UI'ın tam fonksiyonel olması için diamond contract'a eklenmesi gereken view fonksiyonlarını içerir.

## 1. Platform İstatistikleri

### `getContractInfo()`
```solidity
function getContractInfo() external view returns (
    uint256 ticketPrice,
    uint256 drawInterval,
    uint256 monthlyDrawInterval,
    uint256 ownerFeePercent,
    uint256 monthlyPoolPercent,
    bool paused
);
```
**Açıklama:** Platform ayarlarını döndürür. UI'da ticket fiyatı, çekiliş aralıkları ve platform durumu göstermek için gerekli.

### `getPlatformTotals()`
```solidity
function getPlatformTotals() external view returns (
    uint256 totalDrawsCompleted,
    uint256 totalPrizesDistributed,
    uint256 totalTicketsSold,
    uint256 totalUsers,
    uint256 totalUserDrawsCreated
);
```
**Açıklama:** Platform genelindeki toplam istatistikleri döndürür.

## 2. Kullanıcı Bilgileri

### `getUserStats()`
```solidity
function getUserStats(address user) external view returns (
    uint256 totalTicketsBought,
    uint256 totalWins,
    uint256 totalPrizesWon,
    uint256 totalDrawsCreated,
    uint256 totalDrawsParticipated,
    uint256 pendingPrizes,
    uint256 lastActivityTime
);
```
**Açıklama:** Kullanıcının tüm aktivitelerini özetler.

### `getUserActiveParticipations()`
```solidity
function getUserActiveParticipations(address user) external view returns (
    uint256[] memory platformDrawIds,
    uint256[] memory userDrawIds,
    uint256[] memory ticketCounts
);
```
**Açıklama:** Kullanıcının aktif olarak katıldığı tüm çekilişleri listeler.

### `getUserWinHistory()`
```solidity
function getUserWinHistory(address user) external view returns (
    uint256[] memory drawIds,
    uint256[] memory prizes,
    uint256[] memory timestamps,
    bool[] memory claimed
);
```
**Açıklama:** Kullanıcının kazanç geçmişini döndürür.

## 3. Çekiliş Bilgileri

### `getActiveUserDrawsPaginated()`
```solidity
function getActiveUserDrawsPaginated(
    uint256 offset,
    uint256 limit,
    uint8 drawType // 0: all, 1: LYX, 2: LSP7, 3: LSP8
) external view returns (
    uint256[] memory drawIds,
    uint256 totalCount
);
```
**Açıklama:** Aktif user draw'larını sayfalı ve filtrelenmiş olarak döndürür.

### `getDrawFullDetails()`
```solidity
function getDrawFullDetails(uint256 drawId) external view returns (
    address creator,
    uint8 drawType,
    uint256 ticketPrice,
    uint256 ticketsSold,
    uint256 maxTickets,
    uint256 currentPrizePool,
    uint256 startTime,
    uint256 endTime,
    bool isCompleted,
    address[] memory winners,
    uint256[] memory winnerPrizes,
    address tokenAddress, // LSP7 draws
    address nftContract,  // LSP8 draws
    bytes32[] memory nftTokenIds // LSP8 draws
);
```
**Açıklama:** Bir çekilişin tüm detaylarını döndürür.

### `getDrawLeaderboard()`
```solidity
function getDrawLeaderboard(uint256 drawId) external view returns (
    address[] memory participants,
    uint256[] memory ticketCounts,
    uint256[] memory percentages
);
```
**Açıklama:** Çekiliş için lider tablosunu döndürür.

## 4. Platform Çekilişleri

### `getCurrentDrawDetails()`
```solidity
function getCurrentDrawDetails() external view returns (
    uint256 drawNumber,
    uint256 endTime,
    uint256 prizePool,
    uint256 ticketsSold,
    address[] memory recentParticipants,
    uint256[] memory recentTicketCounts
);
```
**Açıklama:** Mevcut platform çekilişinin detaylı bilgilerini döndürür.

### `getDrawHistory()`
```solidity
function getDrawHistory(uint256 offset, uint256 limit) external view returns (
    uint256[] memory drawNumbers,
    address[] memory winners,
    uint256[] memory prizes,
    uint256[] memory endTimes
);
```
**Açıklama:** Platform çekiliş geçmişini döndürür.

## 5. Token/NFT Bilgileri

### `getUserPendingTokenPrizes()`
```solidity
function getUserPendingTokenPrizes(address user) external view returns (
    address[] memory tokenAddresses,
    uint256[] memory amounts
);
```
**Açıklama:** Kullanıcının bekleyen token ödüllerini listeler.

### `getUserPendingNFTPrizes()`
```solidity
function getUserPendingNFTPrizes(address user) external view returns (
    address[] memory nftContracts,
    bytes32[][] memory tokenIds
);
```
**Açıklama:** Kullanıcının bekleyen NFT ödüllerini listeler.

## 6. VIP ve Özel Özellikler

### `getUserVIPStatus()`
```solidity
function getUserVIPStatus(address user) external view returns (
    uint8 vipTier,
    uint256 discountPercent,
    uint256 bonusTicketPercent,
    bool hasActiveVIP
);
```
**Açıklama:** Kullanıcının VIP durumunu döndürür.

## 7. Arama ve Filtreleme

### `searchDrawsByCreator()`
```solidity
function searchDrawsByCreator(address creator) external view returns (
    uint256[] memory drawIds,
    bool[] memory isActive
);
```
**Açıklama:** Belirli bir kullanıcının oluşturduğu çekilişleri arar.

### `getDrawsByPrizeRange()`
```solidity
function getDrawsByPrizeRange(
    uint256 minPrize,
    uint256 maxPrize
) external view returns (uint256[] memory drawIds);
```
**Açıklama:** Prize pool aralığına göre çekilişleri filtreler.

## 8. Real-time Güncellemeler

### `getRecentActivities()`
```solidity
function getRecentActivities(uint256 limit) external view returns (
    uint8[] memory activityTypes, // 0: ticket bought, 1: draw created, 2: prize won
    address[] memory users,
    uint256[] memory amounts,
    uint256[] memory timestamps
);
```
**Açıklama:** Platform genelindeki son aktiviteleri döndürür.

## Notlar

1. **Pagination:** Büyük veri setleri için sayfalama desteği eklendi
2. **Filtering:** DrawType'a göre filtreleme imkanı
3. **Gas Optimization:** View fonksiyonları gas limitlerine dikkat etmeli
4. **Error Handling:** Boş veya geçersiz drawId'ler için uygun error mesajları
5. **Batch Operations:** Birden fazla veriyi tek seferde çekmek için batch fonksiyonlar

## Implementasyon Önerileri

1. Bu fonksiyonları yeni bir `GridottoViewFacet.sol` dosyasında toplayabilirsiniz
2. Storage okumalarını optimize etmek için batch okuma yapın
3. Large array'ler için pagination kullanın
4. Sık kullanılan verileri cache'lemek için event'ler kullanın

## UI Entegrasyonu

Bu fonksiyonlar eklendikten sonra UI'da şunlar mümkün olacak:
- Gerçek zamanlı platform istatistikleri
- Kullanıcı profil sayfası
- Detaylı çekiliş bilgileri
- Lider tabloları
- Aktivite feed'i
- Gelişmiş arama ve filtreleme