# Project Overview: Local MV Player with Remote Control

## 1. Project Objective

To develop an Electron-based local music video (MV) player that supports playback from selected local directories. Accompanying this is a LAN-accessible web-based remote management interface to control playback and manage preset folders.

## 2. Core Components & Monorepo Structure

This project is structured as a **monorepo** managed by **Turborepo** and **pnpm workspaces**. This setup centralizes dependencies, streamlines build processes across different parts of the project, and facilitates better organization.

The monorepo contains two main applications, located within the `apps/` directory at the project root (`/Users/tcdw/Projects/mtv/`):

*   **`mv-player`**: The Electron application for local video playback. (Path: `apps/mv-player/`)
*   **`mv-remote-ui`**: A Vite + React + TypeScript web application for remote control. (Path: `apps/mv-remote-ui/`)

### Key Monorepo Files (at project root):
*   `package.json`: Defines root dependencies (like Turborepo), scripts for monorepo tasks (e.g., `pnpm dev`, `pnpm build`), and specifies `pnpm` as the package manager.
*   `pnpm-workspace.yaml`: Configures pnpm workspaces (e.g., `apps/*`, `packages/*`).
*   `turbo.json`: Configures Turborepo pipelines (tasks) for `build`, `lint`, `dev`, defining dependencies and caching.

## 3. `mv-player` (Electron Application)

Located in the `apps/mv-player/` directory within the monorepo.

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
*   **Renderer UI**: Vanilla TypeScript, HTML, CSS
*   **Build Tool**: Vite (orchestrated by Turborepo)
*   **Package Manager**: pnpm (via workspaces)

### Authentication System:

*   **Single-User Authentication**: Implements a robust single-user authentication system using JWT (JSON Web Tokens) for authorization and bcrypt for password hashing.
*   **Secure Endpoints**: All API endpoints (except for authentication routes) are protected and require a valid JWT.
*   **Credential Management**: Supports login, logout, and changing credentials (username/password).

### API Endpoints (on `http://localhost:3001`):

*   `GET /api/presets`: Retrieves the current list of preset folder paths.
*   `POST /api/presets`: Adds a new folder path to the presets. Expects `{"path": "/your/folder/path"}`.
*   `DELETE /api/presets`: Deletes a folder path from the presets. Expects `{"path": "/your/folder/path"}`.
*   `POST /api/set-active-directory`: Sets the currently active directory for playback. Expects `{"path": "/your/folder/path"}`. Triggers playlist update and random playback in the Electron app.
*   `POST /auth/login`: Authenticates the user. Expects `{"username": "user", "password": "pass"}`. Returns a JWT.
*   `POST /auth/logout`: Invalidates the user's session (currently a placeholder on the backend, primary effect is client-side token removal).
*   `POST /auth/change-credentials`: Allows changing username and/or password. Expects `{"currentPassword": "curr", "newPassword": "newP", "newUsername": "newU"}` (newPassword and newUsername are optional).

### Key Files:

*   `electron/main.ts`: Electron main process logic, Express server setup, API endpoint definitions, preset management, IPC handling.
*   `electron/functions.ts`: 放置常用的工具函数
*   `electron/server.ts`: 放置 HTTP 服务器的业务逻辑
*   `electron/preload.ts`: Exposes `window.electronAPI` to the renderer for secure IPC.
*   `src/app.ts`: Renderer process logic (video element control, event handling, IPC listeners).
*   `src/main.ts`: Entry point for the renderer process.
*   `index.html`: The HTML structure for the renderer window.
*   `vite.config.ts`: Vite build configuration.
*   `package.json`: Project dependencies and scripts.

## 4. `mv-remote-ui` (Web Remote Control)

Located in the `apps/mv-remote-ui/` directory within the monorepo.

### Key Features:

*   **Preset Management**: Remotely view, add, and delete preset folders by interacting with the `mv-player` API.
*   **Playback Control**: Remotely set the active playback directory for the `mv-player`.
*   **User Feedback**: Basic loading indicators and error messages.
*   **Real Authentication**: Fully integrated with the `mv-player` backend's authentication system. Handles login, logout, and password changes by making API calls and managing JWTs (stored in `localStorage`). All protected API calls from the UI now correctly include the JWT for authorization.
*   **Routing**: Uses TanStack Router for client-side routing, including protected routes.

### Technical Stack:

*   **Framework/Library**: React, TanStack Router
*   **Language**: TypeScript
*   **Build Tool**: Vite (orchestrated by Turborepo)
*   **Styling**: CSS
*   **State Management**: React Context (`AuthContext`)
*   **API Communication**: Axios
*   **Package Manager**: pnpm (via workspaces)

### Key Files:

*   `src/router.ts`: TanStack Router configuration and route tree definition.
*   `src/routes/`: Directory containing route components (e.g., `__root.tsx`, `login.tsx`, `dashboard.tsx`).
*   `src/auth.tsx`: `AuthContext` for authentication state management.
*   `src/services/api.ts`: Module for API communication with `mv-player`.
*   `vite.config.ts`: Vite build configuration, including TanStack Router plugin.
*   `package.json`: Project dependencies and scripts.

## 5. Current Status & Potential Next Steps

*   **Monorepo Transition**: The project has been successfully converted to a monorepo structure using Turborepo and pnpm workspaces. This enhances project organization, build efficiency, and dependency management.
*   **`mv-player`**: Core functionality for local video playback, API exposure, and a secure single-user authentication system (JWT/bcrypt) is in place. React was removed from its renderer for simplicity. A build issue related to `bcrypt` and `__dirname` in an ES module context has been resolved.
*   **`mv-remote-ui`**: Features preset management and playback directory control. It's fully integrated with `mv-player`'s real authentication system, handling login, logout, password changes, and JWT management for all API calls. Uses TanStack Router for navigation with protected routes.
*   **API Communication**: Functional between `mv-remote-ui` and `mv-player`.

### Potential Future Enhancements:

1.  **Enhance Remote UI (`mv-remote-ui`):**
    *   Display real-time playback status from `mv-player` (e.g., current video name, playing/paused state).
    *   Implement full playback controls (play, pause, next, previous, volume).
    *   Refine UI/UX, especially for user feedback related to the login system and API interactions. Consider replacing `localStorage` for auth in production.
2.  **`mv-player` Enhancements:**
    *   Implement recursive directory scanning for videos.
    *   Secure the API further if exposed beyond localhost, especially considering the remote UI interaction.
3.  **Shared Packages (Monorepo Advantage)**:
    *   Explore creating shared packages within the monorepo (e.g., in a `packages/` directory) for common types (e.g., API response structures), utility functions, or even UI components that could be used by both `mv-player` (if it reintroduces a more complex UI) and `mv-remote-ui`.
4.  **Testing**: Implement comprehensive unit and integration tests for both applications and their interaction, leveraging Turborepo's test pipeline. This includes testing authentication flows and API contracts.
5.  **Error Handling & Robustness**: Continue to improve error handling and system robustness across all components, including more detailed API error feedback to the UI.
6.  **Deployment/Distribution**: Define strategies for building and distributing the Electron app (`mv-player`) and deploying the web UI (`mv-remote-ui`).

This document was last updated on: 2025-06-07T17:50:20+08:00.
