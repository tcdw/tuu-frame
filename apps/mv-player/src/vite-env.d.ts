/* eslint-disable no-var */

/// <reference types="vite/client" />

interface ElectronAPI {
    openFile: () => Promise<string | undefined>;
    openDirectory: () => Promise<string[] | undefined>;
    onUpdatePlaylist: (callback: (videoFiles: string[]) => void) => void;
    onPlayerCommand: (callback: (command: string, ...args: any[]) => void) => void;
    sendPlaybackState: (isPlaying: boolean) => void;
}

declare var electronAPI: ElectronAPI;
