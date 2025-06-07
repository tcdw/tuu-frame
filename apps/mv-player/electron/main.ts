import { app, BrowserWindow, ipcMain, dialog, protocol } from "electron";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { scanDirectoryForVideos } from "./functions.ts";
import { createServer } from "./server.ts";

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
process.env.APP_ROOT = path.join(__dirname, "..");

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, "public") : RENDERER_DIST;

let win: BrowserWindow | null;

function createWindow(): BrowserWindow {
    win = new BrowserWindow({
        icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
        webPreferences: {
            preload: path.join(__dirname, "preload.mjs"),
            // webSecurity: false
        },
    });

    // Test active push message to Renderer-process.
    win.webContents.on("did-finish-load", () => {
        win?.webContents.send("main-process-message", new Date().toLocaleString());
    });

    // URL loading will be handled after server starts
    return win!;
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
        win = null;
    }
});

app.on("activate", () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

app.whenReady().then(async () => {
    // Register 'mv-stream' protocol
    protocol.registerFileProtocol("mv-stream", (request, callback) => {
        const url = request.url.replace("mv-stream://", "");
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
    ipcMain.handle("dialog:openDirectory", async () => {
        if (!win) {
            console.error("Main window is not available.");
            return;
        }
        const { canceled, filePaths: selectedPaths } = await dialog.showOpenDialog(win, {
            properties: ["openDirectory"],
        });

        if (canceled || selectedPaths.length === 0) {
            return;
        }
        const directoryPath = selectedPaths[0];
        const videoFiles = await scanDirectoryForVideos(directoryPath);

        if (videoFiles.length > 0) {
            console.log("Videos found via dialog:", videoFiles);
            return videoFiles;
        } else {
            console.log("No video files found in the selected directory via dialog.");
            return [];
        }
    });

    // IPC handler for opening file dialog
    ipcMain.handle("dialog:openFile", async () => {
        if (!win) {
            console.error("Main window is not available.");
            return;
        }
        const { canceled, filePaths } = await dialog.showOpenDialog(win, {
            properties: ["openFile"],
            filters: [
                { name: "Movies", extensions: ["mkv", "mp4", "webm"] },
                { name: "All Files", extensions: ["*"] },
            ],
        });
        if (canceled || filePaths.length === 0) {
            return;
        }
        return filePaths[0];
    });

    const win = createWindow();
    await createServer(win);

    const devServerUrl = process.env.VITE_DEV_SERVER_URL;

    if (devServerUrl) {
      // Development: Load mv-player's UI from Vite dev server
      console.log(`[Electron Main] Development mode: Loading player UI from ${devServerUrl}`);
      win.loadURL(devServerUrl).catch(err => {
        console.error(`[Electron Main] Failed to load dev server URL ${devServerUrl}:`, err);
      });
      win.webContents.openDevTools();
    } else {
      // Production: Load mv-player's UI from its build output file
      // __dirname in main.ts (packaged) is app.asar/dist-electron/
      const playerUiIndexPath = path.join(__dirname, '..', 'dist', 'index.html');
      console.log(`[Electron Main] Production mode: Loading player UI from ${playerUiIndexPath}`);
      win.loadFile(playerUiIndexPath).catch(err => {
        console.error(`[Electron Main] Failed to load file ${playerUiIndexPath}:`, err);
      });
    }

  }).catch(e => {
    console.error("Failed to create window or server:", e);
    app.quit();
  });
