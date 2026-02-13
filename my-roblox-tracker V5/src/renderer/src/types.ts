// src/renderer/src/types.ts

// ==========================================
// 1. ROBLOX API VERİ MODELLERİ
// ==========================================

// API'den gelen tekil işlem (Satış) verisi
export interface Transaction {
  id: number;
  created: string; // ISO Tarih Formatı (Örn: 2024-02-14T15:30:00Z)
  isPending: boolean;
  agent: {
    id: number;
    type: 'User' | 'Group' | string; // Satın alan kişi tipi
    name: string; // Satın alanın adı
  };
  details: {
    id: number;
    name: string; // Ürün adı
    type: 'Asset' | 'GamePass' | 'DeveloperProduct' | string; // Ürün tipi
  };
  currency: {
    amount: number; // Satış tutarı
    type: 'Robux' | string;
  };
}

// API'den gelen Grup İstatistikleri (Kasa ve Bekleyen)
export interface Stats {
  robux: number;       // Mevcut bakiye
  pendingRobux: number; // Bekleyen (Pending) bakiye
}

// ==========================================
// 2. FRONTEND (UYGULAMA İÇİ) MODELLERİ
// ==========================================

// Ham verinin işlenmiş hali (Dashboard'da gösterim için)
export interface ProcessedTransaction extends Transaction {
  timestamp: number; // Sıralama yapmak için milisaniye cinsinden tarih
  dateStr: string;   // Ekrana basılacak tarih (Örn: "14 Şub")
  timeStr: string;   // Ekrana basılacak saat (Örn: "15:30")
}

// Grafik (Chart) için veri noktası yapısı
export interface ChartDataPoint {
  name: string;     // X Ekseni etiketi (Saat veya Gün)
  robux: number;    // Y Ekseni değeri (Toplam Satış)
  sortTime: number; // Grafiğin doğru sıralanması için zaman damgası
}

// Filtreleme Seçenekleri (String Literal Type)
export type FilterType = 'today' | 'yesterday' | 'this_month' | '7' | '30' | 'all';

// ==========================================
// 3. ELECTRON BRIDGE (KÖPRÜ) TANIMLARI
// ==========================================

// Preload.js üzerinden gelen window.robloxAPI yapısı
export interface IElectronAPI {
  // Geçmiş işlemleri çeker
  getTransactions: (
    groupId: string, 
    cookie: string, 
    cursor?: string
  ) => Promise<{ 
    success: boolean; 
    data?: {
      data: Transaction[];      // İşlem listesi
      nextPageCursor: string | null; // Sonraki sayfa kodu
    }; 
    error?: string; 
    status?: number; 
  }>;

  // Grup istatistiklerini (Bakiye) çeker
  getStats: (
    groupId: string, 
    cookie: string
  ) => Promise<{ 
    success: boolean; 
    data?: Stats; 
    error?: string 
  }>;

  // Veri Kaydetme (Electron Store)
  setStore: (key: string, value: any) => Promise<boolean>;
  
  // Veri Okuma
  getStore: (key: string) => Promise<any>;
  
  // Veri Silme
  deleteStore: (key: string) => Promise<boolean>;
}