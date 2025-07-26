export interface ApiResponse<T> {
    code: number;
    data: T | null;
    err: string | null;
}
export interface PingData {
    message: "pong";
}
export type PingResponse = ApiResponse<PingData>;
export type PresetOrderType = "shuffle" | "normal" | string;
export interface PresetItem {
    id: string;
    path: string;
    order: PresetOrderType;
    name?: string;
}
export type PresetsListData = PresetItem[];
export type PresetsListResponse = ApiResponse<PresetsListData>;
export interface AddPresetRequest {
    path: string;
    order?: PresetOrderType;
    name?: string;
}
export interface PresetMutationSuccessData {
    presets: PresetItem[];
    message?: string;
}
export type PresetMutationSuccessResponse = ApiResponse<PresetMutationSuccessData>;
export interface DeletePresetRequest {
    id: string;
}
export interface SetActiveDirectoryRequest {
    path: string;
}
export interface SetActiveDirectorySuccessData {
    message: string;
    videoCount?: number;
}
export type SetActiveDirectorySuccessResponse = ApiResponse<SetActiveDirectorySuccessData>;
export interface PublicSaltData {
    publicSalt: string;
}
export type PublicSaltResponse = ApiResponse<PublicSaltData>;
export interface LoginRequest {
    username: string;
    password: string;
}
export interface ApiLoginPayload {
    username: string;
    clientHashedPassword: string;
}
export interface LoginSuccessData {
    token: string;
    message?: string;
}
export type LoginResponse = ApiResponse<LoginSuccessData>;
export interface DirectoryEntry {
    name: string;
    path: string;
    isDirectory: boolean;
}
export interface BrowseDirectoriesData {
    path: string;
    entries: DirectoryEntry[];
}
export type BrowseDirectoriesResponse = ApiResponse<BrowseDirectoriesData>;
export interface DriveEntry {
    name: string;
    path: string;
    isDirectory: boolean;
    label?: string;
}
export interface ListDrivesData {
    drives: DriveEntry[];
}
export type ListDrivesResponse = ApiResponse<ListDrivesData>;
export interface ChangeCredentialsRequest {
    currentPassword: string;
    newUsername?: string;
    newPassword?: string;
}
export interface ApiChangeCredentialsPayload {
    currentClientHashedPassword: string;
    newUsername?: string;
    newClientHashedPassword?: string;
}
export interface ChangeCredentialsSuccessData {
    message: string;
    token?: string;
}
export type ChangeCredentialsResponse = ApiResponse<ChangeCredentialsSuccessData>;
export interface PlayerStatusData {
    isPlaying: boolean;
}
export type PlayerStatusResponse = ApiResponse<PlayerStatusData>;
export interface PlayerControlSuccessData {
    message: string;
}
export type PlayerControlResponse = ApiResponse<PlayerControlSuccessData>;
export interface OsInfoData {
    isWindows: boolean;
}
export type OsInfoResponse = ApiResponse<OsInfoData>;
