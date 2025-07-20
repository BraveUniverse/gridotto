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

## 9. WRITE FONKSİYONLARI - Çekiliş Oluşturma

### `createSimpleDraw()`
```solidity
function createSimpleDraw(
    uint256 ticketPrice,
    uint256 duration,
    uint256 maxTickets
) external payable returns (uint256 drawId);
```
**Açıklama:** Basit LYX çekilişi oluşturur. UI'daki quick create için.

### `createDrawWithRequirements()`
```solidity
function createDrawWithRequirements(
    uint256 ticketPrice,
    uint256 duration,
    uint256 maxTickets,
    uint8 requirementType, // 0: none, 1: token holder, 2: NFT holder, 3: follower
    address requiredAsset,
    uint256 minAmount
) external payable returns (uint256 drawId);
```
**Açıklama:** Katılım şartlı çekiliş oluşturur.

### `createMultiWinnerDraw()`
```solidity
function createMultiWinnerDraw(
    uint256 ticketPrice,
    uint256 duration,
    uint256 maxTickets,
    uint256 winnerCount,
    uint256[] memory prizeDistribution // percentage for each winner
) external payable returns (uint256 drawId);
```
**Açıklama:** Çoklu kazananlı çekiliş oluşturur.

## 10. WRITE FONKSİYONLARI - Bilet Satın Alma

### `buyTickets()`
```solidity
function buyTickets(
    uint256 drawId,
    uint256 ticketCount
) external payable;
```
**Açıklama:** Platform veya user draw için bilet satın alır. Tek fonksiyon, drawId'ye göre otomatik yönlendirir.

### `buyTicketsWithToken()`
```solidity
function buyTicketsWithToken(
    uint256 drawId,
    uint256 ticketCount,
    address tokenAddress
) external;
```
**Açıklama:** Token ile bilet satın alır.

### `buyTicketsForOthers()`
```solidity
function buyTicketsForOthers(
    uint256 drawId,
    address[] calldata recipients,
    uint256[] calldata ticketCounts
) external payable;
```
**Açıklama:** Başkaları için bilet satın alır (gift tickets).

## 11. WRITE FONKSİYONLARI - Ödül Yönetimi

### `claimAllPrizes()`
```solidity
function claimAllPrizes() external returns (
    uint256 lyxClaimed,
    uint256[] memory tokenAmounts,
    address[] memory tokenAddresses,
    bytes32[][] memory nftTokenIds,
    address[] memory nftContracts
);
```
**Açıklama:** Tüm bekleyen ödülleri tek seferde çeker.

### `claimPrize()`
```solidity
function claimPrize(uint256 drawId) external;
```
**Açıklama:** Belirli bir çekilişten kazanılan ödülü çeker.

### `claimTokenPrizes()`
```solidity
function claimTokenPrizes(address tokenAddress) external;
```
**Açıklama:** Belirli bir token'ın tüm ödüllerini çeker.

### `claimNFTPrizes()`
```solidity
function claimNFTPrizes(address nftContract) external;
```
**Açıklama:** Belirli bir NFT koleksiyonunun tüm ödüllerini çeker.

## 12. WRITE FONKSİYONLARI - Çekiliş Yönetimi

### `executeDraw()`
```solidity
function executeDraw(uint256 drawId) external;
```
**Açıklama:** Süresi dolan çekilişi sonuçlandırır. Hem platform hem user draw'lar için.

### `cancelDraw()`
```solidity
function cancelDraw(uint256 drawId) external;
```
**Açıklama:** Henüz bilet satılmamış çekilişi iptal eder.

### `extendDrawTime()`
```solidity
function extendDrawTime(uint256 drawId, uint256 additionalTime) external;
```
**Açıklama:** Çekiliş süresini uzatır (sadece creator).

### `addPrizeToDraw()`
```solidity
function addPrizeToDraw(uint256 drawId) external payable;
```
**Açıklama:** Mevcut çekilişe ekstra ödül ekler.

## 13. WRITE FONKSİYONLARI - Platform Çekilişleri

### `buyPlatformTickets()`
```solidity
function buyPlatformTickets(uint256 ticketCount) external payable;
```
**Açıklama:** Platform haftalık çekilişi için bilet alır.

### `buyMonthlyTickets()`
```solidity
function buyMonthlyTickets(uint256 ticketCount) external payable;
```
**Açıklama:** Aylık çekiliş için bilet alır.

### `executePlatformDraw()`
```solidity
function executePlatformDraw() external;
```
**Açıklama:** Platform çekilişini sonuçlandırır (herkes çağırabilir, executor reward alır).

### `executeMonthlyDraw()`
```solidity
function executeMonthlyDraw() external;
```
**Açıklama:** Aylık çekilişi sonuçlandırır.

## 14. WRITE FONKSİYONLARI - Sosyal Özellikler

### `followUser()`
```solidity
function followUser(address user) external;
```
**Açıklama:** LSP26 ile kullanıcıyı takip eder.

### `unfollowUser()`
```solidity
function unfollowUser(address user) external;
```
**Açıklama:** Takibi bırakır.

### `tipCreator()`
```solidity
function tipCreator(uint256 drawId) external payable;
```
**Açıklama:** Çekiliş yaratıcısına bahşiş gönderir.

## 15. Batch İşlemler

### `batchBuyTickets()`
```solidity
function batchBuyTickets(
    uint256[] calldata drawIds,
    uint256[] calldata ticketCounts
) external payable;
```
**Açıklama:** Birden fazla çekilişe aynı anda bilet alır.

### `batchClaimPrizes()`
```solidity
function batchClaimPrizes(uint256[] calldata drawIds) external;
```
**Açıklama:** Birden fazla çekilişten ödül çeker.

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
- Kolay çekiliş oluşturma
- Toplu bilet alımı
- Hızlı ödül çekimi
- Sosyal etkileşimler