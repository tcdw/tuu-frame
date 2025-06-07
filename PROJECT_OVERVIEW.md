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

### Key Features & UI Serving:

*   **Dual UI Architecture**:
    *   **`mv-player` Main UI**: The Electron window loads `mv-player`'s own interface. In development, this is served by its Vite dev server (e.g., `http://localhost:5173`). In production, it's loaded from the packaged `dist/index.html` file.
    *   **`mv-remote-ui` Web Interface**: Served by an embedded Express.js server (see below) from the `remote-ui-assets/` directory (which contains the build output of the `mv-remote-ui` application). This makes the remote control panel accessible via a web browser on the local network.
*   **Embedded Express.js Server & API**: Runs within the Electron main process on port `15678` (binding to `0.0.0.0` for LAN accessibility).
    *   **Serves `mv-remote-ui`**: Provides the static assets for the remote control web interface.
    *   **Provides Backend API**: Exposes endpoints for remote management (presets, playback control, authentication).
    *   **Conditional CORS**: Implements a strict CORS policy. In development (`process.env.NODE_ENV === 'development'`), it allows wildcard origins (`*`) for flexibility with tools like Vite's dev server. In production, explicit CORS headers are omitted, relying on same-origin browser behavior as both the API and remote UI are served from the same host and port (`http://<local-ip>:15678`).
    *   *(Future Enhancement: IP CIDR restriction planned for enhanced security on the LAN-exposed server).*
*   **Local Video Playback**: Plays video files (e.g., .mp4, .mkv, .webm) from user-specified directories.
*   **Random Playback**: Automatically plays videos in a random order from the active directory. Continuous playback upon video end.
*   **Custom Protocol**: Uses `mv-stream://` custom protocol to securely serve local video files to the renderer, allowing `webSecurity` to remain enabled.
*   **Preset Folder Management**: Allows saving and loading lists of preset directories. Presets are stored in a JSON file (`presets.json`) within the Electron app's user data directory.
*   **IPC Communication**: Uses Electron's IPC to communicate between the main process (API, file system logic) and the renderer process (UI updates).

### Technical Stack:

*   **Framework**: Electron
*   **Language**: TypeScript
*   **Backend API**: Express.js (embedded)
*   **Renderer UI**: Vanilla TypeScript, HTML, CSS
*   **Build Tool**: Vite (orchestrated by Turborepo)
*   **Package Manager**: pnpm (via workspaces)

### Authentication System:

*   **Enhanced Single-User Authentication**: Implements a robust single-user authentication system featuring:
    *   **Client-Side Hashing**: Passwords are first hashed on the client-side (`mv-remote-ui`) using HMAC-SHA512 with a server-provided public salt (obtained from `/api/auth/public-salt`).
    *   **Server-Side Hashing**: The client-hashed password is then further hashed on the server-side using bcrypt.
    *   **JWT (JSON Web Tokens)**: Used for authorization.
*   **Secure Endpoints**: All API endpoints (except for authentication and public salt routes) are protected and require a valid JWT.
*   **Credential Management**: Supports login, logout, and changing credentials (username/password) with the enhanced hashing scheme.

### API Endpoints (on `http://localhost:15678`):

*   `GET /api/presets`: Retrieves the current list of preset folder paths.
*   `POST /api/presets`: Adds a new folder path to the presets. Expects `{"path": "/your/folder/path"}`.
*   `DELETE /api/presets`: Deletes a folder path from the presets. Expects `{"path": "/your/folder/path"}`.
*   `POST /api/set-active-directory`: Sets the currently active directory for playback. Expects `{"path": "/your/folder/path"}`. Triggers playlist update and random playback in the Electron app.
*   `GET /api/auth/public-salt`: Retrieves the public salt required for client-side password hashing.
*   `POST /api/auth/login`: Authenticates the user. Expects `{"username": "user", "clientHashedPassword": "hashedPass"}`. Returns a JWT.
*   `POST /api/auth/logout`: Invalidates the user's session (currently a placeholder on the backend, primary effect is client-side token removal).
*   `POST /api/auth/change-credentials`: Allows changing username and/or password. Expects `{"currentClientHashedPassword": "currHashed", "newClientHashedPassword": "newHashedP", "newUsername": "newU"}` (newClientHashedPassword and newUsername are optional).

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
*   `electron-builder.json5`: Configuration for `electron-builder`, specifying how the application is packaged, including assets like `dist/` (player UI), `dist-electron/` (main/preload scripts), and `remote-ui-assets/` (remote UI assets).

