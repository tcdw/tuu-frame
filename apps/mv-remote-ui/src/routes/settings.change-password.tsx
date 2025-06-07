import { useState, useEffect, type FormEvent } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuth } from "../auth";

export const Route = createFileRoute("/settings/change-password")({
    component: ChangePasswordComponent,
});

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { KeyRound, Loader2, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";
import { Link } from "@tanstack/react-router";

function ChangePasswordComponent() {
    const auth = useAuth();
    const navigate = useNavigate();
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        if (!auth.isLoading && !auth.isAuthenticated) {
            navigate({ to: "/login", replace: true });
        }
    }, [auth.isLoading, auth.isAuthenticated, navigate]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);

        if (!oldPassword || !newPassword || !confirmPassword) {
            setError("All fields are required.");
            return;
        }
        if (newPassword !== confirmPassword) {
            setError("New passwords do not match.");
            return;
        }
        const result = await auth.changePassword(oldPassword, newPassword);

        if (result.success) {
            setSuccessMessage(result.message || "Password changed successfully!");
            setOldPassword("");
            setNewPassword("");
            setConfirmPassword("");
            if (result.message && result.message.includes("Please log in again")) {
                setTimeout(() => navigate({ to: "/login", replace: true }), 3000);
            }
        } else {
            setError(result.error || "Failed to change password. Please check your details.");
        }
    };

    if (auth.isLoading && !auth.isAuthenticated) {
        // Show loader only if not yet authenticated but loading
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    if (!auth.isAuthenticated && !auth.isLoading) {
        return null; // Should be redirected by useEffect
    }

    return (
        <div className="container mx-auto py-8 flex flex-col items-center">
            <div className="w-full max-w-md mb-6">
                <Link
                    to="/dashboard"
                    className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Dashboard
                </Link>
            </div>
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="flex items-center text-2xl">
                        <KeyRound className="mr-3 h-6 w-6 text-primary" /> Change Password
                    </CardTitle>
                    <CardDescription>Update your password below. Make sure it's a strong one!</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="grid gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="oldPassword">Old Password</Label>
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
                            <Label htmlFor="newPassword">New Password</Label>
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
                            <Label htmlFor="confirmPassword">Confirm New Password</Label>
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
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                        {successMessage && (
                            <Alert
                                variant="default"
                                className="border-green-500 text-green-700 dark:border-green-600 dark:text-green-400"
                            >
                                <CheckCircle2 className="h-4 w-4 text-green-500 dark:text-green-400" />
                                <AlertTitle className="text-green-700 dark:text-green-500">Success</AlertTitle>
                                <AlertDescription>{successMessage}</AlertDescription>
                            </Alert>
                        )}
                        <Button type="submit" className="w-full" disabled={auth.isLoadingPasswordChange}>
                            {" "}
                            {/* Assuming isLoadingPasswordChange from AuthContext */}
                            {auth.isLoadingPasswordChange ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Changing...
                                </>
                            ) : (
                                "Change Password"
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
