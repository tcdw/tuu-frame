import fs from "node:fs/promises";
import path from "node:path";
import { app } from "electron";
// import { randomUUID } from 'node:crypto'; // Might be needed for future migrations
import type { PresetItem } from "../src/shared-api-types";

const CURRENT_DATA_VERSION = 1;

interface PresetDataContainer {
    version: number;
    presets: PresetItem[];
}

const PRESETS_FILE_PATH = path.join(app.getPath("userData"), "mv-player-presets.json");

async function savePresetDataContainer(data: PresetDataContainer): Promise<void> {
    try {
        await fs.writeFile(PRESETS_FILE_PATH, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error("Error saving preset data container:", error);
        // Optionally, re-throw or handle more gracefully depending on requirements
    }
}

export async function loadPresets(): Promise<PresetItem[]> {
    try {
        await fs.access(PRESETS_FILE_PATH); // Check if file exists
        const fileContent = await fs.readFile(PRESETS_FILE_PATH, "utf-8");
        const parsedData = JSON.parse(fileContent);

        // Case 1: Old format (direct array of PresetItem) - migrate to versioned container
        if (Array.isArray(parsedData)) {
            console.log("Unversioned presets file detected. Migrating to versioned format (v1)...");
            const migratedPresets = (parsedData as any[]).map(p => {
                if (p.mainPath && typeof p.path === "undefined") {
                    const { mainPath, ...rest } = p;
                    return { ...rest, path: mainPath };
                }
                return p;
            }) as PresetItem[];

            const versionedData: PresetDataContainer = {
                version: CURRENT_DATA_VERSION,
                presets: migratedPresets, // Use migrated presets
            };
            await savePresetDataContainer(versionedData);
            console.log("Migration to versioned format complete.");
            return migratedPresets; // Return migrated presets
        }

        // Case 2: It's an object, hopefully PresetDataContainer
        if (
            typeof parsedData === "object" &&
            parsedData !== null &&
            "version" in parsedData &&
            "presets" in parsedData
        ) {
            const container = parsedData as PresetDataContainer;

            // Ensure presets within the loaded container are also migrated if necessary
            if (Array.isArray(container.presets)) {
                container.presets = (container.presets as any[]).map(p => {
                    if (p.mainPath && typeof p.path === "undefined") {
                        const { mainPath, ...rest } = p;
                        return { ...rest, path: mainPath };
                    }
                    return p;
                }) as PresetItem[];
            }

            if (container.version === CURRENT_DATA_VERSION) {
                // Correct version, ensure presets is an array
                return Array.isArray(container.presets) ? container.presets : [];
            } else if (container.version < CURRENT_DATA_VERSION) {
                // Migration needed from an older versioned format
                console.warn(
                    `Old data version ${container.version} detected. Current version is ${CURRENT_DATA_VERSION}.`,
                );
                // --- BEGIN MIGRATION LOGIC ---
                // Example: Migrating from version 1 to 2 (if CURRENT_DATA_VERSION becomes 2)
                // if (container.version === 1 && CURRENT_DATA_VERSION === 2) {
                //   container.presets = migrateV1toV2(container.presets);
                //   container.version = 2;
                // }
                // --- END MIGRATION LOGIC ---
                // For now, if a version is old and no migration path exists, we might just use presets as is or reset.
                // Let's assume for now we'll try to use them but update the version if we had migrated.
                // If migration happened and container.version was updated:
                // await savePresetDataContainer(container);
                // For this initial setup (only v0 array -> v1 object), this path might not be hit if v0 is handled above.
                console.log("Attempting to use presets from older version. Consider implementing specific migration.");
                return Array.isArray(container.presets) ? container.presets : [];
            } else {
                // Data version is newer than app supports (e.g., user downgraded app)
                console.warn(
                    `Preset data version ${container.version} is newer than supported version ${CURRENT_DATA_VERSION}. Using presets as is, but caution advised.`,
                );
                return Array.isArray(container.presets) ? container.presets : [];
            }
        }

        // Unrecognized format
        console.warn("Preset file data is in an unrecognized format. Initializing with empty presets.");
        const defaultContainer: PresetDataContainer = { version: CURRENT_DATA_VERSION, presets: [] };
        await savePresetDataContainer(defaultContainer);
        return [];
    } catch (error) {
        // If file doesn't exist or is invalid, return empty array
        console.warn(
            "Presets file not found or invalid, initializing with empty presets version " + CURRENT_DATA_VERSION + ":",
            error,
        );
        const defaultContainer: PresetDataContainer = { version: CURRENT_DATA_VERSION, presets: [] };
        await savePresetDataContainer(defaultContainer);
        return [];
    }
}

export async function savePresets(presets: PresetItem[]): Promise<void> {
    const dataToSave: PresetDataContainer = {
        version: CURRENT_DATA_VERSION,
        presets: presets,
    };
    await savePresetDataContainer(dataToSave);
}

export async function scanDirectoryForVideos(directoryPath: string): Promise<string[]> {
    try {
        const files = await fs.readdir(directoryPath);
        return files
            .filter(file => {
                const ext = path.extname(file).toLowerCase();
                return [".mp4", ".mkv", ".webm", ".mp3", ".wav", ".aac", ".m4a", ".flac", ".ogg"].includes(ext);
            })
            .map(file => path.join(directoryPath, file));
    } catch (error) {
        console.error(`Error scanning directory ${directoryPath}:`, error);
        return []; // Return empty array on error
    }
}
