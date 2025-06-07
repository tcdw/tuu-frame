import axios, { AxiosError, type AxiosResponse } from "axios";
import type { ApiResponse } from "../../../mv-player/src/shared-api-types";

export const API_BASE_URL = process.env.NODE_ENV === "development" ? "http://localhost:3001/api" : "/api";

// JWT storage key (should match the one in auth.tsx)
const JWT_STORAGE_KEY = "mv_remote_jwt_token";

// Create an axios instance
export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Add a request interceptor to include the JWT token
apiClient.interceptors.request.use(
    config => {
        const token = localStorage.getItem(JWT_STORAGE_KEY);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    },
);

// Add a response interceptor
apiClient.interceptors.response.use(
    // `response.data` is already parsed as JSON by axios.
    // The first generic to `AxiosResponse` here is the type of `response.data`.
    (response: AxiosResponse<ApiResponse<any>>) => {
        const apiResponse = response.data; // This is our ApiResponse<TData>

        // addPreset can return 201 for successful creation
        const isAddPresetSuccess =
            response.config.url === "/presets" && response.config.method === "post" && apiResponse.code === 201;

        if (apiResponse.code !== 200 && !isAddPresetSuccess) {
            throw new Error(
                apiResponse.err ||
                    `API Error: Code ${apiResponse.code} for ${response.config.method?.toUpperCase()} ${response.config.url}`,
            );
        }

        // The original code threw an error if data was null for all these endpoints.
        if (apiResponse.data === null) {
            throw new Error(
                `Received null data from API for ${response.config.method?.toUpperCase()} ${response.config.url}`,
            );
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
        throw new Error(error.message || "An unexpected API error occurred.");
    },
);
