"use strict";
const electron = require("electron");
const preload = require("@electron-toolkit/preload");
const api = {};
const robloxAPI = {
  // --- Satış Özeti ---
  getSales: (groupId, cookie) => electron.ipcRenderer.invoke("get-roblox-sales", { groupId, cookie }),
  // --- İşlem Geçmişi (cursor destekli) ---
  getTransactions: (groupId, cookie, cursor) => electron.ipcRenderer.invoke("get-roblox-transactions", {
    groupId,
    cookie,
    cursor
  }),
  // --- GRUP BAKİYESİ VE BEKLEYEN PARA ---
  getStats: (groupId, cookie) => electron.ipcRenderer.invoke("get-roblox-stats", { groupId, cookie }),
  // --- STORE İŞLEMLERİ ---
  setStore: (key, value) => electron.ipcRenderer.invoke("set-store", { key, value }),
  getStore: (key) => electron.ipcRenderer.invoke("get-store", key),
  deleteStore: (key) => electron.ipcRenderer.invoke("delete-store", key)
};
if (process.contextIsolated) {
  try {
    electron.contextBridge.exposeInMainWorld("electron", preload.electronAPI);
    electron.contextBridge.exposeInMainWorld("api", api);
    electron.contextBridge.exposeInMainWorld("robloxAPI", robloxAPI);
  } catch (error) {
    console.error(error);
  }
} else {
  window.electron = preload.electronAPI;
  window.api = api;
  window.robloxAPI = robloxAPI;
}
