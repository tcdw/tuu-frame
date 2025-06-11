import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useAuthStore } from "../auth";
import { Button } from "@/components/ui/button";
import { KeyRound, LogOut, Menu as MenuIcon, X as CloseIcon } from "lucide-react";

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
    const logout = useAuthStore(state => state.logout);
    const username = useAuthStore(state => state.username);
    const navigate = useNavigate();
    const [drawerOpen, setDrawerOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate({ to: "/login", replace: true });
    };

    return (
        <div className="min-h-screen flex flex-col items-center p-4 sm:p-6 lg:p-8 bg-background">
            <div className="w-full max-w-4xl">
                <header className="flex justify-between items-center mb-8 pb-4 border-b">
                    <h1 className="text-3xl font-bold text-foreground">MV Player Remote</h1>
                    {/* 桌面端按钮组 */}
                    <div className="hidden sm:flex items-center space-x-4">
                        <Link to="/app/settings/change-password">
                            <Button variant="outline" size="sm">
                                <KeyRound className="mr-2 h-4 w-4" /> 修改密码
                            </Button>
                        </Link>
                        <Button variant="outline" size="sm" onClick={handleLogout}>
                            <LogOut className="mr-2 h-4 w-4" /> 退出
                        </Button>
                    </div>
                    {/* 移动端汉堡菜单 */}
                    <div className="sm:hidden">
                        <Button variant="outline" size="icon" onClick={() => setDrawerOpen(true)} aria-label="菜单">
                            <MenuIcon className="h-5 w-5" />
                        </Button>
                        {/* 抽屉菜单 */}
                        {drawerOpen && (
                            <div
                                className="fixed inset-0 z-50 bg-black/40 flex justify-end"
                                onClick={() => setDrawerOpen(false)}
                            >
                                <div
                                    className="bg-white dark:bg-background w-64 h-full shadow-lg p-6 flex flex-col"
                                    onClick={e => e.stopPropagation()}
                                >
                                    <div className="flex items-center justify-between mb-6">
                                        <span className="font-bold text-lg">菜单</span>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setDrawerOpen(false)}
                                            aria-label="关闭"
                                        >
                                            <CloseIcon className="h-5 w-5" />
                                        </Button>
                                    </div>
                                    <div className="flex flex-col gap-4">
                                        {username && (
                                            <div className="text-sm text-muted-foreground mb-2">{username}</div>
                                        )}
                                        <Link to="/app/settings/change-password" onClick={() => setDrawerOpen(false)}>
                                            <Button variant="outline" className="w-full justify-start">
                                                <KeyRound className="mr-2 h-4 w-4" /> 修改密码
                                            </Button>
                                        </Link>
                                        <Button
                                            variant="outline"
                                            className="w-full justify-start"
                                            onClick={async () => {
                                                setDrawerOpen(false);
                                                await handleLogout();
                                            }}
                                        >
                                            <LogOut className="mr-2 h-4 w-4" /> 退出
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </header>
                {children}
            </div>
        </div>
    );
}
