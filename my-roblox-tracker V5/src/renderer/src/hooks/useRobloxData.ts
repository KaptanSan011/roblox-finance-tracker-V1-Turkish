import { useState, useEffect, useRef, useCallback } from 'react'
import { Transaction, Stats, IElectronAPI } from '../types'

// Global Window Interface'ini genişletiyoruz
// Bu sayede window.robloxAPI kullandığımızda TypeScript hata vermez.
declare global {
  interface Window {
    robloxAPI: IElectronAPI
  }
}

const CASH_SOUND_URL = "https://cdn.pixabay.com/audio/2021/08/09/audio_88447e769f.mp3";

export const useRobloxData = () => {
  // --- STATE (Artık 'any' yok, gerçek tipler var) ---
  const [groupId, setGroupId] = useState<string>('')
  const [cookie, setCookie] = useState<string>('')
  
  const [transactions, setTransactions] = useState<Transaction[] | null>(null)
  const [stats, setStats] = useState<Stats | null>(null)
  
  const [loading, setLoading] = useState<boolean>(false)
  const [statusText, setStatusText] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [timer, setTimer] = useState<number>(60)

  // --- REFERANSLAR ---
  const transactionsRef = useRef<Transaction[] | null>(transactions)
  const loadingRef = useRef<boolean>(loading)
  // Component'in ekranda olup olmadığını takip eder (Memory Leak önleyici)
  const isMounted = useRef<boolean>(true) 

  // State güncellemelerini ref'e aktar
  useEffect(() => { transactionsRef.current = transactions }, [transactions])
  useEffect(() => { loadingRef.current = loading }, [loading])

  // Mount/Unmount takibi
  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; }
  }, [])

  // --- SES MOTORU ---
  const playSound = useCallback(() => {
    try {
        const audio = new Audio(CASH_SOUND_URL);
        audio.volume = 0.5; 
        audio.play().catch(() => {});
    } catch(e) {}
  }, []);

  // --- ANA VERİ ÇEKME DÖNGÜSÜ ---
  const fetchDataLoop = useCallback(async (activeGroupId: string, activeCookie: string, existingData: Transaction[] | null, isBackground = false) => {
    // API Güvenlik Kontrolü
    if (!window.robloxAPI) {
        console.warn("Roblox API bulunamadı.");
        return;
    }

    if (!activeGroupId || !activeCookie) {
        if (!isBackground && isMounted.current) setError("Lütfen bilgileri girin.");
        return;
    }

    if (!isBackground && isMounted.current) setLoading(true);
    if (!isBackground && isMounted.current) setError('');

    // A) İstatistikleri Çek
    try {
        const statsResult = await window.robloxAPI.getStats(activeGroupId, activeCookie);
        if (statsResult.success && statsResult.data && isMounted.current) {
            setStats(statsResult.data);
        }
    } catch (e) { console.error("Stats Error:", e); }

    // B) Geçmiş İşlemleri Çek
    const lastSavedId = existingData && existingData.length > 0 ? existingData[0].id : null;
    let newFoundData: Transaction[] = [];
    let nextCursor: string | null = null; // API null dönebilir
    let isFinished = false;
    let consecutiveErrors = 0;
    
    try {
      if (!isBackground && isMounted.current) setStatusText(lastSavedId ? "Yeni satışlar taranıyor..." : "Veriler indiriliyor...");

      while (!isFinished && isMounted.current) {
        // Güvenlik Kesicisi
        if (consecutiveErrors > 10) {
            if (!isBackground && isMounted.current) setError("Bağlantı kesildi: Roblox yanıt vermiyor.");
            break; 
        }

        const result = await window.robloxAPI.getTransactions(activeGroupId, activeCookie, nextCursor || undefined);

        if (!result.success) {
            const status = result.status || 0;
            // Hız Sınırı (429)
            if (status === 429 || status >= 500) {
                let cooldown = Math.min(5 + (consecutiveErrors * 5), 30);
                if (!isBackground && isMounted.current) {
                    for(let i=cooldown; i>0; i--) {
                        if(!isMounted.current) break;
                        setStatusText(`⚠️ Hız Sınırı! ${i}sn bekleniyor...`);
                        await new Promise(r => setTimeout(r, 1000));
                    }
                } else {
                    await new Promise(r => setTimeout(r, cooldown * 1000));
                }
                consecutiveErrors++;
                continue; 
            } else {
                // Kritik Hata
                if (!isBackground && isMounted.current) setError(`Hata: ${result.error}`);
                isFinished = true; 
                break;
            }
        }

        consecutiveErrors = 0;
        // Typescript artık result.data'nın yapısını biliyor
        const pageData = result.data?.data || [];
        let caughtUp = false;

        // ID Kontrolü
        for (const item of pageData) {
            if (item.id === lastSavedId) { caughtUp = true; break; }
            newFoundData.push(item);
        }

        // Sayfalama Kontrolü
        if (caughtUp || !result.data?.nextPageCursor) {
            isFinished = true;
        } else {
            nextCursor = result.data.nextPageCursor;
            await new Promise(r => setTimeout(r, 4000));
        }
      }

      // C) Kaydet ve Birleştir
      if (newFoundData.length > 0 && isMounted.current) {
        if (isBackground) playSound();

        const finalData = [...newFoundData, ...(existingData || [])];
        setTransactions(finalData);
        
        await window.robloxAPI.setStore('transactions', finalData);
        if (!isBackground) {
             await window.robloxAPI.setStore('groupId', activeGroupId);
             await window.robloxAPI.setStore('cookie', activeCookie);
        }
      }

    } catch (e: any) { 
        if(!isBackground && isMounted.current) setError('Hata: ' + e.message); 
    } finally { 
        if (isMounted.current) {
            setLoading(false); 
            setStatusText(''); 
        }
    }
  }, [playSound]);

  // --- TIMER MOTORU ---
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (transactions && groupId && cookie) {
        interval = setInterval(() => {
            if (!isMounted.current) return;
            setTimer((prev) => {
                if (prev <= 1) {
                    if (!loadingRef.current) {
                        fetchDataLoop(groupId, cookie, transactionsRef.current, true); 
                    }
                    return 60; 
                }
                return prev - 1;
            });
        }, 1000);
    }
    return () => clearInterval(interval);
  }, [transactions, groupId, cookie, fetchDataLoop]);

  // --- BAŞLANGIÇ YÜKLEMESİ ---
  useEffect(() => {
    const init = async () => {
      // API yoksa dur
      if (!window.robloxAPI) return;

      try {
        const [g, c, t] = await Promise.all([
             window.robloxAPI.getStore('groupId'),
             window.robloxAPI.getStore('cookie'),
             window.robloxAPI.getStore('transactions')
        ]);

        if (g && c && isMounted.current) {
          setGroupId(g); setCookie(c);
          if (t && t.length > 0) {
            setTransactions(t);
            fetchDataLoop(g, c, t, true);
          } else {
            fetchDataLoop(g, c, null, false);
          }
        }
      } catch (err) { console.error(err) }
    }
    init()
  }, [fetchDataLoop])

  // --- PUBLIC ACTIONS ---
  
  const login = (gId: string, ck: string) => {
      setGroupId(gId);
      setCookie(ck);
      fetchDataLoop(gId, ck, transactions, false);
  }

  const resetData = async () => {
    if (confirm("Tüm geçmiş silinecek ve baştan indirilecek. Devam edilsin mi?")) {
        setLoading(true);
        if (window.robloxAPI) await window.robloxAPI.deleteStore('transactions'); 
        setTransactions(null);
        fetchDataLoop(groupId, cookie, null, false);
    }
  }

  const logout = async () => {
    if (window.robloxAPI) {
        await window.robloxAPI.deleteStore('groupId');
        await window.robloxAPI.deleteStore('cookie');
        await window.robloxAPI.deleteStore('transactions');
    }
    setTransactions(null); setGroupId(''); setCookie('');
  }

  const refresh = () => {
      fetchDataLoop(groupId, cookie, transactions, false);
  }

  return {
    transactions,
    stats,
    groupId,
    cookie,
    loading,
    error,
    statusText,
    timer,
    login,
    logout,
    resetData,
    refresh,
    setGroupId,
    setCookie
  };
}