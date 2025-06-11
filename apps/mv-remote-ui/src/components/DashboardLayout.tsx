import { Link, useNavigate } from "@tanstack/react-router";
import { useAuthStore } from "../auth";
import { Button } from "@/components/ui/button";
import { KeyRound, LogOut } from "lucide-react";

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
    const logout = useAuthStore(state => state.logout);
    const username = useAuthStore(state => state.username);
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate({ to: "/login", replace: true });
    };

    return (
        <div className="min-h-screen flex flex-col items-center p-4 sm:p-6 lg:p-8 bg-background">
            <div className="w-full max-w-4xl">
                <header className="flex flex-col sm:flex-row justify-between items-center mb-8 pb-4 border-b">
                    <h1 className="text-3xl font-bold text-foreground mb-4 sm:mb-0">MV Player Remote</h1>
                    <div className="flex items-center space-x-2 sm:space-x-4">
                        {username && (
                            <p className="text-sm text-muted-foreground">
                                Welcome back, {username || "User"}! Manage your presets below.
                            </p>
                        )}
                        <Link to="/app/settings/change-password">
                            <Button variant="outline" size="sm">
                                <KeyRound className="mr-2 h-4 w-4" /> Change Password
                            </Button>
                        </Link>
                        <Button variant="outline" size="sm" onClick={handleLogout}>
                            <LogOut className="mr-2 h-4 w-4" /> Logout
                        </Button>
                    </div>
                </header>
                {children}
            </div>
        </div>
    );
}
