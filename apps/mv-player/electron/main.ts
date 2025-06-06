import { app, BrowserWindow, ipcMain, dialog, protocol } from 'electron'
import express, { Request, Response } from 'express';
import cors from 'cors';
import { fileURLToPath } from 'node:url'
import path from 'node:path';
import fs from 'node:fs/promises';
import * as ApiTypes from '../src/shared-api-types.ts';
import {loadPresets, savePresets, scanDirectoryForVideos} from "./functions.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
      // Decode URI component to handle all special characters in file paths
      const decodedUrl = decodeURIComponent(url);
      console.log(`[mv-stream] Request URL: ${request.url}`);
      console.log(`[mv-stream] Extracted component: ${url}`);
      console.log(`[mv-stream] Attempting to serve decoded path: ${decodedUrl}`);

      // Ensure it's an absolute path (it should be, coming from scanDirectoryForVideos)
      if (path.isAbsolute(decodedUrl)) {
        return callback({ path: decodedUrl }); // Use object form
      } else {
        console.error(`[mv-stream] Path is not absolute: ${decodedUrl}`);
        return callback({ error: -2 }); // net::FAILED or a more specific error like invalid argument
      }
    } catch (error) {
      console.error(`[mv-stream] Error processing URL ${request.url}:`, error);
      return callback({ error: -6 }); // net::ERR_FILE_NOT_FOUND
    }
  });

  // IPC handler for opening directory dialog
  ipcMain.handle('dialog:openDirectory', async () => {
    if (!win) {
      console.error('Main window is not available.');
      return;
    }
    const { canceled, filePaths: selectedPaths } = await dialog.showOpenDialog(win, {
      properties: ['openDirectory']
    });

    if (canceled || selectedPaths.length === 0) {
      return;
    }
    const directoryPath = selectedPaths[0];
    const videoFiles = await scanDirectoryForVideos(directoryPath);

    if (videoFiles.length > 0) {
      console.log('Videos found via dialog:', videoFiles);
      return videoFiles;
    } else {
      console.log('No video files found in the selected directory via dialog.');
      return [];
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

  // CORS configuration
  const corsOptions = {
    origin: '*', // Allow only the remote UI's origin
    optionsSuccessStatus: 200 // For legacy browser support
  };
  expressApp.use(cors(corsOptions));

  expressApp.use(express.json()); // Middleware to parse JSON bodies
  const port = 3001;

  expressApp.get('/api/ping', (_req: Request, res: Response<ApiTypes.PingResponse>) => {
    res.json({ code: 200, data: { message: 'pong' }, err: null });
  });

  // Get all presets
  expressApp.get('/api/presets', async (_req: Request, res: Response<ApiTypes.PresetsListResponse>) => {
    const presets = await loadPresets();
    res.json({ code: 200, data: presets, err: null });
  });

  // Add a new preset
  expressApp.post('/api/presets', (async (req: Request<never, ApiTypes.PresetMutationSuccessResponse, ApiTypes.AddPresetRequest>, res: Response<ApiTypes.PresetMutationSuccessResponse>) => {
    const { path: newPresetPath }: ApiTypes.AddPresetRequest = req.body;

    if (!newPresetPath || typeof newPresetPath !== 'string') {
      res.status(400).json({ code: 400, data: null, err: 'Invalid path provided.' });
      return;
    }

    try {
      const stats = await fs.stat(newPresetPath);
      if (!stats.isDirectory()) {
        res.status(400).json({ code: 400, data: null, err: 'Path is not a directory.' });
        return;
      }
    } catch (error) {
      res.status(400).json({ code: 400, data: null, err: 'Path does not exist or is inaccessible.' });
      return;
    }

    const currentPresets = await loadPresets();
    if (currentPresets.includes(newPresetPath)) {
      res.status(409).json({ code: 409, data: null, err: 'Preset already exists.' });
      return;
    }

    const updatedPresets = [...currentPresets, newPresetPath];
    await savePresets(updatedPresets);
    res.status(201).json({ code: 201, data: { presets: updatedPresets, message: 'Preset added successfully.' }, err: null });
  }) as any);

  // Delete a preset
  expressApp.delete('/api/presets', (async (req: Request<never, ApiTypes.PresetMutationSuccessResponse, ApiTypes.DeletePresetRequest>, res: Response<ApiTypes.PresetMutationSuccessResponse>) => {
    const { path: pathToDelete }: ApiTypes.DeletePresetRequest = req.body;

    if (!pathToDelete || typeof pathToDelete !== 'string') {
      res.status(400).json({ code: 400, data: null, err: 'Invalid path provided for deletion.' });
      return;
    }

    const currentPresets = await loadPresets();
    if (!currentPresets.includes(pathToDelete)) {
      res.status(404).json({ code: 404, data: null, err: 'Preset path not found.' });
      return;
    }

    const updatedPresets = currentPresets.filter(p => p !== pathToDelete);
    await savePresets(updatedPresets);
    res.json({ code: 200, data: { presets: updatedPresets, message: 'Preset deleted successfully.' }, err: null });
  }) as any);

  // Set active directory and trigger playlist update in renderer
  expressApp.post('/api/set-active-directory', (async (req: Request<never, ApiTypes.SetActiveDirectorySuccessResponse, ApiTypes.SetActiveDirectoryRequest>, res: Response<ApiTypes.SetActiveDirectorySuccessResponse>) => {
    const { path: directoryPath }: ApiTypes.SetActiveDirectoryRequest = req.body;

    if (!directoryPath || typeof directoryPath !== 'string') {
      res.status(400).json({ code: 400, data: null, err: 'Invalid directory path provided.' });
      return;
    }

    try {
      const stats = await fs.stat(directoryPath);
      if (!stats.isDirectory()) {
        res.status(400).json({ code: 400, data: null, err: 'Provided path is not a directory.' });
        return;
      }
    } catch (error) {
      res.status(400).json({ code: 400, data: null, err: 'Directory path does not exist or is inaccessible.' });
      return;
    }

    const videoFiles = await scanDirectoryForVideos(directoryPath);

    if (win) {
      win.webContents.send('main:updatePlaylist', videoFiles);
      console.log(`Sent main:updatePlaylist IPC with ${videoFiles.length} videos for path: ${directoryPath}`);
      res.json({ code: 200, data: { message: `Active directory set to ${directoryPath}. Playlist updated.`, videoCount: videoFiles.length }, err: null });
    } else {
      console.error('Main window (win) not available to send IPC message.');
      res.status(500).json({ code: 500, data: null, err: 'Main window not available to update playlist.' });
    }
  }) as any);

  expressApp.listen(port, () => {
    console.log(`Express server listening on http://localhost:${port}`);
  });
});
