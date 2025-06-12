import { useState, useEffect, type FormEvent } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuthStore } from "../../auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { KeyRound, Loader2, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/app/settings/change-password")({
    component: ChangePasswordComponent,
});

function ChangePasswordComponent() {
    const { isAuthenticated, changePassword, isLoadingPasswordChange } = useAuthStore();
    const navigate = useNavigate();
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const { t } = useTranslation();

    useEffect(() => {
        if (!isAuthenticated) {
            navigate({ to: "/login", replace: true });
        }
    }, [isAuthenticated, navigate]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);
        if (!oldPassword || !newPassword || !confirmPassword) {
            setError(t("change_password.all_required"));
            return;
        }
        if (newPassword !== confirmPassword) {
            setError(t("change_password.not_match"));
            return;
        }
        const result = await changePassword(oldPassword, newPassword);
        if (result.success) {
            setSuccessMessage(result.message || t("change_password.success"));
            setOldPassword("");
            setNewPassword("");
            setConfirmPassword("");
            if (result.message && result.message.includes(t("change_password.relogin"))) {
                setTimeout(() => navigate({ to: "/login", replace: true }), 3000);
            }
        } else {
            setError(result.error || t("change_password.failed"));
        }
    };

    return (
        <div className="container mx-auto py-8 flex flex-col items-center">
            <div className="w-full max-w-md mb-6">
                <Link
                    to="/app/dashboard"
                    className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
                >
                    <ArrowLeft />
                    {t("change_password.back")}
                </Link>
            </div>
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="flex items-center text-2xl">
                        <KeyRound className="mr-3 h-6 w-6 text-primary" /> {t("change_password.title")}
                    </CardTitle>
                    <CardDescription>{t("change_password.description")}</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="grid gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="oldPassword">{t("change_password.old")}</Label>
                            <Input
                                type="password"
                                id="oldPassword"
                                value={oldPassword}
                                onChange={e => setOldPassword(e.target.value)}
                                autoComplete="current-password"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="newPassword">{t("change_password.new")}</Label>
                            <Input
                                type="password"
                                id="newPassword"
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                                autoComplete="new-password"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="confirmPassword">{t("change_password.confirm")}</Label>
                            <Input
                                type="password"
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                autoComplete="new-password"
                                required
                            />
                        </div>
                        {error && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>{t("change_password.error")}</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                        {successMessage && (
                            <Alert
                                variant="default"
                                className="border-green-500 text-green-700 dark:border-green-600 dark:text-green-400"
                            >
                                <CheckCircle2 className="h-4 w-4 text-green-500 dark:text-green-400" />
                                <AlertTitle className="text-green-700 dark:text-green-500">
                                    {t("change_password.success_title")}
                                </AlertTitle>
                                <AlertDescription>{successMessage}</AlertDescription>
                            </Alert>
                        )}
                        <Button type="submit" className="w-full" disabled={isLoadingPasswordChange}>
                            {isLoadingPasswordChange ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t("change_password.changing")}
                                </>
                            ) : (
                                t("change_password.button")
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
