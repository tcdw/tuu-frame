import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import * as api from "./services/api";
import type { LoginRequest, ChangeCredentialsRequest } from "../../mv-player/src/shared-api-types";

interface AuthContextType {
    isAuthenticated: boolean;
    username: string | null;
    login: (user: string, pass: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => Promise<void>;
    changePassword: (
        currentPassword: string,
        newPassword: string,
        newUsername?: string,
    ) => Promise<{ success: boolean; error?: string; message?: string }>;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split("")
                .map(function (c) {
                    return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
                })
                .join(""),
        );
        return JSON.parse(jsonPayload) as JwtPayload;
    } catch (e) {
        console.error("Failed to parse JWT", e);
        return null;
    }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [username, setUsername] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem(JWT_STORAGE_KEY);
        if (token) {
            const decoded = parseJwt(token);
            if (decoded && decoded.exp && decoded.exp * 1000 > Date.now()) {
                setUsername(decoded.username);
                setIsAuthenticated(true);
            } else {
                // Token exists but is invalid or expired
                localStorage.removeItem(JWT_STORAGE_KEY);
                setUsername(null);
                setIsAuthenticated(false);
            }
        }
        setIsLoading(false);
    }, []);

    const login = async (user: string, pass: string): Promise<{ success: boolean; error?: string }> => {
        setIsLoading(true);
        try {
            const loginPayload: LoginRequest = { username: user, password: pass };
            const data = await api.loginUser(loginPayload); // loginUser now returns LoginSuccessData or throws

            localStorage.setItem(JWT_STORAGE_KEY, data.token);
            const decoded = parseJwt(data.token);
            setUsername(decoded?.username || null);
            setIsAuthenticated(true);
            setIsLoading(false);
            return { success: true };
        } catch (error: any) {
            console.error("Login error in AuthProvider:", error);
            setIsAuthenticated(false);
            setUsername(null);
            setIsLoading(false);
            // error.message comes from apiClient's error handling
            return { success: false, error: error.message || "Login failed" };
        }
    };

    const logout = async (): Promise<void> => {
        setIsLoading(true);
        // Note: The actual API call for logout is best-effort.
        // If you have a specific api.logoutUser() function, you can call it here.
        // For now, we'll keep the client-side token removal as the primary mechanism.
        // Consider adding an api.logoutUser() in services/api.ts if server-side session invalidation is critical.
        try {
            const token = localStorage.getItem(JWT_STORAGE_KEY);
            if (token) {
                // Example: await api.logoutUser(); // If you implement this
                // For now, just logging out locally
            }
        } catch (error) {
            console.error("Logout API error (if implemented):", error);
        }
        localStorage.removeItem(JWT_STORAGE_KEY);
        setIsAuthenticated(false);
        setUsername(null);
        setIsLoading(false);
        navigate({ to: "/login" });
    };

    const changePassword = async (
        currentPassword: string,
        newPassword: string, // Kept as string, can be empty if not changing password
        newUsername?: string,
    ): Promise<{ success: boolean; error?: string; message?: string }> => {
        setIsLoading(true);

        const changePayload: ChangeCredentialsRequest = {
            currentPassword,
            ...(newPassword && { newPassword }), // Add if newPassword is not empty
            ...(newUsername && { newUsername }), // Add if newUsername is not empty
        };

        try {
            const data = await api.changePasswordApi(changePayload); // changePasswordApi returns ChangeCredentialsSuccessData

            // If username changed, server asks to re-login, so clear local token.
            // The server message 'Please log in again with your new credentials.' indicates username change.
            if (data.message?.includes("Please log in again")) {
                localStorage.removeItem(JWT_STORAGE_KEY);
                setIsAuthenticated(false);
                setUsername(null);
                // Optionally navigate to login: navigate({ to: "/login" });
            } else if (data.token) {
                // Token is returned if only password changed (username unchanged)
                localStorage.setItem(JWT_STORAGE_KEY, data.token);
                const decoded = parseJwt(data.token);
                // Username should be the same as before if only password changed,
                // but if newUsername was part of a successful non-re-login flow (server logic dependent),
                // this would update it.
                setUsername(decoded?.username || username); // Keep old username if token doesn't yield one
                setIsAuthenticated(true);
            } else {
                // If only username changed and server didn't ask to re-login (and no new token)
                // or if only password changed but server didn't issue a new token (unlikely for this setup)
                // We might need to re-fetch user info or re-evaluate state.
                // For now, assume if username changed, re-login is required.
                // If only password changed, a new token should be issued.
                // If newUsername was provided and successful, update local username state if not re-logging in.
                if (newUsername && !data.message?.includes("Please log in again")) {
                    setUsername(newUsername);
                }
            }
            setIsLoading(false);
            return { success: true, message: data.message };
        } catch (error: any) {
            console.error("Change credentials error in AuthProvider:", error);
            setIsLoading(false);
            return { success: false, error: error.message || "Failed to change credentials" };
        }
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, username, login, logout, changePassword, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
