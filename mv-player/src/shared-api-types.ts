// General Error Response structure that can be used by API endpoints
export interface ApiErrorResponse {
  error: string;
}

// --- /api/ping ---
export interface PingResponse {
  message: 'pong';
}

// --- /api/presets ---
export type PresetsListResponse = string[];

export interface AddPresetRequest {
  path: string;
}
// Successful response for adding/deleting a preset includes the updated list
export interface PresetMutationSuccessResponse {
  presets: string[];
  message?: string;
}

export interface DeletePresetRequest {
  path: string;
}

// --- /api/set-active-directory ---
export interface SetActiveDirectoryRequest {
  path: string;
}

// Successful response for setting active directory
export interface SetActiveDirectorySuccessResponse {
  message: string;
  videoCount?: number;
}

// Union type for common successful preset operations, useful for client-side handling
export type PresetOperationResponse = PresetMutationSuccessResponse | ApiErrorResponse;
export type PresetsGetResponse = PresetsListResponse | ApiErrorResponse;
export type SetActiveDirectoryResponse = SetActiveDirectorySuccessResponse | ApiErrorResponse;
