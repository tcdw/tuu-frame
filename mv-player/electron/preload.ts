import { ipcRenderer, contextBridge } from 'electron'

// --------- Expose API to the Renderer process ---------
contextBridge.exposeInMainWorld('electronAPI', {
  openFile: () => ipcRenderer.invoke('dialog:openFile'),
  openDirectory: () => ipcRenderer.invoke('dialog:openDirectory')
  // We can expose other specific APIs here as needed
});
