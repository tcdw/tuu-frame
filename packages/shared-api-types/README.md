# @mtv/shared-api-types

Shared TypeScript type definitions for MTV applications API interfaces.

## Overview

This package contains all the shared API type definitions used across the MTV monorepo applications, including:

- `mv-player` - The main Electron application
- `mv-remote-ui` - The remote control web interface

## Usage

```typescript
import { ApiResponse, PresetItem, LoginRequest } from '@mtv/shared-api-types';
```

## Development

To build the package:

```bash
pnpm build
```

To watch for changes during development:

```bash
pnpm dev
```

## Type Categories

### Core Types
- `ApiResponse<T>` - Standard API response wrapper

### Authentication
- `LoginRequest`, `LoginResponse`
- `ChangeCredentialsRequest`, `ChangeCredentialsResponse`
- `PublicSaltData`, `PublicSaltResponse`

### Presets
- `PresetItem`, `PresetOrderType`
- `AddPresetRequest`, `DeletePresetRequest`
- `PresetsListData`, `PresetMutationSuccessData`

### Directory Management
- `SetActiveDirectoryRequest`, `SetActiveDirectorySuccessData`
- `DirectoryEntry`, `BrowseDirectoriesData`
- `DriveEntry`, `ListDrivesData`

### Player Control
- `PlayerStatusData`, `PlayerControlSuccessData`

### System Info
- `OsInfoData`