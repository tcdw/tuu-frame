import express, { Request, Response, NextFunction, RequestHandler } from "express";
import { fileURLToPath } from "node:url";
import cors from "cors";
import * as ApiTypes from "../src/shared-api-types.ts";
import { loadPresets, savePresets, scanDirectoryForVideos } from "./functions.ts";
import fs from "node:fs/promises";
import path from "node:path";
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
    getPublicSalt, // Added
} from "./auth";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function createServer(win: BrowserWindow): Promise<void> {
    const expressApp = express();
    const userDataPath = win.webContents.session.getStoragePath() || app.getPath("userData");

    // Only enable wildcard CORS configuration when during development (For security reasons)
    if (process.env.NODE_ENV === "development") {
        // CORS configuration
        const corsOptions = {
            origin: "*", // Allow only the remote UI's origin
            optionsSuccessStatus: 200, // For legacy browser support
        };
        expressApp.use(cors(corsOptions));
    }

    expressApp.use(express.json()); // Middleware to parse JSON bodies

    // Serve mv-remote-ui static files from 'remote-ui-assets' directory
    // This directory will contain the build output of mv-remote-ui
    const remoteUiPath = path.join(__dirname, "..", "remote-ui-assets");
    expressApp.use(express.static(remoteUiPath));
    const port = 15678;

    // Initialize credentials on server startup
    initializeCredentials(userDataPath).catch(err => {
        console.error("Failed to initialize credentials:", err);
        // Consider how to handle this error, e.g., prevent server start if critical
    });

    // --- Authentication Routes ---

    // Get Public Salt (for client-side password hashing)
    expressApp.get("/api/auth/public-salt", (async (_req: Request, res: Response) => {
        try {
            const salt = await getPublicSalt(userDataPath);
            res.json({ code: 200, data: { publicSalt: salt }, err: null });
        } catch (error) {
            console.error("Error fetching public salt:", error);
            res.status(500).json({ code: 500, data: null, err: "Internal server error fetching public salt." });
        }
    }) as any);


    // Login
    expressApp.post("/api/auth/login", (async (req: Request, res: Response) => {
        const { username, clientHashedPassword } = req.body;

        if (!username || !clientHashedPassword) {
            return res.status(400).json({ code: 400, data: null, err: "Username and client-hashed password are required." });
        }

        try {
            const credentials = await loadCredentials(userDataPath);
            if (!credentials || credentials.username !== username) {
                return res.status(401).json({ code: 401, data: null, err: "Invalid username or password." });
            }

            // The stored passwordHash is already a bcrypt hash of a client-hashed password.
            // So, we compare the incoming clientHashedPassword against it.
            const passwordMatch = await comparePassword(clientHashedPassword, credentials.passwordHash);
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
    expressApp.post("/api/auth/logout", authenticateToken, (_req: AuthenticatedRequest, res: Response) => {
        res.json({ code: 200, data: { message: "Logout successful (client should clear token)." }, err: null });
    });

    // Change Credentials
    expressApp.post("/api/auth/change-credentials", authenticateToken, (async (
        req: AuthenticatedRequest,
        res: Response,
    ) => {
        const { currentClientHashedPassword, newUsername, newClientHashedPassword } = req.body;
        const currentUsernameFromToken = req.user?.username;

        if (!currentUsernameFromToken) {
            return res.status(403).json({ code: 403, data: null, err: "User not authenticated or token invalid." });
        }

        if (!currentClientHashedPassword || (!newUsername && !newClientHashedPassword)) {
            return res.status(400).json({
                code: 400,
                data: null,
                err: "Current client-hashed password and either new username or new client-hashed password are required.",
            });
        }

        try {
            const credentials = await loadCredentials(userDataPath);
            if (!credentials || credentials.username !== currentUsernameFromToken) {
                return res.status(404).json({ code: 404, data: null, err: "User credentials not found." });
            }

            const passwordMatch = await comparePassword(currentClientHashedPassword, credentials.passwordHash);
            if (!passwordMatch) {
                return res.status(401).json({ code: 401, data: null, err: "Incorrect current password." });
            }

            const updatedCredentials: UserCredentials = { ...credentials };

            if (newUsername && typeof newUsername === "string" && newUsername.trim() !== "") {
                updatedCredentials.username = newUsername.trim();
            }

            if (newClientHashedPassword && typeof newClientHashedPassword === "string" && newClientHashedPassword.trim() !== "") {
                // The newClientHashedPassword is what we bcrypt and store
                updatedCredentials.passwordHash = await hashPassword(newClientHashedPassword.trim());
            }

            await saveCredentials(userDataPath, updatedCredentials);

            // If username changed, the client's current JWT will still be valid for the old username until it expires.
            // The client will need to log in again to get a JWT for the new username.
            // For this application, simply returning a success message is sufficient.
            // A more advanced system might implement token revocation or automatically issue a new token.
            res.json({ code: 200, data: { message: "Credentials updated successfully. Please log in again if username was changed." }, err: null });
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

    // SPA Fallback: For any GET request not handled by static files or API routes,
    // serve index.html from the mv-remote-ui build.
    // This must come AFTER all API routes and AFTER express.static for the remote UI.
    const spaFallbackHandler: RequestHandler = (req: Request, res: Response, _next: NextFunction) => {
        // If the request path starts with /api/ but wasn't caught by an API route,
        // it's a 404 for an API endpoint.
        if (req.path.startsWith("/api/")) {
            res.status(404).json({ code: 404, data: null, err: "API endpoint not found." });
            return;
        }

        // For all other GET requests, serve the main HTML file of the remote UI.
        // This allows client-side routing to take over.
        res.sendFile(path.join(remoteUiPath, "index.html"), err => {
            if (err) {
                const attemptedPath = path.resolve(path.join(remoteUiPath, "index.html"));
                console.error(`Error sending SPA fallback file (index.html) from path: ${attemptedPath}`);
                console.error("Detailed error object:", err);
                if (!res.headersSent) {
                    res.status(500).send("Error serving application core.");
                }
            }
        });
    };
    expressApp.get("*", spaFallbackHandler);

    return new Promise(resolve => {
        expressApp.listen(port, "0.0.0.0", () => {
            console.log(`Express server listening on http://localhost:${port}`);
            resolve();
        });
    });
}
