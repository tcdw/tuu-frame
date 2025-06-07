import { useState } from "react";
import type { FormEvent } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuth } from "../auth";

export const Route = createFileRoute("/login")({
    component: LoginComponent,
});

function LoginComponent() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const auth = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!username || !password) {
            setError("Please enter both username and password.");
            return;
        }
        const result = await auth.login(username, password);
        if (result.success) {
            navigate({ to: "/dashboard" });
        } else {
            setError(result.error || "Login failed. Please check your credentials.");
        }
    };

    return (
        <div
            className="container"
            style={{
                maxWidth: "400px",
                margin: "50px auto",
                padding: "20px",
                border: "1px solid #ccc",
                borderRadius: "8px",
            }}
        >
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: "15px" }}>
                    <label htmlFor="username" style={{ display: "block", marginBottom: "5px" }}>
                        Username
                    </label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
                        autoComplete="username"
                    />
                </div>
                <div style={{ marginBottom: "15px" }}>
                    <label htmlFor="password" style={{ display: "block", marginBottom: "5px" }}>
                        Password
                    </label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
                        autoComplete="current-password"
                    />
                </div>
                {error && <p style={{ color: "red", marginBottom: "15px" }}>{error}</p>}
                <button
                    type="submit"
                    disabled={auth.isLoading}
                    style={{
                        width: "100%",
                        padding: "10px",
                        backgroundColor: "#007bff",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                    }}
                >
                    {auth.isLoading ? "Logging in..." : "Login"}
                </button>
            </form>
        </div>
    );
}
