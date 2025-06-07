import express, { Request, Response } from "express";
import cors from "cors";
import * as ApiTypes from "../src/shared-api-types.ts";
import { loadPresets, savePresets, scanDirectoryForVideos } from "./functions.ts";
import fs from "node:fs/promises";
import { BrowserWindow } from "electron";

export function createServer(win: BrowserWindow) {
    const expressApp = express();

    // CORS configuration
    const corsOptions = {
        origin: "*", // Allow only the remote UI's origin
        optionsSuccessStatus: 200, // For legacy browser support
    };
    expressApp.use(cors(corsOptions));

    expressApp.use(express.json()); // Middleware to parse JSON bodies
    const port = 3001;

    expressApp.get("/api/ping", (_req: Request, res: Response<ApiTypes.PingResponse>) => {
        res.json({ code: 200, data: { message: "pong" }, err: null });
    });

    // Get all presets
    expressApp.get("/api/presets", async (_req: Request, res: Response<ApiTypes.PresetsListResponse>) => {
        const presets = await loadPresets();
        res.json({ code: 200, data: presets, err: null });
    });

    // Add a new preset
    expressApp.post("/api/presets", (async (
        req: Request<never, ApiTypes.PresetMutationSuccessResponse, ApiTypes.AddPresetRequest>,
        res: Response<ApiTypes.PresetMutationSuccessResponse>,
    ) => {
        const { path: newPresetPath }: ApiTypes.AddPresetRequest = req.body;

        if (!newPresetPath) {
            res.status(400).json({ code: 400, data: null, err: "Invalid path provided." });
            return;
        }

        try {
            const stats = await fs.stat(newPresetPath);
            if (!stats.isDirectory()) {
                res.status(400).json({ code: 400, data: null, err: "Path is not a directory." });
                return;
            }
        } catch (error) {
            console.error(`[/api/presets] Error: ${error}`);
            res.status(400).json({ code: 400, data: null, err: "Path does not exist or is inaccessible." });
            return;
        }

        const currentPresets = await loadPresets();
        if (currentPresets.includes(newPresetPath)) {
            res.status(409).json({ code: 409, data: null, err: "Preset already exists." });
            return;
        }

        const updatedPresets = [...currentPresets, newPresetPath];
        await savePresets(updatedPresets);
        res.status(201).json({
            code: 201,
            data: { presets: updatedPresets, message: "Preset added successfully." },
            err: null,
        });
    }) as any);

    // Delete a preset
    expressApp.delete("/api/presets", (async (
        req: Request<never, ApiTypes.PresetMutationSuccessResponse, ApiTypes.DeletePresetRequest>,
        res: Response<ApiTypes.PresetMutationSuccessResponse>,
    ) => {
        const { path: pathToDelete }: ApiTypes.DeletePresetRequest = req.body;

        if (!pathToDelete) {
            res.status(400).json({ code: 400, data: null, err: "Invalid path provided for deletion." });
            return;
        }

        const currentPresets = await loadPresets();
        if (!currentPresets.includes(pathToDelete)) {
            res.status(404).json({ code: 404, data: null, err: "Preset path not found." });
            return;
        }

        const updatedPresets = currentPresets.filter(p => p !== pathToDelete);
        await savePresets(updatedPresets);
        res.json({ code: 200, data: { presets: updatedPresets, message: "Preset deleted successfully." }, err: null });
    }) as any);

    // Set active directory and trigger playlist update in renderer
    expressApp.post("/api/set-active-directory", (async (
        req: Request<never, ApiTypes.SetActiveDirectorySuccessResponse, ApiTypes.SetActiveDirectoryRequest>,
        res: Response<ApiTypes.SetActiveDirectorySuccessResponse>,
    ) => {
        const { path: directoryPath }: ApiTypes.SetActiveDirectoryRequest = req.body;

        if (!directoryPath) {
            res.status(400).json({ code: 400, data: null, err: "Invalid directory path provided." });
            return;
        }

        try {
            const stats = await fs.stat(directoryPath);
            if (!stats.isDirectory()) {
                res.status(400).json({ code: 400, data: null, err: "Provided path is not a directory." });
                return;
            }
        } catch (error) {
            console.error(`[/api/set-active-directory] Error: ${error}`);
            res.status(400).json({ code: 400, data: null, err: "Directory path does not exist or is inaccessible." });
            return;
        }

        const videoFiles = await scanDirectoryForVideos(directoryPath);

        if (win) {
            win.webContents.send("main:updatePlaylist", videoFiles);
            console.log(`Sent main:updatePlaylist IPC with ${videoFiles.length} videos for path: ${directoryPath}`);
            res.json({
                code: 200,
                data: {
                    message: `Active directory set to ${directoryPath}. Playlist updated.`,
                    videoCount: videoFiles.length,
                },
                err: null,
            });
        } else {
            console.error("Main window (win) not available to send IPC message.");
            res.status(500).json({ code: 500, data: null, err: "Main window not available to update playlist." });
        }
    }) as any);

    expressApp.listen(port, () => {
        console.log(`Express server listening on http://localhost:${port}`);
    });
}