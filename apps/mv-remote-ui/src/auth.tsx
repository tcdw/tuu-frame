import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";

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

const API_BASE_URL = "http://localhost:3001/api"; // mv-player server
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
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username: user, password: pass }),
            });
            const data = await response.json();

            if (response.ok && data.data?.token) {
                localStorage.setItem(JWT_STORAGE_KEY, data.data.token);
                const decoded = parseJwt(data.data.token);
                setUsername(decoded?.username || null);
                setIsAuthenticated(true);
                setIsLoading(false);
                return { success: true };
            } else {
                setIsAuthenticated(false);
                setUsername(null);
                setIsLoading(false);
                return { success: false, error: data.err || "Login failed" };
            }
        } catch (error: any) {
            console.error("Login API error:", error);
            setIsAuthenticated(false);
            setUsername(null);
            setIsLoading(false);
            return { success: false, error: error.message || "Network error during login" };
        }
    };

    const logout = async (): Promise<void> => {
        setIsLoading(true);
        const token = localStorage.getItem(JWT_STORAGE_KEY);
        if (token) {
            try {
                const headers: HeadersInit = {};
                const currentToken = localStorage.getItem(JWT_STORAGE_KEY);
                if (currentToken) {
                    headers["Authorization"] = `Bearer ${currentToken}`;
                }
                await fetch(`${API_BASE_URL}/auth/logout`, {
                    method: "POST",
                    headers: headers,
                });
            } catch (error) {
                console.error("Logout API error:", error);
                // Still proceed with client-side logout even if API call fails
            }
        }
        localStorage.removeItem(JWT_STORAGE_KEY);
        setIsAuthenticated(false);
        setUsername(null);
        setIsLoading(false);
        navigate({ to: "/login" });
    };

    const changePassword = async (
        currentPassword: string,
        newPassword: string,
        newUsername?: string,
    ): Promise<{ success: boolean; error?: string; message?: string }> => {
        setIsLoading(true);
        const payload: { currentPassword: string; newPassword?: string; newUsername?: string } = { currentPassword };
        if (newPassword) payload.newPassword = newPassword;
        if (newUsername) payload.newUsername = newUsername;

        try {
            const headers: HeadersInit = { "Content-Type": "application/json" };
            const currentToken = localStorage.getItem(JWT_STORAGE_KEY);
            if (currentToken) {
                headers["Authorization"] = `Bearer ${currentToken}`;
            }
            const response = await fetch(`${API_BASE_URL}/auth/change-credentials`, {
                method: "POST",
                headers: headers,
                body: JSON.stringify(payload),
            });
            const data = await response.json();

            if (response.ok) {
                // If username changed, server asks to re-login, so clear local token.
                // If only password changed, server might return a new token.
                if (data.data?.message?.includes("Please log in again")) {
                    localStorage.removeItem(JWT_STORAGE_KEY);
                    setIsAuthenticated(false);
                    setUsername(null);
                } else if (data.data?.token) {
                    localStorage.setItem(JWT_STORAGE_KEY, data.data.token);
                    const decoded = parseJwt(data.data.token);
                    setUsername(decoded?.username || null); // Username might have changed if newUsername was also sent
                    setIsAuthenticated(true);
                }
                setIsLoading(false);
                return { success: true, message: data.data?.message };
            } else {
                setIsLoading(false);
                return { success: false, error: data.err || "Failed to change credentials" };
            }
        } catch (error: any) {
            console.error("Change credentials API error:", error);
            setIsLoading(false);
            return { success: false, error: error.message || "Network error during credential change" };
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
