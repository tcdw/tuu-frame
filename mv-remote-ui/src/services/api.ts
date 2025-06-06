import axios, { AxiosError } from 'axios';
import * as ApiTypes from '../../../mv-player/src/shared-api-types';

const API_BASE_URL = 'http://localhost:3001/api';

// Create an axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
  try {
    const response = await apiClient.get<ApiTypes.PresetsListResponse>('/presets');
    const parsedResponse = response.data;

    if (parsedResponse.code !== 200) {
      throw new Error(parsedResponse.err || `Failed to get presets. API Code: ${parsedResponse.code}`);
    }
    if (parsedResponse.data === null) {
      throw new Error('Received null data for presets list.');
    }
    return parsedResponse.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{ err?: string }>;
      if (axiosError.response?.data?.err) {
        throw new Error(axiosError.response.data.err);
      }
      throw new Error(axiosError.message || 'Failed to get presets.');
    }
    throw error; // Re-throw other errors
  }
}

/**
 * Adds a new preset path to the server.
 * API expects: { path: string }
 * API returns: { message: string; presets: string[] }
 */
export async function addPreset(path: string): Promise<ApiTypes.PresetMutationSuccessData> {
  try {
    const response = await apiClient.post<ApiTypes.PresetMutationSuccessResponse>(
      '/presets',
      { path } as ApiTypes.AddPresetRequest
    );
    const parsedResponse = response.data;

    if (parsedResponse.code !== 200 && parsedResponse.code !== 201) {
      throw new Error(parsedResponse.err || `Failed to add preset. API Code: ${parsedResponse.code}`);
    }
    if (parsedResponse.data === null) {
      throw new Error('Received null data after adding preset.');
    }
    return parsedResponse.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{ err?: string }>;
      if (axiosError.response?.data?.err) {
        throw new Error(axiosError.response.data.err);
      }
      throw new Error(axiosError.message || 'Failed to add preset.');
    }
    throw error; // Re-throw other errors
  }
}

/**
 * Deletes a preset path from the server.
 * API expects: { path: string }
 * API returns: { message: string; presets: string[] }
 */
export async function deletePreset(path: string): Promise<ApiTypes.PresetMutationSuccessData> {
  try {
    // For DELETE requests with a body, axios expects data to be in the `data` property of the config object
    const response = await apiClient.delete<ApiTypes.PresetMutationSuccessResponse>(
      '/presets',
      { data: { path } as ApiTypes.DeletePresetRequest }
    );
    const parsedResponse = response.data;

    if (parsedResponse.code !== 200) {
      throw new Error(parsedResponse.err || `Failed to delete preset. API Code: ${parsedResponse.code}`);
    }
    if (parsedResponse.data === null) {
      throw new Error('Received null data after deleting preset.');
    }
    return parsedResponse.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{ err?: string }>;
      if (axiosError.response?.data?.err) {
        throw new Error(axiosError.response.data.err);
      }
      throw new Error(axiosError.message || 'Failed to delete preset.');
    }
    throw error; // Re-throw other errors
  }
}

/**
 * Sets the active directory for playback on the server.
 * API expects: { path: string }
 * API returns: { message: string; videoCount: number }
 */
export async function setActiveDirectory(path: string): Promise<ApiTypes.SetActiveDirectorySuccessData> {
  try {
    const response = await apiClient.post<ApiTypes.SetActiveDirectorySuccessResponse>(
      '/set-active-directory',
      { path } as ApiTypes.SetActiveDirectoryRequest
    );
    const parsedResponse = response.data;

    if (parsedResponse.code !== 200) {
      throw new Error(parsedResponse.err || `Failed to set active directory. API Code: ${parsedResponse.code}`);
    }
    if (parsedResponse.data === null) {
      throw new Error('Received null data after setting active directory.');
    }
    return parsedResponse.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{ err?: string }>;
      if (axiosError.response?.data?.err) {
        throw new Error(axiosError.response.data.err);
      }
      throw new Error(axiosError.message || 'Failed to set active directory.');
    }
    throw error; // Re-throw other errors
  }
}
