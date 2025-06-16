import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuthStore } from "../auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";

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
    const { t } = useTranslation();

    const onSubmit: SubmitHandler<LoginFormInputs> = async (data: LoginFormInputs) => {
        setApiError(null);
        const result = await login(data.username, data.password);
        if (result.success) {
            navigate({ to: "/app/dashboard" });
        } else {
            setApiError(result.error || t("login.failed"));
        }
    };

    return (
        <div className="flex min-h-[100svh] items-center justify-center bg-background p-4">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-2xl">{t("login.title")}</CardTitle>
                    <CardDescription>{t("login.description")}</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="username">{t("login.username")}</Label>
                            <Input
                                id="username"
                                type="text"
                                placeholder={t("login.username_placeholder")}
                                autoComplete="username"
                                {...register("username", { required: t("login.username_required") })}
                            />
                            {errors.username && <p className="text-sm text-destructive">{errors.username.message}</p>}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">{t("login.password")}</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder={t("login.password_placeholder")}
                                autoComplete="current-password"
                                {...register("password", { required: t("login.password_required") })}
                            />
                            {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
                        </div>
                        {apiError && <p className="text-sm text-destructive">{apiError}</p>}
                        <Button type="submit" className="w-full" disabled={isLoadingLogin}>
                            {isLoadingLogin ? t("login.logging_in") : t("login.button")}
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
