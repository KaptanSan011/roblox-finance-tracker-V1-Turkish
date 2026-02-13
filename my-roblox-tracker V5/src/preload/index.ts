import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Boş api objesi (ileride ekleme yapabilirsin)
const api = {}

// ===============================
// ROBLOX API KÖPRÜSÜ
// ===============================

const robloxAPI = {
  // --- Satış Özeti ---
  getSales: (groupId: string, cookie: string) =>
    ipcRenderer.invoke('get-roblox-sales', { groupId, cookie }),

  // --- İşlem Geçmişi (cursor destekli) ---
  getTransactions: (
    groupId: string,
    cookie: string,
    cursor?: string
  ) =>
    ipcRenderer.invoke('get-roblox-transactions', {
      groupId,
      cookie,
      cursor
    }),

  // --- GRUP BAKİYESİ VE BEKLEYEN PARA ---
  getStats: (groupId: string, cookie: string) =>
    ipcRenderer.invoke('get-roblox-stats', { groupId, cookie }),

  // --- STORE İŞLEMLERİ ---
  setStore: (key: string, value: any) =>
    ipcRenderer.invoke('set-store', { key, value }),

  getStore: (key: string) =>
    ipcRenderer.invoke('get-store', key),

  deleteStore: (key: string) =>
    ipcRenderer.invoke('delete-store', key)
}

// ===============================
// CONTEXT ISOLATION
// ===============================

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
    contextBridge.exposeInMainWorld('robloxAPI', robloxAPI)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore
  window.electron = electronAPI
  // @ts-ignore
  window.api = api
  // @ts-ignore
  window.robloxAPI = robloxAPI
}
