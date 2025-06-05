# Project Overview: Local MV Player with Remote Control

## 1. Project Objective

To develop an Electron-based local music video (MV) player that supports playback from selected local directories. Accompanying this is a LAN-accessible web-based remote management interface to control playback and manage preset folders.

## 2. Core Components

There are two main parts to this project:

*   **`mv-player`**: The Electron application responsible for local video playback and exposing a control API.
*   **`mv-remote-ui`**: A Vite + React + TypeScript web application that serves as the remote control interface.

## 3. `mv-player` (Electron Application)

Located in the `/Users/tcdw/Projects/mtv/mv-player/` directory.

### Key Features:

*   **Local Video Playback**: Plays video files (e.g., .mp4, .mkv, .webm) from user-specified directories.
*   **Random Playback**: Automatically plays videos in a random order from the active directory. Continuous playback upon video end.
*   **Custom Protocol**: Uses `mv-stream://` custom protocol to securely serve local video files to the renderer, allowing `webSecurity` to remain enabled.
*   **Preset Folder Management**: Allows saving and loading lists of preset directories. Presets are stored in a JSON file (`presets.json`) within the Electron app's user data directory.
*   **Express API Server**: An embedded Express.js server runs on port `3001` within the Electron main process to handle remote commands.
    *   **CORS Enabled**: Configured to allow cross-origin requests (currently set to `*` for development) from the remote UI.
*   **IPC Communication**: Uses Electron's IPC to communicate between the main process (API, file system logic) and the renderer process (UI updates).

### Technical Stack:

*   **Framework**: Electron
*   **Language**: TypeScript
*   **Backend API**: Express.js (embedded)
*   **Renderer UI**: Vanilla TypeScript, HTML, CSS (React was recently removed for simplicity)
*   **Build Tool**: Vite
*   **Package Manager**: pnpm

### API Endpoints (on `http://localhost:3001`):

*   `GET /api/presets`: Retrieves the current list of preset folder paths.
*   `POST /api/presets`: Adds a new folder path to the presets. Expects `{"path": "/your/folder/path"}`.
*   `DELETE /api/presets`: Deletes a folder path from the presets. Expects `{"path": "/your/folder/path"}`.
*   `POST /api/set-active-directory`: Sets the currently active directory for playback. Expects `{"path": "/your/folder/path"}`. Triggers playlist update and random playback in the Electron app.

### Key Files:

*   `electron/main.ts`: Electron main process logic, Express server setup, API endpoint definitions, preset management, IPC handling.
*   `electron/preload.ts`: Exposes `window.electronAPI` to the renderer for secure IPC.
*   `src/app.ts`: Renderer process logic (video element control, event handling, IPC listeners).
*   `src/main.ts`: Entry point for the renderer process.
*   `index.html`: The HTML structure for the renderer window.
*   `vite.config.ts`: Vite build configuration.
*   `package.json`: Project dependencies and scripts.

## 4. `mv-remote-ui` (Web Remote Control)

Located in the `/Users/tcdw/Projects/mtv/mv-remote-ui/` directory (currently part of the `mv-player` Git repository).

### Key Features:

*   **Preset Management**: Remotely view, add, and delete preset folders by interacting with the `mv-player` API.
*   **Playback Control**: Remotely set the active playback directory for the `mv-player`.
*   **User Feedback**: Basic loading indicators and error messages.

### Technical Stack:

*   **Framework/Library**: React
*   **Language**: TypeScript
*   **Build Tool**: Vite
*   **Styling**: CSS
*   **API Communication**: Fetch API

### Key Files:

*   `src/App.tsx`: Main React component containing the UI and logic for interacting with the API.
*   `src/services/api.ts`: Module encapsulating API calls to the `mv-player` backend.
*   `vite.config.ts`: Vite build configuration.
*   `package.json`: Project dependencies and scripts.

## 5. Current Status & Potential Next Steps

*   **Core Functionality**: The local player can play videos, and the remote UI can manage presets and set the active playback directory. CORS and API communication are functional.
*   **Refactoring**: React has been successfully removed from the `mv-player` renderer, simplifying its architecture.

### Potential Future Enhancements:

1.  **Enhance Remote UI (`mv-remote-ui`):**
    *   Display current playback status (e.g., current video name, playing/paused state).
    *   Add playback controls (play, pause, next, previous, volume control).
    *   Improve overall UI/UX and error/success message presentation.
2.  **Recursive Directory Scanning (`mv-player`):** Allow the Electron app to find videos within subfolders of a selected preset directory.
3.  **Separate Git Repositories**: Move `mv-remote-ui` into its own dedicated Git repository for better project organization.
4.  **Thorough Testing**: Conduct comprehensive testing of all features.
5.  **Error Handling & Robustness**: Further improve error handling on both client and server sides.

This document was last updated on: 2025-06-05T18:44:39+08:00.
