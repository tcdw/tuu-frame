"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("electronAPI", {
  openFile: () => electron.ipcRenderer.invoke("dialog:openFile"),
  openDirectory: () => electron.ipcRenderer.invoke("dialog:openDirectory")
  // We can expose other specific APIs here as needed
});
