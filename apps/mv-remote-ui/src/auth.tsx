import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";

interface AuthContextType {
    isAuthenticated: boolean;
    username: string | null;
    login: (user: string, pass: string) => Promise<boolean>;
    logout: () => void;
    changePassword: (user: string, oldPass: string, newPass: string) => Promise<boolean>;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = "mv_remote_auth";

interface StoredAuthData {
    username: string;
    passwordHash: string; // In a real app, this would be a proper hash
}

// Simple 'hashing' for example purposes. DO NOT USE IN PRODUCTION.
const simpleHash = (password: string) => `hashed_${password}`;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [username, setUsername] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        // Initialize or load stored credentials
        const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
        if (storedAuth) {
            try {
                const authData: StoredAuthData = JSON.parse(storedAuth);
                // For this example, we'll just assume if data exists, user was 'logged in'
                // A real app would verify a session token with a backend
                setUsername(authData.username);
                setIsAuthenticated(true);
            } catch (e) {
                console.error("Failed to parse auth data from localStorage", e);
                localStorage.removeItem(AUTH_STORAGE_KEY);
            }
        } else {
            // Initialize with default admin/admin if no data exists
            const defaultAuth: StoredAuthData = {
                username: "admin",
                passwordHash: simpleHash("admin"),
            };
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(defaultAuth));
        }
        setIsLoading(false);
    }, []);

    const login = async (user: string, pass: string): Promise<boolean> => {
        setIsLoading(true);
        const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
        if (storedAuth) {
            try {
                const authData: StoredAuthData = JSON.parse(storedAuth);
                if (authData.username === user && authData.passwordHash === simpleHash(pass)) {
                    setIsAuthenticated(true);
                    setUsername(user);
                    setIsLoading(false);
                    return true;
                }
            } catch (e) {
                console.error("Error during login", e);
            }
        }
        setIsAuthenticated(false);
        setUsername(null);
        setIsLoading(false);
        return false;
    };

    const logout = () => {
        setIsAuthenticated(false);
        setUsername(null);
        // In a real app, you'd also clear session tokens, etc.
        // For this example, we don't remove localStorage so login persists across refreshes if already logged in.
        // To truly log out and require re-login, you might navigate them to /login and clear auth state more thoroughly.
        navigate({ to: "/login" });
    };

    const changePassword = async (user: string, oldPass: string, newPass: string): Promise<boolean> => {
        setIsLoading(true);
        const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
        if (storedAuth) {
            try {
                const authData: StoredAuthData = JSON.parse(storedAuth);
                if (authData.username === user && authData.passwordHash === simpleHash(oldPass)) {
                    const updatedAuth: StoredAuthData = {
                        ...authData,
                        passwordHash: simpleHash(newPass),
                    };
                    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedAuth));
                    setIsLoading(false);
                    return true;
                }
            } catch (e) {
                console.error("Error changing password", e);
            }
        }
        setIsLoading(false);
        return false;
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
