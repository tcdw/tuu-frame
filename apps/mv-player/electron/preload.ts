import { ipcRenderer, contextBridge } from "electron";

// --------- Expose API to the Renderer process ---------
contextBridge.exposeInMainWorld("electronAPI", {
    openFile: () => ipcRenderer.invoke("dialog:openFile"),
    openDirectory: () => ipcRenderer.invoke("dialog:openDirectory"),
    onUpdatePlaylist: (callback: (videoFiles: string[]) => void) =>
        ipcRenderer.on("main:updatePlaylist", (_event, value) => callback(value)),
    onPlayerCommand: (callback: (command: string, ...args: any[]) => void) =>
        ipcRenderer.on("main:playerCommand", (_event, command, ...args) => callback(command, ...args)),
    sendPlaybackState: (isPlaying: boolean) => ipcRenderer.send("renderer:playbackStateUpdate", isPlaying),
    // We can expose other specific APIs here as needed
});
