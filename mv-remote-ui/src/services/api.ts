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
export async function getPresets(): Promise<ApiTypes.PresetsListData> {
  const response = await fetch(`${API_BASE_URL}/presets`);
  const parsedResponse: ApiTypes.PresetsListResponse = await response.json();

  if (!response.ok || parsedResponse.code !== 200) {
    throw new Error(parsedResponse.err || `Failed to get presets. Status: ${response.status}`);
  }
  if (parsedResponse.data === null) {
    throw new Error('Received null data for presets list.');
  }
  return parsedResponse.data;
}

/**
 * Adds a new preset path to the server.
 * API expects: { path: string }
 * API returns: { message: string; presets: string[] }
 */
export async function addPreset(path: string): Promise<ApiTypes.PresetMutationSuccessData> {
  const response = await fetch(`${API_BASE_URL}/presets`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ path } as ApiTypes.AddPresetRequest),
  });
  const parsedResponse: ApiTypes.PresetMutationSuccessResponse = await response.json();

  if (!response.ok || (parsedResponse.code !== 200 && parsedResponse.code !== 201)) {
    throw new Error(parsedResponse.err || `Failed to add preset. Status: ${response.status}`);
  }
  if (parsedResponse.data === null) {
    throw new Error('Received null data after adding preset.');
  }
  return parsedResponse.data;
}

/**
 * Deletes a preset path from the server.
 * API expects: { path: string }
 * API returns: { message: string; presets: string[] }
 */
export async function deletePreset(path: string): Promise<ApiTypes.PresetMutationSuccessData> {
  const response = await fetch(`${API_BASE_URL}/presets`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ path } as ApiTypes.DeletePresetRequest),
  });
  const parsedResponse: ApiTypes.PresetMutationSuccessResponse = await response.json();

  if (!response.ok || parsedResponse.code !== 200) {
    throw new Error(parsedResponse.err || `Failed to delete preset. Status: ${response.status}`);
  }
  if (parsedResponse.data === null) {
    throw new Error('Received null data after deleting preset.');
  }
  return parsedResponse.data;
}

/**
 * Sets the active directory for playback on the server.
 * API expects: { path: string }
 * API returns: { message: string; videoCount: number }
 */
export async function setActiveDirectory(path: string): Promise<ApiTypes.SetActiveDirectorySuccessData> {
  const response = await fetch(`${API_BASE_URL}/set-active-directory`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ path } as ApiTypes.SetActiveDirectoryRequest),
  });
  const parsedResponse: ApiTypes.SetActiveDirectorySuccessResponse = await response.json();

  if (!response.ok || parsedResponse.code !== 200) {
    throw new Error(parsedResponse.err || `Failed to set active directory. Status: ${response.status}`);
  }
  if (parsedResponse.data === null) {
    throw new Error('Received null data after setting active directory.');
  }
  return parsedResponse.data;
}
