import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

// Get current directory in an ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths are relative to the script's location (mv-player/scripts/)
const projectRoot = path.resolve(__dirname, ".."); // Points to mv-player
const remoteUiDist = path.resolve(projectRoot, "..", "..", "apps", "mv-remote-ui", "dist");
const targetDir = path.resolve(projectRoot, "remote-ui-assets");

async function copyRemoteUiAssets() {
    try {
        console.log(`SCRIPT_LOG: Removing directory: ${targetDir}`);
        await fs.remove(targetDir);
        console.log(`SCRIPT_LOG: Successfully removed directory: ${targetDir}`);

        console.log(`SCRIPT_LOG: Creating directory: ${targetDir}`);
        await fs.ensureDir(targetDir);
        console.log(`SCRIPT_LOG: Successfully created directory: ${targetDir}`);

        console.log(`SCRIPT_LOG: Checking if source directory ${remoteUiDist} exists.`);
        const sourceExists = await fs.pathExists(remoteUiDist);

        if (sourceExists) {
            console.log(`SCRIPT_LOG: Copying assets from ${remoteUiDist} to ${targetDir}`);
            await fs.copy(remoteUiDist, targetDir, { overwrite: true });
            console.log("SCRIPT_LOG: Successfully copied remote UI assets.");
        } else {
            // It's possible mv-remote-ui hasn't been built yet, especially during a clean dev start.
            // So, this is a warning, not necessarily a fatal error for the copy script itself.
            console.warn(
                `SCRIPT_LOG: Warning: Source directory ${remoteUiDist} does not exist. Skipping copy. This might be expected if 'mv-remote-ui' has not been built yet.`,
            );
        }
    } catch (error) {
        console.error("SCRIPT_LOG: Error during copy:remote-ui operation:", error);
        process.exit(1); // Exit with error code if something goes wrong
    }
}

copyRemoteUiAssets();
