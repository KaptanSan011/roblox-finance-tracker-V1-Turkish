// src/renderer/src/utils.ts

// Tarih Formatlayıcı (TR)
export const formatDate = (dateInput: string | number | Date): string => {
  const date = new Date(dateInput);
  return new Intl.DateTimeFormat('tr-TR', { 
    timeZone: 'Europe/Istanbul', 
    month: 'short', 
    day: 'numeric' 
  }).format(date);
};

// Saat Formatlayıcı (TR)
export const formatTime = (dateInput: string | number | Date): string => {
  const date = new Date(dateInput);
  return new Intl.DateTimeFormat('tr-TR', { 
    timeZone: 'Europe/Istanbul', 
    hour: '2-digit', 
    minute: '2-digit', 
    hour12: false 
  }).format(date);
};

// Para Formatlayıcı (Binlik ayraçlı)
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(amount);
};

// TL Dönüştürücü ve Formatlayıcı
export const formatTRY = (robux: number, rate: number): string => {
  const value = robux * rate;
  return new Intl.NumberFormat('tr-TR', { 
    style: 'currency', 
    currency: 'TRY',
    minimumFractionDigits: 2
  }).format(value);
};