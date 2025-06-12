import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useAuthStore } from "../auth";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Menu as MenuIcon, LogOut, KeyRound, Monitor, Home, User, X as CloseIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select";

interface DashboardLayoutProps {
    children: React.ReactNode;
    pageTitle?: string;
}

export function DashboardLayout({ children, pageTitle = "仪表盘" }: DashboardLayoutProps) {
    const logout = useAuthStore(state => state.logout);
    const username = useAuthStore(state => state.username);
    const navigate = useNavigate();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const { t, i18n } = useTranslation();

    const NAV_ITEMS = [
        { label: t("nav.dashboard"), icon: Home, to: "/app/dashboard", group: t("nav.group_navigation") },
        { label: t("nav.monitor"), icon: Monitor, to: "/app/monitor", group: t("nav.group_navigation") },
        {
            label: t("nav.change_password"),
            icon: KeyRound,
            to: "/app/settings/change-password",
            group: t("nav.group_settings"),
        },
    ];

    const handleLogout = async () => {
        await logout();
        navigate({ to: "/login", replace: true });
    };

    // 分组导航
    const navGroups = Array.from(new Set(NAV_ITEMS.map(i => i.group)));

    const Sidebar = (
        <aside className="flex flex-col h-full w-64 border-r bg-card text-card-foreground px-4 py-6">
            {/* Logo 区域 */}
            <div className="flex items-center h-12 font-bold text-lg px-2 mb-8 tracking-tight select-none">
                <span className="rounded bg-primary/10 px-2 py-1 mr-2 text-primary">MV</span> {t("nav.mv_player")}
            </div>
            <nav className="flex-1 flex flex-col gap-2">
                {navGroups.map(group => (
                    <div key={group} className="mb-2">
                        <div className="text-xs text-muted-foreground px-2 mb-1 mt-4 first:mt-0">{group}</div>
                        <div className="flex flex-col gap-1">
                            {NAV_ITEMS.filter(i => i.group === group).map(item => (
                                <Link
                                    to={item.to}
                                    className="w-full"
                                    activeOptions={{ exact: true }}
                                    activeProps={{ className: "bg-secondary text-secondary-foreground" }}
                                >
                                    {({ isActive }) => (
                                        <Button
                                            variant="ghost"
                                            className={`w-full justify-start gap-2 rounded-lg ${isActive ? "bg-secondary text-secondary-foreground" : ""}`}
                                        >
                                            <item.icon className="h-5 w-5" />
                                            {item.label}
                                        </Button>
                                    )}
                                </Link>
                            ))}
                        </div>
                    </div>
                ))}
            </nav>
            <div className="mt-auto px-2 pb-2">
                <Separator className="mb-4" />
                {username && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                        <User className="h-4 w-4" /> {username}
                    </div>
                )}
                <Button variant="outline" className="w-full justify-start gap-2 mb-2" onClick={handleLogout}>
                    <LogOut className="h-4 w-4" /> {t("nav.logout")}
                </Button>
                <div className="mt-2">
                    <Select value={i18n.language} onValueChange={lng => i18n.changeLanguage(lng)}>
                        <SelectTrigger className="w-full">
                            {i18n.language === "zh" ? "简体中文" : "English"}
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="zh">简体中文</SelectItem>
                            <SelectItem value="en">English</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </aside>
    );

    // 主内容区 Header
    const ContentHeader = (
        <header className="h-16 flex items-center px-6 border-b bg-background/80 backdrop-blur sticky top-0 z-10 rounded-t-2xl">
            <h2 className="text-xl font-semibold tracking-tight">{pageTitle}</h2>
            {/* 右侧可加操作按钮 */}
            <div className="ml-auto flex gap-2"></div>
        </header>
    );

    return (
        <div className="min-h-screen flex bg-background">
            {/* 桌面端 Sidebar */}
            <div className="hidden md:flex h-screen sticky top-0 left-0 z-30">{Sidebar}</div>
            {/* 移动端抽屉按钮 */}
            <div className="md:hidden fixed top-4 left-4 z-40">
                <Button variant="outline" size="icon" onClick={() => setDrawerOpen(true)} aria-label={t("nav.menu")}>
                    <MenuIcon className="h-5 w-5" />
                </Button>
            </div>
            {/* 移动端抽屉 Sidebar */}
            {drawerOpen && (
                <div className="fixed inset-0 z-50 flex">
                    <div className="bg-black/40 flex-1" onClick={() => setDrawerOpen(false)} />
                    <div className="relative w-64 h-full bg-card border-r shadow-lg flex flex-col">
                        <button
                            className="absolute top-4 right-4"
                            onClick={() => setDrawerOpen(false)}
                            aria-label={t("nav.close")}
                        >
                            <CloseIcon className="h-5 w-5" />
                        </button>
                        {Sidebar}
                    </div>
                </div>
            )}
            {/* 主内容区 */}
            <main className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                {ContentHeader}
                {/* 内容卡片化 */}
                <div className="flex-1 flex justify-center items-start px-2 py-8 bg-background">
                    <div className="w-full max-w-4xl bg-card rounded-2xl shadow-lg p-6 md:p-10">{children}</div>
                </div>
            </main>
        </div>
    );
}
