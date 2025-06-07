import fs from "node:fs/promises";
import path from "node:path";
import { app } from "electron";

const PRESETS_FILE_PATH = path.join(app.getPath("userData"), "mv-player-presets.json");

export async function loadPresets(): Promise<string[]> {
    try {
        await fs.access(PRESETS_FILE_PATH); // Check if file exists
        const data = await fs.readFile(PRESETS_FILE_PATH, "utf-8");
        const presets = JSON.parse(data);
        if (Array.isArray(presets) && presets.every(p => typeof p === "string")) {
            return presets;
        }
        return [];
    } catch (error) {
        // If file doesn't exist or is invalid, return empty array
        console.warn("Presets file not found or invalid, starting with empty presets.");
        return [];
    }
}

export async function savePresets(presets: string[]): Promise<void> {
    try {
        await fs.writeFile(PRESETS_FILE_PATH, JSON.stringify(presets, null, 2));
    } catch (error) {
        console.error("Error saving presets:", error);
    }
}

export async function scanDirectoryForVideos(directoryPath: string): Promise<string[]> {
    try {
        const files = await fs.readdir(directoryPath);
        return files
            .filter(file => {
                const ext = path.extname(file).toLowerCase();
                return [".mp4", ".mkv", ".webm"].includes(ext);
            })
            .map(file => path.join(directoryPath, file));
    } catch (error) {
        console.error(`Error scanning directory ${directoryPath}:`, error);
        return []; // Return empty array on error
    }
}
