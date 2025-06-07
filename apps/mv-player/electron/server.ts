import express, { Request, Response } from "express";
import cors from "cors";
import * as ApiTypes from "../src/shared-api-types.ts";
import { loadPresets, savePresets, scanDirectoryForVideos } from "./functions.ts";
import fs from "node:fs/promises";
import { BrowserWindow, app } from "electron";
import {
    initializeCredentials,
    loadCredentials,
    saveCredentials,
    hashPassword,
    comparePassword,
    generateToken,
    authenticateToken,
    AuthenticatedRequest,
    UserCredentials,
} from "./auth";

export function createServer(win: BrowserWindow) {
    const expressApp = express();
    const userDataPath = app.getPath("userData");

    // CORS configuration
    const corsOptions = {
        origin: "*", // Allow only the remote UI's origin
        optionsSuccessStatus: 200, // For legacy browser support
    };
    expressApp.use(cors(corsOptions));

    expressApp.use(express.json()); // Middleware to parse JSON bodies
    const port = 3001;

    // Initialize credentials on server startup
    initializeCredentials(userDataPath).catch(err => {
        console.error("Failed to initialize credentials:", err);
        // Consider how to handle this error, e.g., prevent server start if critical
    });

    // --- Authentication Routes ---

    // Login
    expressApp.post("/auth/login", (async (req: Request, res: Response) => {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ code: 400, data: null, err: "Username and password are required." });
        }

        try {
            const credentials = await loadCredentials(userDataPath);
            if (!credentials || credentials.username !== username) {
                return res.status(401).json({ code: 401, data: null, err: "Invalid username or password." });
            }

            const passwordMatch = await comparePassword(password, credentials.passwordHash);
            if (!passwordMatch) {
                return res.status(401).json({ code: 401, data: null, err: "Invalid username or password." });
            }

            const token = generateToken(credentials.username);
            res.json({ code: 200, data: { token, message: "Login successful." }, err: null });
        } catch (error) {
            console.error("Login error:", error);
            res.status(500).json({ code: 500, data: null, err: "Internal server error during login." });
        }
    }) as any);

    // Logout (conceptual - JWT logout is primarily client-side)
    expressApp.post("/auth/logout", authenticateToken, (_req: AuthenticatedRequest, res: Response) => {
        res.json({ code: 200, data: { message: "Logout successful (client should clear token)." }, err: null });
    });

    // Change Credentials
    expressApp.post("/auth/change-credentials", authenticateToken, (async (
        req: AuthenticatedRequest,
        res: Response,
    ) => {
        const { currentPassword, newUsername, newPassword } = req.body;
        const currentUsernameFromToken = req.user?.username;

        if (!currentUsernameFromToken) {
            return res.status(403).json({ code: 403, data: null, err: "User not authenticated or token invalid." });
        }

        if (!currentPassword || (!newUsername && !newPassword)) {
            return res.status(400).json({
                code: 400,
                data: null,
                err: "Current password and either new username or new password are required.",
            });
        }

        try {
            const credentials = await loadCredentials(userDataPath);
            if (!credentials || credentials.username !== currentUsernameFromToken) {
                return res.status(401).json({ code: 401, data: null, err: "Credentials mismatch or user not found." });
            }

            const passwordMatch = await comparePassword(currentPassword, credentials.passwordHash);
            if (!passwordMatch) {
                return res.status(401).json({ code: 401, data: null, err: "Incorrect current password." });
            }

            let updatedUsername = credentials.username;
            let updatedPasswordHash = credentials.passwordHash;
            let usernameChanged = false;
            let passwordChanged = false;

            if (
                newUsername &&
                typeof newUsername === "string" &&
                newUsername.trim() !== "" &&
                newUsername.trim() !== credentials.username
            ) {
                updatedUsername = newUsername.trim();
                usernameChanged = true;
            }

            if (newPassword && typeof newPassword === "string" && newPassword.trim() !== "") {
                updatedPasswordHash = await hashPassword(newPassword.trim());
                passwordChanged = true;
            }

            if (!usernameChanged && !passwordChanged) {
                return res.status(200).json({ code: 200, data: { message: "No changes detected." }, err: null });
            }

            const updatedCredentials: UserCredentials = {
                username: updatedUsername,
                passwordHash: updatedPasswordHash,
            };

            await saveCredentials(userDataPath, updatedCredentials);

            const responseData: { message: string; token?: string } = { message: "Credentials updated successfully." };

            if (usernameChanged) {
                responseData.message =
                    "Username updated successfully. Please log in again with the new username to get a new token.";
            } else if (passwordChanged) {
                // Password changed, username same
                const newToken = generateToken(updatedUsername);
                responseData.token = newToken;
                responseData.message = "Password updated successfully. New token issued.";
            }

            res.json({ code: 200, data: responseData, err: null });
        } catch (error) {
            console.error("Change credentials error:", error);
            res.status(500).json({ code: 500, data: null, err: "Internal server error during credential change." });
        }
    }) as any);

    // --- API Routes ---

    // Ping route (unprotected)
    expressApp.get("/api/ping", (_req: Request, res: Response<ApiTypes.PingResponse>) => {
        res.json({ code: 200, data: { message: "pong" }, err: null });
    });

    // Get all presets (protected)
    expressApp.get("/api/presets", authenticateToken, (async (
        _req: AuthenticatedRequest,
        res: Response<ApiTypes.PresetsListResponse>,
    ) => {
        const presets = await loadPresets();
        res.json({ code: 200, data: presets, err: null });
    }) as any);

    // Add a new preset
    expressApp.post("/api/presets", authenticateToken, (async (
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
    expressApp.delete("/api/presets", authenticateToken, (async (
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
    expressApp.post("/api/set-active-directory", authenticateToken, (async (
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
