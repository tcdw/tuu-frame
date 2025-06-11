import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuthStore } from "../auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
    const navigate = useNavigate();
    const login = useAuthStore(state => state.login);
    const isLoadingLogin = useAuthStore(state => state.isLoadingLogin);

    const onSubmit: SubmitHandler<LoginFormInputs> = async (data: LoginFormInputs) => {
        setApiError(null);
        const result = await login(data.username, data.password);
        if (result.success) {
            navigate({ to: "/app/dashboard" });
        } else {
            setApiError(result.error || "Login failed. Please check your credentials.");
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-2xl">Login</CardTitle>
                    <CardDescription>Enter your username and password to access your account.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="username">Username</Label>
                            <Input
                                id="username"
                                type="text"
                                placeholder="your_username"
                                autoComplete="username"
                                {...register("username", { required: "Username is required" })}
                            />
                            {errors.username && <p className="text-sm text-destructive">{errors.username.message}</p>}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                autoComplete="current-password"
                                {...register("password", { required: "Password is required" })}
                            />
                            {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
                        </div>
                        {apiError && <p className="text-sm text-destructive">{apiError}</p>}
                        <Button type="submit" className="w-full" disabled={isLoadingLogin}>
                            {isLoadingLogin ? "Logging in..." : "Login"}
                        </Button>
                    </form>
                </CardContent>
                {/* <CardFooter>
                    <p className="text-xs text-muted-foreground">
                        New user? <a href="/register" className="underline">Sign up</a>
                    </p>
                </CardFooter> */}
            </Card>
        </div>
    );
}
