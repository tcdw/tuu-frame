const API_BASE_URL = 'http://localhost:3001/api';

// Interface for Preset objects used within the UI (App.tsx)
// The API for GET /presets currently returns string[] (paths)
export interface UIPreset {
  path: string;
  name: string; // UI can derive name from path if not provided by API
}

/**
 * Fetches the list of preset paths from the server.
 * API returns: string[]
 */
export async function getPresets(): Promise<string[]> {
  const response = await fetch(`${API_BASE_URL}/presets`);
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch presets: ${response.statusText} - ${errorText}`);
  }
  return response.json();
}

/**
 * Adds a new preset path to the server.
 * API expects: { path: string }
 * API returns: { message: string; presets: string[] }
 */
export async function addPreset(path: string): Promise<{ message: string; presets: string[] }> {
  const response = await fetch(`${API_BASE_URL}/presets`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ path }),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Failed to add preset and parse error response' }));
    throw new Error(errorData.error || `Failed to add preset: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Deletes a preset path from the server.
 * API expects: { path: string }
 * API returns: { message: string; presets: string[] }
 */
export async function deletePreset(path: string): Promise<{ message: string; presets: string[] }> {
  const response = await fetch(`${API_BASE_URL}/presets`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ path }),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Failed to delete preset and parse error response' }));
    throw new Error(errorData.error || `Failed to delete preset: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Sets the active directory for playback on the server.
 * API expects: { path: string }
 * API returns: { message: string; videoCount: number }
 */
export async function setActiveDirectory(path: string): Promise<{ message: string; videoCount: number }> {
  const response = await fetch(`${API_BASE_URL}/set-active-directory`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ path }),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Failed to set active directory and parse error response' }));
    throw new Error(errorData.error || `Failed to set active directory: ${response.statusText}`);
  }
  return response.json();
}
