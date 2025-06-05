import { app, BrowserWindow, ipcMain, dialog, protocol } from 'electron'
import express from 'express';
import { fileURLToPath } from 'node:url'
import path from 'node:path';
import fs from 'node:fs/promises';

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, '..')

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      // webSecurity: false
    },
  })

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(() => {
  // Register 'mv-stream' protocol
  protocol.registerFileProtocol('mv-stream', (request, callback) => {
    const url = request.url.replace('mv-stream://', '');
    try {
      // Decode URI to handle spaces or special characters in file paths
      const decodedUrl = decodeURI(url);
      return callback(decodedUrl);
    } catch (error) {
      console.error('Failed to decode URL for mv-stream protocol:', error);
      // It's important to call the callback, even with an error or a non-existent path
      return callback({ error: -1 }); // Or some other error code
    }
  });

  // IPC handler for opening directory dialog
  ipcMain.handle('dialog:openDirectory', async () => {
    if (!win) {
      console.error('Main window is not available.');
      return;
    }
    const { canceled, filePaths } = await dialog.showOpenDialog(win, {
      properties: ['openDirectory']
    });
    if (canceled || filePaths.length === 0) {
      return []; // Return empty array if no directory selected or dialog cancelled
    }
    const directoryPath = filePaths[0];
    try {
      const dirents = await fs.readdir(directoryPath, { withFileTypes: true });
      const videoExtensions = ['.mp4', '.mkv', '.webm'];
      const videoFiles = dirents
        .filter(dirent => dirent.isFile() && videoExtensions.includes(path.extname(dirent.name).toLowerCase()))
        .map(dirent => path.join(directoryPath, dirent.name));
      return videoFiles;
    } catch (error) {
      console.error('Error scanning directory:', error);
      return []; // Return empty array on error
    }
  });

  // IPC handler for opening file dialog
  ipcMain.handle('dialog:openFile', async () => {
    if (!win) {
      console.error('Main window is not available.');
      return;
    }
    const { canceled, filePaths } = await dialog.showOpenDialog(win, {
      properties: ['openFile'],
      filters: [
        { name: 'Movies', extensions: ['mkv', 'mp4', 'webm'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });
    if (canceled || filePaths.length === 0) {
      return;
    }
    return filePaths[0];
  });

  createWindow();

  const expressApp = express();
  const port = 3001;

  expressApp.get('/api/ping', (_req, res) => {
    res.json({ message: 'pong' });
  });

  expressApp.listen(port, () => {
    console.log(`Express server listening on http://localhost:${port}`);
  });
});
