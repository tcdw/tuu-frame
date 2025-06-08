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

// Defines the possible order types for a preset. Extensible.
export type PresetOrderType = "shuffle" | "normal" | string;

export interface PresetItem {
    id: string;          // Unique identifier for the preset
    mainPath: string;    // The main directory path for this preset
    order: PresetOrderType; // Playback order (e.g., shuffle, normal)
    name?: string;       // Optional user-defined name for the preset
    // Add other future properties here, e.g.:
    // includeSubfolders?: boolean;
    // lastPlayed?: string; // ISO date string
    // createdAt?: string; // ISO date string
}

export type PresetsListData = PresetItem[];
export type PresetsListResponse = ApiResponse<PresetsListData>;

export interface AddPresetRequest {
    mainPath: string;
    order?: PresetOrderType;
    name?: string;
}

export interface PresetMutationSuccessData {
    presets: PresetItem[];
    message?: string;
}
export type PresetMutationSuccessResponse = ApiResponse<PresetMutationSuccessData>;

export interface DeletePresetRequest {
    id: string; // Use ID for deletion
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

// --- /api/auth/public-salt ---
export interface PublicSaltData {
    publicSalt: string;
}
export type PublicSaltResponse = ApiResponse<PublicSaltData>;

// --- /api/auth/login ---
// This is what the UI form will produce (plaintext password)
export interface LoginRequest {
    username: string;
    password: string; // Plaintext, will be hashed on client
}

// This is what the client sends to the /api/auth/login endpoint
export interface ApiLoginPayload {
    username: string;
    clientHashedPassword: string;
}

export interface LoginSuccessData {
    token: string;
    message?: string;
}
export type LoginResponse = ApiResponse<LoginSuccessData>;

// --- /api/auth/change-credentials ---
// This is what the UI form will produce (plaintext passwords)
export interface ChangeCredentialsRequest {
    currentPassword: string; // Plaintext
    newUsername?: string;
    newPassword?: string;    // Plaintext
}

// This is what the client sends to the /api/auth/change-credentials endpoint
export interface ApiChangeCredentialsPayload {
    currentClientHashedPassword: string;
    newUsername?: string;
    newClientHashedPassword?: string;
}

export interface ChangeCredentialsSuccessData {
    message: string;
    token?: string; // Token is returned if username didn't change but password did
}
export type ChangeCredentialsResponse = ApiResponse<ChangeCredentialsSuccessData>;
