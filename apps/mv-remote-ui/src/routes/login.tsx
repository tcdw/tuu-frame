import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuth } from "../auth";

export const Route = createFileRoute("/login")({
    component: LoginComponent,
});

interface LoginFormInputs {
    username: string;
    password: string;
}

function LoginComponent() {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormInputs>();
    const [apiError, setApiError] = useState<string | null>(null);
    const auth = useAuth();
    const navigate = useNavigate();

    const onSubmit: SubmitHandler<LoginFormInputs> = async data => {
        setApiError(null);
        // Validation is now handled by react-hook-form, so direct checks for username/password are not needed here unless for extra logic.
        const result = await auth.login(data.username, data.password);
        if (result.success) {
            navigate({ to: "/dashboard" });
        } else {
            setApiError(result.error || "Login failed. Please check your credentials.");
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
            <form onSubmit={handleSubmit(onSubmit)}>
                <div style={{ marginBottom: "15px" }}>
                    <label htmlFor="username" style={{ display: "block", marginBottom: "5px" }}>
                        Username
                    </label>
                    <input
                        type="text"
                        id="username"
                        {...register("username", { required: "Username is required" })}
                        style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
                        autoComplete="username"
                    />
                    {errors.username && (
                        <p style={{ color: "red", marginTop: "5px", marginBottom: "0px" }}>{errors.username.message}</p>
                    )}
                </div>
                <div style={{ marginBottom: "15px" }}>
                    <label htmlFor="password" style={{ display: "block", marginBottom: "5px" }}>
                        Password
                    </label>
                    <input
                        type="password"
                        id="password"
                        {...register("password", { required: "Password is required" })}
                        style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
                        autoComplete="current-password"
                    />
                    {errors.password && (
                        <p style={{ color: "red", marginTop: "5px", marginBottom: "0px" }}>{errors.password.message}</p>
                    )}
                </div>
                {apiError && <p style={{ color: "red", marginBottom: "15px" }}>{apiError}</p>}
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
