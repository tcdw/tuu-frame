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
