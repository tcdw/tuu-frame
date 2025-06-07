/* eslint-disable no-var */

/// <reference types="vite/client" />

interface ElectronAPI {
    openFile: () => Promise<string | undefined>;
    openDirectory: () => Promise<string[] | undefined>;
    onUpdatePlaylist: (callback: (videoFiles: string[]) => void) => void;
}

declare var electronAPI: ElectronAPI;
