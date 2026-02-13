import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import axios from 'axios'

// ===============================
// WINDOW OLUŞTURMA
// ===============================

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    minWidth: 900,
    minHeight: 600,
    show: false,
    autoHideMenuBar: true,

    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#1e1e2e',
      symbolColor: '#ffffff',
      height: 30
    },

    ...(process.platform === 'linux' ? { icon } : {}),

    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// ===============================
// APP LIFECYCLE
// ===============================

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.roblox.dashboard')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// ===============================
// ROBLOX API
// ===============================

// --- Satış Özeti ---
ipcMain.handle('get-roblox-sales', async (_, { groupId, cookie }) => {
  try {
    console.log('Satış özeti isteniyor...')

    const url = `https://economy.roblox.com/v1/groups/${groupId}/revenue/summary/day`

    const response = await axios.get(url, {
      headers: {
        Cookie: `.ROBLOSECURITY=${cookie}`,
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    })

    console.log('Satış özeti başarıyla alındı.')

    return { success: true, data: response.data }
  } catch (error: any) {
    const status = error.response ? error.response.status : 0

    console.error('SATIŞ API HATASI:', error.message, 'Kod:', status)

    return {
      success: false,
      error: error.message,
      status
    }
  }
})

// --- İşlem Geçmişi ---
ipcMain.handle(
  'get-roblox-transactions',
  async (_, { groupId, cookie, cursor }) => {
    try {
      console.log(`Veri isteniyor... Cursor: ${cursor ? 'VAR' : 'İLK SAYFA'}`)

      const url = `https://economy.roblox.com/v2/groups/${groupId}/transactions`

      const response = await axios.get(url, {
        params: {
          transactionType: 'Sale',
          limit: 100,
          cursor: cursor || undefined
        },
        headers: {
          Cookie: `.ROBLOSECURITY=${cookie}`,
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      })

      console.log(
        `Başarılı! Gelen kayıt: ${response.data.data.length}, ` +
          `Sonraki Sayfa: ${response.data.nextPageCursor ? 'VAR' : 'YOK'}`
      )

      return { success: true, data: response.data }
    } catch (error: any) {
      const status = error.response ? error.response.status : 0

      console.error('TRANSACTIONS API HATASI:', error.message, 'Kod:', status)

      return {
        success: false,
        error: error.message,
        status
      }
    }
  }
)

// --- YENİ: GRUP BAKİYESİ VE BEKLEYEN PARA ---
ipcMain.handle('get-roblox-stats', async (_, { groupId, cookie }) => {
  try {
    // 1. Grup Kasasındaki Para (Funds)
    const currencyUrl = `https://economy.roblox.com/v1/groups/${groupId}/currency`;
    
    // 2. Bekleyen Para (Pending)
    const revenueUrl = `https://economy.roblox.com/v1/groups/${groupId}/revenue/summary/day`;

    // İkisini aynı anda çekiyoruz
    const [currencyRes, revenueRes] = await Promise.all([
      axios.get(currencyUrl, { headers: { 'Cookie': `.ROBLOSECURITY=${cookie}` } }),
      axios.get(revenueUrl, { headers: { 'Cookie': `.ROBLOSECURITY=${cookie}` } })
    ]);

    return { 
      success: true, 
      data: {
        robux: currencyRes.data.robux, 
        pendingRobux: revenueRes.data.pendingRobux 
      }
    };
  } catch (error: any) {
    console.error("STATS API HATASI:", error.message);
    // Hata olsa bile success: false dönelim ki uygulama çökmesin
    return { success: false, error: error.message };
  }
})

// ===============================
// STORE (electron-store - ESM)
// ===============================

ipcMain.handle('set-store', async (_, { key, value }) => {
  const { default: Store } = await import('electron-store')
  const store = new Store()
  store.set(key, value)
  return true
})

ipcMain.handle('get-store', async (_, key) => {
  const { default: Store } = await import('electron-store')
  const store = new Store()
  return store.get(key)
})

ipcMain.handle('delete-store', async (_, key) => {
  const { default: Store } = await import('electron-store')
  const store = new Store()
  store.delete(key)
  return true
})
