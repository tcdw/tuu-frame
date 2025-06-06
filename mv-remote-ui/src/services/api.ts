import * as ApiTypes from '../../../mv-player/src/shared-api-types';

const API_BASE_URL = 'http://localhost:3001/api';

// Interface for Preset objects used within the UI (App.tsx)
// The API for GET /presets currently returns string[] (paths)
// Note: UIPreset can remain if it serves a UI-specific purpose distinct from raw API responses.
export interface UIPreset {
  path: string;
  name: string; // UI can derive name from path if not provided by API
}

/**
 * Fetches the list of preset paths from the server.
 * API returns: string[]
 */
export async function getPresets(): Promise<ApiTypes.PresetsListResponse> {
  const response = await fetch(`${API_BASE_URL}/presets`);
  if (!response.ok) {
    const errorText = await response.text();
        const errorJson: ApiTypes.ApiErrorResponse = { error: errorText || response.statusText };
    throw new Error(errorJson.error);
  }
  return response.json();
}

/**
 * Adds a new preset path to the server.
 * API expects: { path: string }
 * API returns: { message: string; presets: string[] }
 */
export async function addPreset(path: string): Promise<ApiTypes.PresetMutationSuccessResponse> {
  const response = await fetch(`${API_BASE_URL}/presets`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ path } as ApiTypes.AddPresetRequest),
  });
  if (!response.ok) {
        const errorJson: ApiTypes.ApiErrorResponse = await response.json().catch(() => ({ error: `HTTP error ${response.status} and failed to parse error response` }));
    throw new Error(errorJson.error || `Failed to add preset: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Deletes a preset path from the server.
 * API expects: { path: string }
 * API returns: { message: string; presets: string[] }
 */
export async function deletePreset(path: string): Promise<ApiTypes.PresetMutationSuccessResponse> {
  const response = await fetch(`${API_BASE_URL}/presets`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ path } as ApiTypes.DeletePresetRequest),
  });
  if (!response.ok) {
        const errorJson: ApiTypes.ApiErrorResponse = await response.json().catch(() => ({ error: `HTTP error ${response.status} and failed to parse error response` }));
    throw new Error(errorJson.error || `Failed to delete preset: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Sets the active directory for playback on the server.
 * API expects: { path: string }
 * API returns: { message: string; videoCount: number }
 */
export async function setActiveDirectory(path: string): Promise<ApiTypes.SetActiveDirectorySuccessResponse> {
  const response = await fetch(`${API_BASE_URL}/set-active-directory`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ path } as ApiTypes.SetActiveDirectoryRequest),
  });
  if (!response.ok) {
        const errorJson: ApiTypes.ApiErrorResponse = await response.json().catch(() => ({ error: `HTTP error ${response.status} and failed to parse error response` }));
    throw new Error(errorJson.error || `Failed to set active directory: ${response.statusText}`);
  }
  return response.json();
}
