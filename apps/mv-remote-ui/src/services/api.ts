import axios, { AxiosError, type AxiosResponse } from 'axios';
import * as ApiTypes from '../../../mv-player/src/shared-api-types';

const API_BASE_URL = 'http://localhost:3001/api';

// Define the generic API response structure
interface ApiResponse<TData> {
  code: number;
  data: TData | null; // Allow null as per existing logic, interceptor will check
  err?: string;
}

// Create an axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a response interceptor
apiClient.interceptors.response.use(
  // `response.data` is already parsed as JSON by axios.
  // The first generic to `AxiosResponse` here is the type of `response.data`.
  (response: AxiosResponse<ApiResponse<any>>) => {
    const apiResponse = response.data; // This is our ApiResponse<TData>

    // addPreset can return 201 for successful creation
    const isAddPresetSuccess =
      response.config.url === '/presets' &&
      response.config.method === 'post' &&
      apiResponse.code === 201;

    if (apiResponse.code !== 200 && !isAddPresetSuccess) {
      throw new Error(apiResponse.err || `API Error: Code ${apiResponse.code} for ${response.config.method?.toUpperCase()} ${response.config.url}`);
    }

    // The original code threw an error if data was null for all these endpoints.
    if (apiResponse.data === null) {
      throw new Error(`Received null data from API for ${response.config.method?.toUpperCase()} ${response.config.url}`);
    }

    return apiResponse.data; // Resolves the promise with the actual data payload
  },
  (error: AxiosError<{ err?: string }>) => {
    // Handle HTTP errors or network errors
    if (error.response && error.response.data && error.response.data.err) {
      // If the server sent a JSON response with an 'err' field
      throw new Error(error.response.data.err);
    }
    // Fallback to Axios error message or a generic one
    throw new Error(error.message || 'An unexpected API error occurred.');
  }
);


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
  // T (1st generic): type of response.data = ApiResponse<ApiTypes.PresetsListData>
  // R (2nd generic): type the promise resolves to = ApiTypes.PresetsListData
  return apiClient.get<ApiResponse<ApiTypes.PresetsListData>, ApiTypes.PresetsListData>('/presets');
}

/**
 * Adds a new preset path to the server.
 * API expects: { path: string }
 * API returns: { message: string; presets: string[] }
 */
export async function addPreset(path: string): Promise<ApiTypes.PresetMutationSuccessData> {
  return apiClient.post<ApiResponse<ApiTypes.PresetMutationSuccessData>, ApiTypes.PresetMutationSuccessData>(
    '/presets',
    { path } as ApiTypes.AddPresetRequest
  );
}

/**
 * Deletes a preset path from the server.
 * API expects: { path: string }
 * API returns: { message: string; presets: string[] }
 */
export async function deletePreset(path: string): Promise<ApiTypes.PresetMutationSuccessData> {
  // For DELETE requests with a body, axios expects data to be in the `data` property of the config object
  return apiClient.delete<ApiResponse<ApiTypes.PresetMutationSuccessData>, ApiTypes.PresetMutationSuccessData>(
    '/presets',
    { data: { path } as ApiTypes.DeletePresetRequest }
  );
}

/**
 * Sets the active directory for playback on the server.
 * API expects: { path: string }
 * API returns: { message: string; videoCount: number }
 */
export async function setActiveDirectory(path: string): Promise<ApiTypes.SetActiveDirectorySuccessData> {
  return apiClient.post<ApiResponse<ApiTypes.SetActiveDirectorySuccessData>, ApiTypes.SetActiveDirectorySuccessData>(
    '/set-active-directory',
    { path } as ApiTypes.SetActiveDirectoryRequest
  );
}
