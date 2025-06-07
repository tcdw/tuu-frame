import * as ApiTypes from "../../../mv-player/src/shared-api-types";
import { apiClient } from "../utils/request";

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
    // T (1st generic): type of response.data = ApiTypes.ApiResponse<ApiTypes.PresetsListData>
    // R (2nd generic): type the promise resolves to = ApiTypes.PresetsListData
    return apiClient.get<ApiTypes.ApiResponse<ApiTypes.PresetsListData>, ApiTypes.PresetsListData>("/presets");
}

/**
 * Adds a new preset path to the server.
 * API expects: { path: string }
 * API returns: { message: string; presets: string[] }
 */
export async function addPreset(path: string): Promise<ApiTypes.PresetMutationSuccessData> {
    return apiClient.post<ApiTypes.ApiResponse<ApiTypes.PresetMutationSuccessData>, ApiTypes.PresetMutationSuccessData>(
        "/presets",
        { path } as ApiTypes.AddPresetRequest,
    );
}

/**
 * Deletes a preset path from the server.
 * API expects: { path: string }
 * API returns: { message: string; presets: string[] }
 */
export async function deletePreset(path: string): Promise<ApiTypes.PresetMutationSuccessData> {
    // For DELETE requests with a body, axios expects data to be in the `data` property of the config object
    return apiClient.delete<
        ApiTypes.ApiResponse<ApiTypes.PresetMutationSuccessData>,
        ApiTypes.PresetMutationSuccessData
    >("/presets", { data: { path } as ApiTypes.DeletePresetRequest });
}

/**
 * Sets the active directory for playback on the server.
 * API expects: { path: string }
 * API returns: { message: string; videoCount: number }
 */
export async function setActiveDirectory(path: string): Promise<ApiTypes.SetActiveDirectorySuccessData> {
    return apiClient.post<
        ApiTypes.ApiResponse<ApiTypes.SetActiveDirectorySuccessData>,
        ApiTypes.SetActiveDirectorySuccessData
    >("/set-active-directory", { path } as ApiTypes.SetActiveDirectoryRequest);
}