## 4. `mv-remote-ui` (Web Remote Control)

Located in the `apps/mv-remote-ui/` directory within the monorepo.

### Key Features:

*   **Preset Management**: Remotely view, add, and delete preset folders by interacting with the `mv-player` API.
*   **Playback Control**: Remotely set the active playback directory for the `mv-player`.
*   **User Feedback**: Basic loading indicators and error messages.
*   **Real Authentication with Client-Side Hashing**: Fully integrated with the `mv-player` backend's enhanced authentication system.
    *   Performs client-side HMAC-SHA512 hashing of passwords using a server-provided public salt before sending credentials.
    *   Handles login, logout, and password changes by making API calls (using client-hashed passwords) and managing JWTs (stored in `localStorage`).
    *   All protected API calls from the UI correctly include the JWT for authorization.
*   **Routing**: Uses TanStack Router for client-side routing, including protected routes.

### Technical Stack:

*   **Framework/Library**: React, TanStack Router
*   **Language**: TypeScript
*   **Build Tool**: Vite (orchestrated by Turborepo)
*   **Styling**: Tailwind CSS v4, shadcn/ui
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

## 5. Current Status & Next Steps

*   **Monorepo Transition**: The project has been successfully converted to a monorepo structure using Turborepo and pnpm workspaces. This enhances project organization, build efficiency, and dependency management.
*   **`mv-player` & `mv-remote-ui` Integration**: The system is now fully functional with `mv-player` serving its own UI in the Electron window and simultaneously serving the `mv-remote-ui` via an embedded Express server on port `15678` (accessible on the LAN). This setup works correctly in both development (Vite dev servers, flexible CORS) and production (packaged assets, stricter same-origin policy for Express server). Packaging via `electron-builder` (configured in `electron-builder.json5`) correctly includes all necessary assets (`mv-player`'s `dist/`, `dist-electron/`, and `remote-ui-assets/`).
*   **Authentication**: Enhanced single-user authentication is implemented. This includes client-side HMAC-SHA512 password hashing (using a server-provided public salt) in `mv-remote-ui` before transmission, followed by server-side bcrypt hashing in `mv-player`. JWTs are used for API authorization.
*   **Monorepo Structure**: Successfully managed by Turborepo and pnpm workspaces.

### Potential Future Enhancements:

1.  **Enhance Remote UI (`mv-remote-ui`):**
    *   Display real-time playback status from `mv-player` (e.g., current video name, playing/paused state).
    *   Implement full playback controls (play, pause, next, previous, volume).
    *   Refine UI/UX, especially for user feedback related to the login system and API interactions. Consider replacing `localStorage` for auth in production.
2.  **`mv-player` Enhancements:**
    *   Implement recursive directory scanning for videos.
    *   Implement IP CIDR restrictions for the Express server to enhance security for LAN access.
    *   Secure the API further if exposed beyond the local network, especially considering the remote UI interaction.
3.  **Shared Packages (Monorepo Advantage)**:
    *   Explore creating shared packages within the monorepo (e.g., in a `packages/` directory) for common types (e.g., API response structures), utility functions, or even UI components that could be used by both `mv-player` (if it reintroduces a more complex UI) and `mv-remote-ui`.
4.  **Testing**: Implement comprehensive unit and integration tests for both applications and their interaction, leveraging Turborepo's test pipeline. This includes testing authentication flows and API contracts.
5.  **Error Handling & Robustness**: Continue to improve error handling and system robustness across all components, including more detailed API error feedback to the UI.
6.  **Deployment/Distribution**: Define strategies for building and distributing the Electron app (`mv-player`) and deploying the web UI (`mv-remote-ui`).

This document was last updated on: 2025-06-08T00:55:04+08:00.
