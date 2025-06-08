import * as ApiTypes from "../../../mv-player/src/shared-api-types";
import { apiClient } from "../utils/request";
import HmacSHA512 from "crypto-js/hmac-sha512";

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
export async function addPreset(presetData: Omit<ApiTypes.PresetItem, 'id'>): Promise<ApiTypes.PresetMutationSuccessData> {
    return apiClient.post<ApiTypes.ApiResponse<ApiTypes.PresetMutationSuccessData>, ApiTypes.PresetMutationSuccessData>(
        "/presets",
        presetData as ApiTypes.AddPresetRequest,
    );
}

/**
 * Deletes a preset path from the server.
 * API expects: { path: string }
 * API returns: { message: string; presets: string[] }
 */
export async function deletePreset(id: string): Promise<ApiTypes.PresetMutationSuccessData> {
    // For DELETE requests with a body, axios expects data to be in the `data` property of the config object
    return apiClient.delete<
        ApiTypes.ApiResponse<ApiTypes.PresetMutationSuccessData>,
        ApiTypes.PresetMutationSuccessData
    >("/presets", { data: { id } as ApiTypes.DeletePresetRequest });
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

// --- Authentication Related API Calls ---

async function getPublicSalt(): Promise<string> {
    const response = await apiClient.get<ApiTypes.PublicSaltResponse, ApiTypes.PublicSaltData>("/auth/public-salt");
    return response.publicSalt;
}

function clientSideHash(password: string, salt: string): string {
    return HmacSHA512(password, salt).toString();
}

export async function loginUser(credentials: ApiTypes.LoginRequest): Promise<ApiTypes.LoginSuccessData> {
    const publicSalt = await getPublicSalt();
    const clientHashedPassword = clientSideHash(credentials.password, publicSalt);

    const apiLoginPayload: ApiTypes.ApiLoginPayload = {
        username: credentials.username,
        clientHashedPassword: clientHashedPassword,
    };

    return apiClient.post<
        ApiTypes.LoginResponse, // This is ApiResponse<LoginSuccessData>
        ApiTypes.LoginSuccessData
    >("/auth/login", apiLoginPayload);
}

export async function changePasswordApi(payload: ApiTypes.ChangeCredentialsRequest): Promise<ApiTypes.ChangeCredentialsSuccessData> {
    const publicSalt = await getPublicSalt();

    const clientHashedCurrentPassword = clientSideHash(payload.currentPassword, publicSalt);
    let clientHashedNewPassword: string | undefined;
    if (payload.newPassword) {
        clientHashedNewPassword = clientSideHash(payload.newPassword, publicSalt);
    }

    const apiChangePasswordPayload: ApiTypes.ApiChangeCredentialsPayload = {
        currentClientHashedPassword: clientHashedCurrentPassword,
        newUsername: payload.newUsername,
        newClientHashedPassword: clientHashedNewPassword,
    };
    
    return apiClient.post<
        ApiTypes.ChangeCredentialsResponse, // This is ApiResponse<ChangeCredentialsSuccessData>
        ApiTypes.ChangeCredentialsSuccessData
    >("/auth/change-credentials", apiChangePasswordPayload);
}

// The existing setActiveDirectory function was here. It's defined earlier in the file now.

/**
 * Fetches directory listings from the server.
 * API expects optional query param: ?path=/some/path
 * API returns: DirectoryEntry[]
 */
export async function browseDirectories(currentPath?: string): Promise<ApiTypes.BrowseDirectoriesData> {
    const params = currentPath ? { path: currentPath } : {};
    return apiClient.get<ApiTypes.BrowseDirectoriesResponse, ApiTypes.BrowseDirectoriesData>("/browse-directories", { params });
}

// --- Player Control API Calls ---

/**
 * Sends a command to toggle play/pause on the player.
 */
export async function togglePlayPauseRemote(): Promise<ApiTypes.PlayerControlSuccessData> {
    return apiClient.post<
        ApiTypes.PlayerControlResponse, // This is ApiResponse<PlayerControlSuccessData>
        ApiTypes.PlayerControlSuccessData
    >("/player/toggle-play-pause");
}

/**
 * Sends a command to play the next track on the player.
 */
export async function nextTrackRemote(): Promise<ApiTypes.PlayerControlSuccessData> {
    return apiClient.post<
        ApiTypes.PlayerControlResponse, // This is ApiResponse<PlayerControlSuccessData>
        ApiTypes.PlayerControlSuccessData
    >("/player/next-track");
}

/**
 * Gets the current playback status from the player.
 */
export async function getPlayerStatus(): Promise<ApiTypes.PlayerStatusData> {
    return apiClient.get<ApiTypes.PlayerStatusResponse, ApiTypes.PlayerStatusData>("/player/status");
}
