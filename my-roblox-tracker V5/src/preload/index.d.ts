import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: unknown
    robloxAPI: {
      getSales: (groupId: string, cookie: string) => Promise<any>
    }
  }
}
