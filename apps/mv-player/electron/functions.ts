import fs from "node:fs/promises";
import path from "node:path";
import { app } from "electron";
import { randomUUID } from 'node:crypto';
import type { PresetItem } from '../src/shared-api-types';

const PRESETS_FILE_PATH = path.join(app.getPath("userData"), "mv-player-presets.json");

export async function loadPresets(): Promise<PresetItem[]> {
    try {
        await fs.access(PRESETS_FILE_PATH); // Check if file exists
        const data = await fs.readFile(PRESETS_FILE_PATH, "utf-8");
        const rawData = JSON.parse(data);

        // Check if it's the old format (array of strings)
        if (Array.isArray(rawData) && rawData.every(p => typeof p === 'string')) {
            console.log('Old preset format detected. Migrating to new format...');
            const migratedPresets: PresetItem[] = rawData.map((oldPath: string) => ({
                id: randomUUID(),
                mainPath: oldPath,
                order: 'shuffle', // Default order for migrated presets
                // name: oldPath.split(path.sep).pop() || oldPath // Optional: try to infer a name
            }));
            await savePresets(migratedPresets); // Save the migrated format
            console.log('Migration complete. Presets saved in new format.');
            return migratedPresets;
        }

        // Check if it's the new format (array of PresetItem)
        if (Array.isArray(rawData) && rawData.every(p => 
            typeof p === 'object' && p !== null && 
            typeof p.id === 'string' && 
            typeof p.mainPath === 'string' && 
            typeof p.order === 'string'
            // Add more checks if other fields become mandatory
        )) {
            return rawData as PresetItem[];
        }

        // If format is unrecognized or invalid
        console.warn('Preset file data is in an unrecognized format. Returning empty array.');
        return [];
    } catch (error) {
        // If file doesn't exist or is invalid, return empty array
        console.warn("Presets file not found or invalid, starting with empty presets.");
        return [];
    }
}

export async function savePresets(presets: PresetItem[]): Promise<void> {
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
