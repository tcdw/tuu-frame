import { create } from "zustand";
import * as api from "./services/api";
import type { LoginRequest, ChangeCredentialsRequest } from "@mtv/shared-api-types";

const JWT_STORAGE_KEY = "mv_remote_jwt_token";

interface JwtPayload {
    username: string;
    iat?: number;
    exp?: number;
}

// Helper to parse JWT (client-side, for display purposes like username)
const parseJwt = (token: string): JwtPayload | null => {
    try {
        const base64Url = token.split(".")[1];
        if (!base64Url) {
            // Invalid token structure
            localStorage.removeItem(JWT_STORAGE_KEY);
            return null;
        }
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split("")
                .map(c => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                .join(""),
        );
        const payload = JSON.parse(jsonPayload) as JwtPayload;
        // Check for expiration
        if (payload.exp && payload.exp * 1000 < Date.now()) {
            console.warn("JWT token has expired");
            localStorage.removeItem(JWT_STORAGE_KEY);
            return null;
        }
        return payload;
    } catch (e) {
        console.error("Failed to parse JWT:", e);
        localStorage.removeItem(JWT_STORAGE_KEY); // Remove invalid/corrupted token
        return null;
    }
};

interface AuthState {
    isAuthenticated: boolean;
    username: string | null;
    isLoadingInitial: boolean; // For the very first load/token check
    isLoadingLogin: boolean;
    isLoadingPasswordChange: boolean;
}

interface AuthActions {
    initializeAuth: () => void;
    login: (user: string, pass: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => Promise<void>; // Navigation will be handled by the component
    changePassword: (
        currentPassword: string,
        newPassword: string,
        newUsername?: string,
    ) => Promise<{ success: boolean; error?: string; message?: string }>;
}

export const useAuthStore = create<AuthState & AuthActions>((set, get) => ({
    isAuthenticated: false,
    username: null,
    isLoadingInitial: true, // Start true, initializeAuth will set it to false
    isLoadingLogin: false,
    isLoadingPasswordChange: false,

    initializeAuth: () => {
        // No need to set isLoadingInitial to true here, it's true by default
        const token = localStorage.getItem(JWT_STORAGE_KEY);
        if (token) {
            const decoded = parseJwt(token); // parseJwt now handles expiration and removal
            if (decoded) {
                set({
                    isAuthenticated: true,
                    username: decoded.username,
                    isLoadingInitial: false,
                });
            } else {
                // Token was invalid or expired, parseJwt handled localStorage.removeItem
                set({
                    isAuthenticated: false,
                    username: null,
                    isLoadingInitial: false,
                });
            }
        } else {
            // No token found
            set({
                isAuthenticated: false,
                username: null,
                isLoadingInitial: false,
            });
        }
    },

    login: async (user, pass) => {
        set({ isLoadingLogin: true });
        try {
            const loginPayload: LoginRequest = { username: user, password: pass };
            const data = await api.loginUser(loginPayload);

            localStorage.setItem(JWT_STORAGE_KEY, data.token);
            const decoded = parseJwt(data.token);
            set({
                isAuthenticated: true,
                username: decoded?.username || null,
                isLoadingLogin: false,
            });
            return { success: true };
        } catch (error: any) {
            localStorage.removeItem(JWT_STORAGE_KEY); // Ensure token is cleared on failed login
            set({
                isAuthenticated: false,
                username: null,
                isLoadingLogin: false,
            });
            return { success: false, error: error.message || "Login failed" };
        }
    },

    logout: async () => {
        // No specific loading state for logout in original, can add if needed
        localStorage.removeItem(JWT_STORAGE_KEY);
        set({
            isAuthenticated: false,
            username: null,
            // Optionally reset other states like isLoadingLogin: false, etc.
        });
        // Navigation is handled by the component calling this action.
    },

    changePassword: async (currentPassword, newPassword, newUsername) => {
        set({ isLoadingPasswordChange: true });
        const changePayload: ChangeCredentialsRequest = {
            currentPassword,
            ...(newPassword && { newPassword }),
            ...(newUsername && { newUsername }),
        };

        try {
            const data = await api.changePasswordApi(changePayload);
            let newAuthPartialState: Partial<Pick<AuthState, "isAuthenticated" | "username">> = {};

            if (data.message?.includes("Please log in again")) {
                localStorage.removeItem(JWT_STORAGE_KEY);
                newAuthPartialState = { isAuthenticated: false, username: null };
            } else if (data.token) {
                localStorage.setItem(JWT_STORAGE_KEY, data.token);
                const decoded = parseJwt(data.token);
                newAuthPartialState = {
                    isAuthenticated: true,
                    username: decoded?.username || get().username, // Keep old username if token doesn't yield one
                };
            } else {
                // This case handles if only username changed and server didn't force re-login / issue new token.
                // Or if password changed but server didn't issue new token (less likely).
                if (newUsername && !data.message?.includes("Please log in again")) {
                    newAuthPartialState = { username: newUsername }; // Update username if it changed and no re-login needed
                }
            }
            set({ ...newAuthPartialState, isLoadingPasswordChange: false });
            return { success: true, message: data.message };
        } catch (error: any) {
            set({ isLoadingPasswordChange: false });
            return { success: false, error: error.message || "Failed to change credentials" };
        }
    },
}));

// How to initialize:
// In your main app component (e.g., RootComponent in __root.tsx), call initializeAuth:
//
// import { useEffect } from 'react';
// import { useAuthStore } from './auth'; // Adjust path as needed
//
// export function RootComponent() {
//   const initializeAuth = useAuthStore((state) => state.initializeAuth);
//   const isLoadingInitial = useAuthStore((state) => state.isLoadingInitial);
//
//   useEffect(() => {
//     initializeAuth();
//   }, [initializeAuth]);
//
//   if (isLoadingInitial) {
//     return <div>Loading authentication...</div>; // Or your app shell/spinner
//   }
//
//   return (
//     <>
//       {/* ... rest of your root component, e.g., <Outlet /> ... */}
//     </>
//   );
// }
