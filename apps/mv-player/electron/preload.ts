import { ipcRenderer, contextBridge } from "electron";

// --------- Expose API to the Renderer process ---------
contextBridge.exposeInMainWorld("electronAPI", {
    openFile: () => ipcRenderer.invoke("dialog:openFile"),
    openDirectory: () => ipcRenderer.invoke("dialog:openDirectory"),
    onUpdatePlaylist: (callback: (videoFiles: string[]) => void) =>
        ipcRenderer.on("main:updatePlaylist", (_event, value) => callback(value)),
    // We can expose other specific APIs here as needed
});
