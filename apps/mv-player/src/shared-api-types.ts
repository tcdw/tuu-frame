// Standard API Response Wrapper
export interface ApiResponse<T> {
    code: number; // HTTP status code or custom app status code
    data: T | null;
    err: string | null;
}

// The ApiErrorResponse is now implicitly handled by ApiResponse when err is not null.

// --- /api/ping ---
export interface PingData {
    message: "pong";
}
export type PingResponse = ApiResponse<PingData>;

// --- /api/presets ---
export type PresetsListData = string[];
export type PresetsListResponse = ApiResponse<PresetsListData>;

export interface AddPresetRequest {
    path: string;
}

export interface PresetMutationSuccessData {
    presets: string[];
    message?: string;
}
export type PresetMutationSuccessResponse = ApiResponse<PresetMutationSuccessData>;

export interface DeletePresetRequest {
    path: string;
}

// --- /api/set-active-directory ---
export interface SetActiveDirectoryRequest {
    path: string;
}

export interface SetActiveDirectorySuccessData {
    message: string;
    videoCount?: number;
}
export type SetActiveDirectorySuccessResponse = ApiResponse<SetActiveDirectorySuccessData>;

// The union types below are no longer needed as ApiResponse handles success/error states.
// export type PresetOperationResponse = PresetMutationSuccessResponse; // Now just ApiResponse<PresetMutationSuccessData>
// export type PresetsGetResponse = PresetsListResponse; // Now just ApiResponse<PresetsListData>
// export type SetActiveDirectoryResponse = SetActiveDirectorySuccessResponse; // Now just ApiResponse<SetActiveDirectorySuccessData>
