"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
const electron = require("electron");
const path = require("path");
const utils = require("@electron-toolkit/utils");
const axios = require("axios");
const icon = path.join(__dirname, "../../resources/icon.png");
function createWindow() {
  const mainWindow = new electron.BrowserWindow({
    width: 1e3,
    height: 700,
    minWidth: 900,
    minHeight: 600,
    show: false,
    autoHideMenuBar: true,
    titleBarStyle: "hidden",
    titleBarOverlay: {
      color: "#1e1e2e",
      symbolColor: "#ffffff",
      height: 30
    },
    ...process.platform === "linux" ? { icon } : {},
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      sandbox: false
    }
  });
  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
  });
  mainWindow.webContents.setWindowOpenHandler((details) => {
    electron.shell.openExternal(details.url);
    return { action: "deny" };
  });
  if (utils.is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
  }
}
electron.app.whenReady().then(() => {
  utils.electronApp.setAppUserModelId("com.roblox.dashboard");
  electron.app.on("browser-window-created", (_, window) => {
    utils.optimizer.watchWindowShortcuts(window);
  });
  createWindow();
  electron.app.on("activate", () => {
    if (electron.BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    electron.app.quit();
  }
});
electron.ipcMain.handle("get-roblox-sales", async (_, { groupId, cookie }) => {
  try {
    console.log("Satış özeti isteniyor...");
    const url = `https://economy.roblox.com/v1/groups/${groupId}/revenue/summary/day`;
    const response = await axios.get(url, {
      headers: {
        Cookie: `.ROBLOSECURITY=${cookie}`,
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
      }
    });
    console.log("Satış özeti başarıyla alındı.");
    return { success: true, data: response.data };
  } catch (error) {
    const status = error.response ? error.response.status : 0;
    console.error("SATIŞ API HATASI:", error.message, "Kod:", status);
    return {
      success: false,
      error: error.message,
      status
    };
  }
});
electron.ipcMain.handle(
  "get-roblox-transactions",
  async (_, { groupId, cookie, cursor }) => {
    try {
      console.log(`Veri isteniyor... Cursor: ${cursor ? "VAR" : "İLK SAYFA"}`);
      const url = `https://economy.roblox.com/v2/groups/${groupId}/transactions`;
      const response = await axios.get(url, {
        params: {
          transactionType: "Sale",
          limit: 100,
          cursor: cursor || void 0
        },
        headers: {
          Cookie: `.ROBLOSECURITY=${cookie}`,
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }
      });
      console.log(
        `Başarılı! Gelen kayıt: ${response.data.data.length}, Sonraki Sayfa: ${response.data.nextPageCursor ? "VAR" : "YOK"}`
      );
      return { success: true, data: response.data };
    } catch (error) {
      const status = error.response ? error.response.status : 0;
      console.error("TRANSACTIONS API HATASI:", error.message, "Kod:", status);
      return {
        success: false,
        error: error.message,
        status
      };
    }
  }
);
electron.ipcMain.handle("get-roblox-stats", async (_, { groupId, cookie }) => {
  try {
    const currencyUrl = `https://economy.roblox.com/v1/groups/${groupId}/currency`;
    const revenueUrl = `https://economy.roblox.com/v1/groups/${groupId}/revenue/summary/day`;
    const [currencyRes, revenueRes] = await Promise.all([
      axios.get(currencyUrl, { headers: { "Cookie": `.ROBLOSECURITY=${cookie}` } }),
      axios.get(revenueUrl, { headers: { "Cookie": `.ROBLOSECURITY=${cookie}` } })
    ]);
    return {
      success: true,
      data: {
        robux: currencyRes.data.robux,
        pendingRobux: revenueRes.data.pendingRobux
      }
    };
  } catch (error) {
    console.error("STATS API HATASI:", error.message);
    return { success: false, error: error.message };
  }
});
electron.ipcMain.handle("set-store", async (_, { key, value }) => {
  const { default: Store } = await import("electron-store");
  const store = new Store();
  store.set(key, value);
  return true;
});
electron.ipcMain.handle("get-store", async (_, key) => {
  const { default: Store } = await import("electron-store");
  const store = new Store();
  return store.get(key);
});
electron.ipcMain.handle("delete-store", async (_, key) => {
  const { default: Store } = await import("electron-store");
  const store = new Store();
  store.delete(key);
  return true;
});
