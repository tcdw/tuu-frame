/// <reference types="vite/client" />

interface ElectronAPI {
  openFile: () => Promise<string | undefined>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
