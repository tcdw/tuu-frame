"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("electronAPI", {
  openFile: () => electron.ipcRenderer.invoke("dialog:openFile"),
  openDirectory: () => electron.ipcRenderer.invoke("dialog:openDirectory"),
  onUpdatePlaylist: (callback) => electron.ipcRenderer.on("main:updatePlaylist", (_event, value) => callback(value))
  // We can expose other specific APIs here as needed
});
