import { ipcRenderer, contextBridge } from 'electron'

// --------- Expose API to the Renderer process ---------
contextBridge.exposeInMainWorld('electronAPI', {
  openFile: () => ipcRenderer.invoke('dialog:openFile')
  // We can expose other specific APIs here as needed
});
