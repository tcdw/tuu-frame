/// <reference types="vite/client" />

interface ElectronAPI {
  openFile: () => Promise<string | undefined>;
  openDirectory: () => Promise<string[] | undefined>;
  onUpdatePlaylist: (callback: (videoFiles: string[]) => void) => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
