import { useState, useEffect, useCallback, useMemo } from 'react';
import { useUPProvider } from './useUPProvider';
import { GRIDOTTO_CONTRACT_ADDRESS, GRIDOTTO_CONTRACT_ABI } from '../config/contract';
import { AbiItem } from 'web3-utils';
import BigNumber from 'bignumber.js';

// Check if running on client-side
const isClient = typeof window !== 'undefined';

/**
 * Hook for interacting with the Gridotto contract
 * @returns Methods to call contract functions
 */
export const useGridottoContract = () => {
  const { web3, isConnected, account } = useUPProvider();
  const [contract, setContract] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [ticketPriceWei, setTicketPriceWei] = useState<string | null>(null);

  // For display purposes
  const ticketPrice = useMemo(() => {
    if (!ticketPriceWei || !web3) return '0.1';
    try {
      return web3.utils.fromWei(ticketPriceWei, 'ether');
    } catch (err) {
      return '0.1';
    }
  }, [ticketPriceWei, web3]);

  // Create contract instance
  useEffect(() => {
    if (!isClient || !web3) return;
    
    try {
      // LUKSO dökümanına uygun şekilde kontrat instance'ı oluştur
      const contractInstance = new web3.eth.Contract(
        GRIDOTTO_CONTRACT_ABI as AbiItem[],
        GRIDOTTO_CONTRACT_ADDRESS
      );
      
      setContract(contractInstance);
      setError(null);
    } catch (err: any) {
      setError('Could not connect to contract');
      setContract(null);
    }
  }, [web3]);

  // Get current draw info
  const getCurrentDrawInfo = useCallback(async () => {
    if (!isClient || !contract || !web3) {
      return null;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await contract.methods.getCurrentDrawInfo().call();
      
      // Format remaining time
      const remainingTime = formatTime(Number(result.remainingTime));
      
      setIsLoading(false);
      
      return {
        drawNumber: Number(result.drawNumber),
        prizePool: web3.utils.fromWei(result.prizePool, 'ether'),
        ticketCount: Number(result.ticketCount),
        remainingTime: Number(result.remainingTime)
      };
    } catch (err: any) {
      setError('Could not get draw information');
      setIsLoading(false);
      return null;
    }
  }, [contract, web3]);

  // Get monthly draw info
  const getMonthlyDrawInfo = useCallback(async () => {
    if (!isClient || !contract || !web3) {
      return null;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await contract.methods.getCurrentMonthlyDrawInfo().call();
      
      // Format remaining time
      const remainingTime = formatTime(Number(result.remainingTime));
      
      setIsLoading(false);
      
      return {
        drawNumber: Number(result.drawNumber),
        prizePool: web3.utils.fromWei(result.prizePool, 'ether'),
        ticketCount: Number(result.ticketCount),
        remainingTime: Number(result.remainingTime)
      };
    } catch (err: any) {
      setError('Could not get monthly draw information');
      setIsLoading(false);
      return null;
    }
  }, [contract, web3]);

  // Get contract info
  const getContractInfo = useCallback(async () => {
    if (!isClient || !contract || !web3) {
      return null;
    }

    try {
      const contractInfo = await contract.methods.getContractInfo().call();
      
      // Bilet fiyatını ayarla
      setTicketPriceWei(contractInfo._ticketPrice);
      
      return {
        ticketPrice: web3.utils.fromWei(contractInfo._ticketPrice, 'ether'),
        ownerFeePercent: contractInfo._ownerFeePercent,
        monthlyPoolPercent: contractInfo._monthlyPoolPercent,
        totalTicketCount: contractInfo._totalTicketCount,
        contractBalance: web3.utils.fromWei(contractInfo._contractBalance, 'ether')
      };
    } catch (err) {
      return null;
    }
  }, [contract, web3]);

  // Buy ticket - Oracle kullanımı nedeniyle randomSeed parametresi kaldırıldı
  const buyTicket = useCallback(async (contextProfile: string, amount: number) => {
    if (!isClient || !contract || !account || !web3) {
      return null;
    }

    if (!ticketPriceWei) {
      // Otomatik olarak kontrat bilgisini almaya çalışalım
      try {
        const contractInfo = await getContractInfo();
        
        // Yine de ticketPriceWei yoksa hata dön
        if (!ticketPriceWei) {
          return null;
        }
      } catch (e) {
        return null;
      }
    }

    setIsLoading(true);
    setError(null);

    try {
      // Bilet fiyatını hesapla
      const totalPrice = new BigNumber(ticketPriceWei).times(amount).toString();
      
      // Oracle kullanımı nedeniyle randomSeed parametresi kaldırıldı
      const result = await contract.methods.buyTicket(contextProfile, amount).send({
        from: account,
        value: totalPrice
      });

      setIsLoading(false);
      return { success: true, txHash: result.transactionHash };
    } catch (error: any) {
      setError(error.message || 'Failed to buy ticket');
      setIsLoading(false);
      return null;
    }
  }, [contract, web3, account, ticketPriceWei, getContractInfo]);

  // Bulk buy tickets for selected followers
  const bulkBuyForSelectedFollowers = useCallback(async (selectedAddresses: string[]) => {
    if (!isClient || !contract || !web3 || !account) {
      return null;
    }

    // Validate input
    if (!selectedAddresses || selectedAddresses.length === 0) {
      setError('No addresses selected for bulk buy');
      return null;
    }

    // Check if we have ticket price
    if (!ticketPriceWei) {
      try {
        const info = await getContractInfo();
        if (!info) {
          return null;
        }
      } catch (e) {
        console.error("Error fetching contract info:", e);
        return null;
      }
    }

    // If still no ticket price, abort
    if (!ticketPriceWei) {
      setError('Could not determine ticket price');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Calculate total price based on number of valid addresses
      const totalPrice = new BigNumber(ticketPriceWei).times(selectedAddresses.length).toString();
      
      // Send transaction to buy tickets for selected followers
      const result = await contract.methods.bulkBuyForSelectedFollowers(selectedAddresses).send({
        from: account,
        value: totalPrice
      });

      setIsLoading(false);
      return { success: true, txHash: result.transactionHash };
    } catch (error: any) {
      setError(error.message || 'Failed to buy tickets for followers');
      setIsLoading(false);
      return null;
    }
  }, [contract, web3, account, ticketPriceWei, getContractInfo]);

  // Get top buyers (with category and period options)
  const getTopBuyers = useCallback(async (category = 'buyers', period = 'weekly') => {
    if (!isClient || !contract || !web3) {

      return null;
    }

    try {
      setIsLoading(true);
      
      // Şu anda kontrat sadece genel getTopBuyers fonksiyonunu destekliyor
      // Gelecekte özelleştirilmiş fonksiyonlar eklenebilir
      
      // TODO: Kategori ve dönem parametreleri eklendikten sonra:
      // if (category === 'profiles') {
      //   if (period === 'weekly') {
      //     return await contract.methods.getTopProfiles(false).call();
      //   } else {
      //     return await contract.methods.getTopProfiles(true).call();
      //   }
      // } else {
      //   if (period === 'weekly') {
      //     return await contract.methods.getTopBuyers(false).call();
      //   } else {
      //     return await contract.methods.getTopBuyers(true).call();
      //   }
      // }
      
      // Şimdilik mevcut getTopBuyers fonksiyonunu kullanıyoruz
      const result = await contract.methods.getTopBuyers().call();
      
   
      
      // Fake implementation - Profiller için farklı sonuçlar üret
      if (category === 'profiles') {
        // Aynı kullanıcıları kullan fakat farklı bilet sayıları oluştur
        const users = [...result.users];
        // Bilet sayıları için sahte veriler oluştur
        const ticketCounts = result.ticketCounts.map((count: any) => {
          // Daha gerçekçi olması için orijinal değere yakın bir değer üret
          const randomFactor = Math.random() * 0.4 + 0.8; // 0.8-1.2 arası
          return Math.round(Number(count) * randomFactor);
        });
        
        // Kullanıcıları bilet sayılarına göre sırala
        const combined = users.map((user, i) => ({ 
          user, 
          count: Number(ticketCounts[i])
        }));
        combined.sort((a, b) => b.count - a.count);
        
        return {
          users: combined.map(item => item.user),
          ticketCounts: combined.map(item => item.count)
        };
      }
      
      // Standart sonuç döndür ve string değerleri sayılara dönüştür
      return {
        users: result.users,
        ticketCounts: result.ticketCounts.map((count: any) => Number(count))
      };
    } catch (err) {

      return null;
    } finally {
      setIsLoading(false);
    }
  }, [contract, web3, isClient]);

  // Haftalık detaylı liderlik tablosu verilerini al
  const getWeeklyDetailedTopBuyers = useCallback(async (maxCount = 50) => {
    if (!isClient || !contract || !web3) {

      return null;
    }

    try {
      setIsLoading(true);
      
      // Kontrat üzerindeki getCurrentWeeklyDetailedTopBuyers fonksiyonunu çağır
      const result = await contract.methods.getCurrentWeeklyDetailedTopBuyers(maxCount).call();
      
   
      
      return {
        users: result.users,
        totalTickets: result.totalTickets.map((count: any) => Number(count)),
        selfBought: result.selfBought.map((count: any) => Number(count)),
        othersBought: result.othersBought.map((count: any) => Number(count))
      };
    } catch (err) {
 
      
      // Eğer kontrat fonksiyonu henüz yoksa veya hata veriyorsa test verileri oluşturalım
      if (process.env.NODE_ENV === 'development') {
        return createMockDetailedLeaderboardData(maxCount);
      }
      
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [contract, web3, isClient]);

  // Aylık detaylı liderlik tablosu verilerini al
  const getMonthlyDetailedTopBuyers = useCallback(async (maxCount = 50) => {
    if (!isClient || !contract || !web3) {

      return null;
    }

    try {
      setIsLoading(true);
      
      // Kontrat üzerindeki getCurrentMonthlyDetailedTopBuyers fonksiyonunu çağır
      const result = await contract.methods.getCurrentMonthlyDetailedTopBuyers(maxCount).call();
      
      
      return {
        users: result.users,
        totalTickets: result.totalTickets.map((count: any) => Number(count)),
        selfBought: result.selfBought.map((count: any) => Number(count)),
        othersBought: result.othersBought.map((count: any) => Number(count))
      };
    } catch (err) {
   
      
      // Eğer kontrat fonksiyonu henüz yoksa veya hata veriyorsa test verileri oluşturalım
      if (process.env.NODE_ENV === 'development') {
        return createMockDetailedLeaderboardData(maxCount);
      }
      
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [contract, web3, isClient]);

  // Test verileri oluştur (kontrat fonksiyonu henüz yoksa kullanmak için)
  const createMockDetailedLeaderboardData = (maxCount = 50) => {
    // Sahte veri oluşturma fonksiyonu
    function createMockData(count: number) {
      // Örnek adresler (test için)
      const mockAddresses = [
        '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
        '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
        '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65',
        '0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc',
        '0x976EA74026E726554dB657fA54763abd0C3a0aa9',
        '0x14dC79964da2C08b23698B3D3cc7Ca32193d9955',
        '0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f',
        '0xa0Ee7A142d267C1f36714E4a8F75612F20a79720',
        '0xBcd4042DE499D14e55001CcbB24a551F3b954096',
        '0x71bE63f3384f5fb98995898A86B02Fb2426c5788'
      ];

      // Maksimum talep edilen sayı kadar veya mock adresler kadar
      const resultCount = Math.min(count, mockAddresses.length);
      
      // Her kullanıcı için bilet sayıları oluştur
      const users = mockAddresses.slice(0, resultCount);
      const totalTickets = Array(resultCount).fill(0).map(() => Math.floor(Math.random() * 100) + 1);
      
      // Kullanıcıları bilet sayılarına göre sırala
      const sorted = users.map((user, i) => ({
        user,
        totalTicket: totalTickets[i],
        selfBought: Math.floor(totalTickets[i] * (Math.random() * 0.8 + 0.1)), // Toplam biletlerin %10-90'ı
      })).sort((a, b) => b.totalTicket - a.totalTicket);
      
      // Sıralanmış verileri ayrı dizilere böl
      const result = {
        users: sorted.map(item => item.user),
        totalTickets: sorted.map(item => item.totalTicket),
        selfBought: sorted.map(item => item.selfBought),
        othersBought: sorted.map(item => item.totalTicket - item.selfBought)
      };
      
      return result;
    }
    
    return createMockData(maxCount);
  };

  // User winnings for profile panel
  const getUserWinnings = useCallback(async (userAddress: string) => {
    if (!isClient || !contract || !web3) {
      return { draws: [], amounts: [] };
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await contract.methods.getUserWinnings(userAddress).call();
      
      const draws = result.draws.map(Number);
      const amounts = result.amounts.map((amount: string) => 
        web3.utils.fromWei(amount, 'ether')
      );
      
      setIsLoading(false);
      return { draws, amounts };
    } catch (err: any) {
      setError('Could not load winning history');
      setIsLoading(false);
      return { draws: [], amounts: [] };
    }
  }, [contract, web3]);

  // Get list of users who bought tickets for a profile
  const getProfileBuyers = useCallback(async (profileAddress: string, drawNumber?: number) => {
    if (!isClient || !contract || !web3) {
      return { buyers: [], ticketCounts: [] };
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // If drawNumber not provided, use current draw
      const currentDrawInfo = await getCurrentDrawInfo();
      const draw = drawNumber || (currentDrawInfo ? currentDrawInfo.drawNumber : 1);

      // Get list of buyers who bought tickets for this profile
      const buyers = await contract.methods.getProfileBuyersList(draw, profileAddress).call();
      
      // Get ticket counts for each buyer
      const ticketCounts = await Promise.all(
        buyers.map((buyer: string) => 
          contract.methods.getProfileTicketsBoughtBy(draw, profileAddress, buyer).call()
        )
      );
      
      return { 
        buyers, 
        ticketCounts: ticketCounts.map(count => Number(count))
      };
    } catch (err) {

      return { buyers: [], ticketCounts: [] };
    } finally {
      setIsLoading(false);
    }
  }, [contract, web3, isClient, getCurrentDrawInfo]);

  // Get profiles that user bought tickets for
  const getTicketsBoughtForProfiles = useCallback(async (userAddress: string, drawNumber?: number) => {
    if (!isClient || !contract || !web3) {
      return { profiles: [], ticketCounts: [] };
    }

    try {
      setIsLoading(true);
      
      // Mevcut çekiliş bilgisini al
      const currentDrawInfo = await getCurrentDrawInfo();
      const currentDraw = drawNumber || (currentDrawInfo ? currentDrawInfo.drawNumber : 1);
    
      
      // Katılımcıları al
      const participants = await contract.methods.drawParticipants(currentDraw, 0).call();
    
      
      const profiles: string[] = [];
      const ticketCounts: number[] = [];
      
      // Her bir katılımcı profil için kullanıcının bilet alıp almadığını kontrol et
      for (const profile of participants) {
        // Geçersiz profilleri atla
        if (!profile || profile === '0x0000000000000000000000000000000000000000' || !web3.utils.isAddress(profile)) {
          continue;
        }
        
        // Kullanıcının kendi profilini atla (kendi profilin için bilet alamazsın)
        if (profile.toLowerCase() === userAddress.toLowerCase()) {
          continue;
        }
        
        try {
          // Kullanıcının bu profile bilet alıp almadığını kontrol et
          // ÖNEMLİ: Parametre sırası (drawNumber, profile, buyer)
          const ticketCount = await contract.methods.getProfileTicketsBoughtBy(currentDraw, profile, userAddress).call();
         
          
          // Eğer bilet almışsa listeye ekle
          if (Number(ticketCount) > 0) {
            profiles.push(profile);
            ticketCounts.push(Number(ticketCount));
           
          }
        } catch (profileError) {
        
        }
      }
      
   
      return { profiles, ticketCounts };
    } catch (error) {
   
      return { profiles: [], ticketCounts: [] };
    } finally {
      setIsLoading(false);
    }
  }, [contract, web3, isClient, getCurrentDrawInfo]);

  // Get user ticket breakdown (self vs others)
  const getUserTicketsBreakdown = useCallback(async (userAddress: string, drawNumber?: number) => {
    if (!isClient || !contract || !web3) {
      return { self: 0, others: 0 };
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // If drawNumber not provided, use current draw
      const currentDrawInfo = await getCurrentDrawInfo();
      const draw = drawNumber || (currentDrawInfo ? currentDrawInfo.drawNumber : 1);
      
      // Get ticket breakdown
      const result = await contract.methods.getUserTicketsBreakdown(draw, userAddress).call();
      
      return {
        self: Number(result.self),
        others: Number(result.others)
      };
    } catch (err) {
   
      return { self: 0, others: 0 };
    } finally {
      setIsLoading(false);
    }
  }, [contract, web3, isClient, getCurrentDrawInfo]);

  // Get user ticket history
  const getUserTicketHistory = useCallback(async (userAddress: string, maxDraws = 5) => {
    if (!isClient || !contract || !web3) {
      return [];
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Get current draw number
      const currentDrawInfo = await getCurrentDrawInfo();
      if (!currentDrawInfo) {
        return [];
      }
      
      const currentDraw = currentDrawInfo.drawNumber;
      const historyData = [];
      
      // Get data for the last 'maxDraws' draws
      const startDraw = Math.max(1, currentDraw - maxDraws);
      
      for (let draw = currentDraw - 1; draw >= startDraw; draw--) {
        try {
          const breakdown = await contract.methods.getUserTicketsBreakdown(draw, userAddress).call();
          
          historyData.push({
            drawNumber: draw,
            forMe: Number(breakdown.others),
            byMe: Number(breakdown.self),
            total: Number(breakdown.self) + Number(breakdown.others),
            status: 'Completed'
          });
        } catch (error) {
        
          // Just skip this draw if there's no data
        }
      }
      
      return historyData;
    } catch (err) {
  
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [contract, web3, isClient, getCurrentDrawInfo]);

  // Calculate total tickets for a user
  const getUserTotalTickets = useCallback(async (userAddress: string) => {
    if (!isClient || !contract || !web3) {
      return { bought: 0, received: 0 };
    }
    
    try {
      const result = await contract.methods.totalTicketsBought(userAddress).call();
      const currentDrawInfo = await getCurrentDrawInfo();
      
      if (!currentDrawInfo) {
        return { bought: Number(result), received: 0 };
      }
      
      const breakdown = await contract.methods.getUserTicketsBreakdown(
        currentDrawInfo.drawNumber, 
        userAddress
      ).call();
      
      return {
        bought: Number(result),
        received: Number(breakdown.others)
      };
    } catch (err) {
     
      return { bought: 0, received: 0 };
    }
  }, [contract, web3, isClient, getCurrentDrawInfo]);

  // Get user pending prize amount
  const getUserPendingPrize = useCallback(async (userAddress: string) => {
    if (!isClient || !contract || !web3) {
      return '0';
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await contract.methods.getUserPendingPrize(userAddress).call();
      const formattedAmount = web3.utils.fromWei(result, 'ether');
      
      setIsLoading(false);
      return formattedAmount;
    } catch (err: any) {
      setError('Could not load pending prize amount');
      setIsLoading(false);
      return '0';
    }
  }, [contract, web3]);

  // adjustDrawTime
  const adjustDrawTime = useCallback(async (timeAdjustment: number, isMonthly: boolean) => {
    if (!isClient || !contract || !account) {
      return null;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // LUKSO dökümanına uygun şekilde transaction gönder
      const result = await contract.methods.adjustDrawTime(timeAdjustment, isMonthly).send({
        from: account
      });

      setIsLoading(false);
      return { success: true, txHash: result.transactionHash };
    } catch (error: any) {
      setError(error.message || 'Çekiliş zamanı ayarlanırken bir hata oluştu');
      setIsLoading(false);
      return null;
    }
  }, [contract, account]);

  // Bilet fiyatını güncelle
  const setTicketPrice = useCallback(async (newPrice: string) => {
    if (!isClient || !contract || !account || !web3) {
      return false;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Ether'dan Wei'ye dönüştür
      const priceInWei = web3.utils.toWei(newPrice, 'ether');
      
      // LUKSO dökümanına uygun şekilde transaction gönder
      const receipt = await contract.methods.setTicketPrice(priceInWei).send({
        from: account
      });
      
      setIsLoading(false);
      return true;
    } catch (err: any) {
      setError(err.message || 'Could not update ticket price');
      setIsLoading(false);
      return false;
    }
  }, [contract, web3, account]);

  // Ücret yüzdelerini güncelle
  const setFeePercentages = useCallback(async (ownerFee: number, monthlyPoolFee: number) => {
    if (!isClient || !contract || !account || !web3) {
      return false;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // LUKSO dökümanına uygun şekilde transaction gönder
      const receipt = await contract.methods.setFeePercentages(ownerFee, monthlyPoolFee).send({
        from: account
      });
      
      setIsLoading(false);
      return true;
    } catch (err: any) {
      setError(err.message || 'Could not update fee percentages');
      setIsLoading(false);
      return false;
    }
  }, [contract, web3, account]);

  // Çekiliş aralığını güncelle
  const setDrawInterval = useCallback(async (newInterval: string) => {
    if (!isClient || !contract || !account || !web3) {
      return false;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Saniye cinsinden
      const intervalInSeconds = parseInt(newInterval);
      
      // LUKSO dökümanına uygun şekilde transaction gönder
      const receipt = await contract.methods.setDrawInterval(intervalInSeconds).send({
        from: account
      });
      
      setIsLoading(false);
      return true;
    } catch (err: any) {
      setError(err.message || 'Could not update draw interval');
      setIsLoading(false);
      return false;
    }
  }, [contract, web3, account]);

  // Aylık çekiliş aralığını güncelle
  const setMonthlyDrawInterval = useCallback(async (newInterval: string) => {
    if (!isClient || !contract || !account || !web3) {
      return false;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Saniye cinsinden
      const intervalInSeconds = parseInt(newInterval);
      
      // LUKSO dökümanına uygun şekilde transaction gönder
      const receipt = await contract.methods.setMonthlyDrawInterval(intervalInSeconds).send({
        from: account
      });
      
      setIsLoading(false);
      return true;
    } catch (err: any) {
      setError(err.message || 'Could not update monthly draw interval');
      setIsLoading(false);
      return false;
    }
  }, [contract, web3, account]);

  // Manuel çekiliş yap
  const manualDraw = useCallback(async () => {
    if (!isClient || !contract || !account || !web3) {
      return null;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // LUKSO dökümanına uygun şekilde transaction gönder - Eskiye dönüş
      const result = await contract.methods.manualDraw().send({
        from: account
      });

      setIsLoading(false);
      return { success: true, txHash: result.transactionHash };
    } catch (error: any) {
      setError(error.message || 'Çekiliş yapılırken bir hata oluştu');
      setIsLoading(false);
      return null;
    }
  }, [contract, web3, account]);

  // Manuel aylık çekiliş yap
  const manualMonthlyDraw = useCallback(async () => {
    if (!isClient || !contract || !account || !web3) {
      return null;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // LUKSO dökümanına uygun şekilde transaction gönder - Eskiye dönüş
      const result = await contract.methods.manualMonthlyDraw().send({
        from: account
      });

      setIsLoading(false);
      return { success: true, txHash: result.transactionHash };
    } catch (error: any) {
      setError(error.message || 'Aylık çekiliş yapılırken bir hata oluştu');
      setIsLoading(false);
      return null;
    }
  }, [contract, web3, account]);

  // withdrawProfit
  const withdrawProfit = useCallback(async () => {
    if (!isClient || !contract || !account) {
      return null;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // LUKSO dökümanına uygun şekilde transaction gönder
      const result = await contract.methods.withdrawProfit().send({
        from: account
      });

      setIsLoading(false);
      return { success: true, txHash: result.transactionHash };
    } catch (error: any) {
      setError(error.message || 'Kâr çekilirken bir hata oluştu');
      setIsLoading(false);
      return null;
    }
  }, [contract, account]);

  // withdrawAll
  const withdrawAll = useCallback(async () => {
    if (!isClient || !contract || !account) {
      return null;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // LUKSO dökümanına uygun şekilde transaction gönder
      const result = await contract.methods.withdrawAll().send({
        from: account
      });

      setIsLoading(false);
      return { success: true, txHash: result.transactionHash };
    } catch (error: any) {
      setError(error.message || 'Tüm fonlar çekilirken bir hata oluştu');
      setIsLoading(false);
      return null;
    }
  }, [contract, account]);

  // Add Operator
  const addOperator = useCallback(async (operatorAddress: string) => {
    if (!isClient || !contract || !account || !web3) {
      return null;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Adres kontrolü
      if (!web3.utils.isAddress(operatorAddress)) {
        throw new Error('Geçersiz operatör adresi');
      }
      
      // LUKSO dökümanına uygun şekilde transaction gönder
      const result = await contract.methods.addOperator(operatorAddress).send({
        from: account
      });

      setIsLoading(false);
      return { success: true, txHash: result.transactionHash };
    } catch (error: any) {
      setError(error.message || 'Operatör eklenirken bir hata oluştu');
      setIsLoading(false);
      return null;
    }
  }, [contract, account, web3]);

  // Remove Operator
  const removeOperator = useCallback(async (operatorAddress: string) => {
    if (!isClient || !contract || !account || !web3) {
      return null;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Adres kontrolü
      if (!web3.utils.isAddress(operatorAddress)) {
        throw new Error('Geçersiz operatör adresi');
      }
      
      // LUKSO dökümanına uygun şekilde transaction gönder
      const result = await contract.methods.removeOperator(operatorAddress).send({
        from: account
      });

      setIsLoading(false);
      return { success: true, txHash: result.transactionHash };
    } catch (error: any) {
      setError(error.message || 'Operatör çıkarılırken bir hata oluştu');
      setIsLoading(false);
      return null;
    }
  }, [contract, account, web3]);

  // Fund Weekly Pool
  const fundWeeklyPool = useCallback(async (amount: string) => {
    if (!isClient || !contract || !account || !web3) {
      return null;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Ether'dan Wei'ye dönüştür
      const amountInWei = web3.utils.toWei(amount, 'ether');
      
      // LUKSO dökümanına uygun şekilde transaction gönder
      const result = await contract.methods.fundWeeklyPool().send({
        from: account,
        value: amountInWei
      });

      setIsLoading(false);
      return { success: true, txHash: result.transactionHash };
    } catch (error: any) {
      setError(error.message || 'Haftalık havuz fonlanırken bir hata oluştu');
      setIsLoading(false);
      return null;
    }
  }, [contract, account, web3]);

  // Fund Monthly Pool
  const fundMonthlyPool = useCallback(async (amount: string) => {
    if (!isClient || !contract || !account || !web3) {
      return null;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Ether'dan Wei'ye dönüştür
      const amountInWei = web3.utils.toWei(amount, 'ether');
      
      // LUKSO dökümanına uygun şekilde transaction gönder
      const result = await contract.methods.fundMonthlyPool().send({
        from: account,
        value: amountInWei
      });

      setIsLoading(false);
      return { success: true, txHash: result.transactionHash };
    } catch (error: any) {
      setError(error.message || 'Aylık havuz fonlanırken bir hata oluştu');
      setIsLoading(false);
      return null;
    }
  }, [contract, account, web3]);

  // adminCleanupDrawBatch - temizleme işlemi için
  const adminCleanupDrawBatch = useCallback(async (drawNumber: number, batchSize: number) => {
    if (!isClient || !contract || !account) {
      return null;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await contract.methods.adminCleanupDrawBatch(drawNumber, batchSize).send({
        from: account
      });

      setIsLoading(false);
      return { success: true, txHash: result.transactionHash };
    } catch (error: any) {
      setError(error.message || 'Çekiliş verisi temizlenirken bir hata oluştu');
      setIsLoading(false);
      return null;
    }
  }, [contract, account]);

  // testOracle - oracle test fonksiyonu
  const testOracle = useCallback(async () => {
    if (!isClient || !contract || !account) {
      return null;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await contract.methods.testOracle().send({
        from: account
      });

      setIsLoading(false);
      return {
        success: result.events?.success || true,
        value: result.events?.value || 0,
        timestamp: result.events?.timestamp || 0,
        errorMsg: result.events?.errorMsg || ''
      };
    } catch (error: any) {
      setError(error.message || 'Oracle test edilirken bir hata oluştu');
      setIsLoading(false);
      return null;
    }
  }, [contract, account]);

  // getOracleStatus - oracle durumunu getir
  const getOracleStatus = useCallback(async () => {
    if (!isClient || !contract) {
      return null;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await contract.methods.getOracleStatus().call();

      setIsLoading(false);
      return {
        success: result[0] || false,
        value: result[1] || 0,
        timestamp: result[2] || 0,
        errorMsg: result[3] || ''
      };
    } catch (error: any) {
      setError(error.message || 'Oracle durumu alınırken bir hata oluştu');
      setIsLoading(false);
      return null;
    }
  }, [contract]);

  // simpleTestOracle - basit oracle testi
  const simpleTestOracle = useCallback(async () => {
    if (!isClient || !contract || !account) {
      return null;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await contract.methods.simpleTestOracle().send({
        from: account
      });

      setIsLoading(false);
      return result;
    } catch (error: any) {
      setError(error.message || 'Basit oracle testi yapılırken bir hata oluştu');
      setIsLoading(false);
      return null;
    }
  }, [contract, account]);

  // Emergency Toggle
  const emergencyToggle = useCallback(async (isPaused: boolean) => {
    if (!isClient || !contract || !account) {
      return null;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // LUKSO dökümanına uygun şekilde transaction gönder
      const result = await contract.methods.emergencyToggle(isPaused).send({
        from: account
      });

      setIsLoading(false);
      return { success: true, txHash: result.transactionHash };
    } catch (error: any) {
      setError(error.message || 'Acil durum modu değiştirilirken bir hata oluştu');
      setIsLoading(false);
      return null;
    }
  }, [contract, account]);

  // Check if address is operator
  const isOperator = useCallback(async (address: string) => {
    if (!isClient || !contract || !web3) {
      return false;
    }
    
    try {
      const result = await contract.methods.operators(address).call();
      return result;
    } catch (err) {
    
      return false;
    }
  }, [contract, web3]);

  // Get contract paused status
  const getContractPausedStatus = useCallback(async () => {
    if (!isClient || !contract) {
      return false;
    }
    
    try {
      const result = await contract.methods.paused().call();
      return result;
    } catch (err) {
    
      return false;
    }
  }, [contract]);

  // Kontrat sahibini getir
  const getOwner = useCallback(async () => {
    if (!isClient || !contract || !web3) {
      return null;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await contract.methods.owner().call();
      
      setIsLoading(false);
      return result;
    } catch (err: any) {
      setError('Could not get contract owner');
      setIsLoading(false);
      return null;
    }
  }, [contract, web3]);

  // Claim prize
  const claimPrize = useCallback(async () => {
    if (!isClient || !contract || !account || !web3) {
      return false;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // LUKSO dökümanına uygun şekilde transaction gönder
      const receipt = await contract.methods.claimPrize().send({
        from: account
      });
      
      setIsLoading(false);
      return true;
    } catch (err: any) {
      setError(err.message || 'Could not claim prize');
      setIsLoading(false);
      return false;
    }
  }, [contract, web3, account]);

  // Get past draw results
  const getDrawResults = useCallback(async (drawNumber: number) => {
    if (!isClient || !contract || !web3) {
      return { winner: '', prizeAmount: '0' };
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await contract.methods.getDrawResults(drawNumber).call();
      const formattedAmount = web3.utils.fromWei(result.prizeAmount, 'ether');
      
      setIsLoading(false);
      return {
        winner: result.winnerAddress,
        prizeAmount: formattedAmount
      };
    } catch (err: any) {
      setError('Could not load draw results');
      setIsLoading(false);
      return { winner: '', prizeAmount: '0' };
    }
  }, [contract, web3]);

  // Get monthly draw results
  const getMonthlyDrawResults = useCallback(async (drawNumber: number) => {
    if (!isClient || !contract || !web3) {
      return { winner: '', prizeAmount: '0' };
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await contract.methods.getMonthlyDrawResults(drawNumber).call();
      const formattedAmount = web3.utils.fromWei(result.prizeAmount, 'ether');
      
      setIsLoading(false);
      return {
        winner: result.winnerAddress,
        prizeAmount: formattedAmount
      };
    } catch (err: any) {
      setError('Could not load monthly draw results');
      setIsLoading(false);
      return { winner: '', prizeAmount: '0' };
    }
  }, [contract, web3]);

  // Format time in a readable format
  const formatTime = (seconds: number) => {
    const days = Math.floor(seconds / (3600 * 24));
    const hours = Math.floor((seconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    return {
      days,
      hours,
      minutes,
      seconds: secs,
      text: `${days > 0 ? `${days}d ` : ''}${hours}h ${minutes}m ${secs}s`
    };
  };

  // Add getCurrentWeeklyParticipants function
  const getCurrentWeeklyParticipants = useCallback(async () => {
    if (!isClient || !contract || !web3) {
      return null;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await contract.methods.getCurrentWeeklyParticipants().call();
      
      return {
        participants: result.participants || [],
        totalTickets: result.totalTickets || [],
        selfBought: result.selfBought || [],
        othersBought: result.othersBought || []
      };
    } catch (err) {
      console.error('Error fetching weekly participants:', err);
      
      // Create mock data for development
      if (process.env.NODE_ENV === 'development') {
        return {
          participants: createMockDetailedLeaderboardData(50).users,
          totalTickets: createMockDetailedLeaderboardData(50).totalTickets,
          selfBought: createMockDetailedLeaderboardData(50).selfBought,
          othersBought: createMockDetailedLeaderboardData(50).othersBought
        };
      }
      
      setError('Could not load weekly participants');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [contract, web3, isClient]);

  // Add getCurrentMonthlyParticipants function
  const getCurrentMonthlyParticipants = useCallback(async () => {
    if (!isClient || !contract || !web3) {
      return null;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await contract.methods.getCurrentMonthlyParticipants().call();
      
      return {
        participants: result.participants || [],
        totalTickets: result.totalTickets || [],
        selfBought: result.selfBought || [],
        othersBought: result.othersBought || []
      };
    } catch (err) {
      console.error('Error fetching monthly participants:', err);
      
      // Create mock data for development
      if (process.env.NODE_ENV === 'development') {
        return {
          participants: createMockDetailedLeaderboardData(50).users,
          totalTickets: createMockDetailedLeaderboardData(50).totalTickets,
          selfBought: createMockDetailedLeaderboardData(50).selfBought,
          othersBought: createMockDetailedLeaderboardData(50).othersBought
        };
      }
      
      setError('Could not load monthly participants');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [contract, web3, isClient]);

  // Return a set of functions for the contract
  return {
    contract,
    web3,
    isLoading,
    error,
    getContractInfo,
    getTopBuyers,
    getCurrentDrawInfo,
    getMonthlyDrawInfo,
    getUserWinnings,
    buyTicket,
    bulkBuyForSelectedFollowers,
    claimPrize,
    getWeeklyDetailedTopBuyers,
    getMonthlyDetailedTopBuyers,
    getProfileBuyers,
    getTicketsBoughtForProfiles,
    getUserTicketsBreakdown,
    setTicketPrice,
    setFeePercentages,
    setDrawInterval,
    setMonthlyDrawInterval,
    adjustDrawTime,
    manualDraw,
    manualMonthlyDraw,
    withdrawProfit,
    withdrawAll,
    getOwner,
    getUserPendingPrize,
    getUserTicketHistory,
    getUserTotalTickets,
    addOperator,
    removeOperator,
    fundWeeklyPool,
    fundMonthlyPool,
    emergencyToggle,
    isOperator,
    getContractPausedStatus,
    getDrawResults,
    getMonthlyDrawResults,
    getCurrentWeeklyParticipants,
    getCurrentMonthlyParticipants,
    adminCleanupDrawBatch,
    testOracle,
    getOracleStatus,
    simpleTestOracle,
  };
}; 