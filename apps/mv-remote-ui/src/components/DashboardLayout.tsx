// import { useAuthStore } from "../auth";
// import { useNavigate } from "@tanstack/react-router";
// import { KeyRound, Monitor, Home } from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import * as React from "react";

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
    // const logout = useAuthStore(state => state.logout);
    // const navigate = useNavigate();

    return (
        <SidebarProvider
            style={
                {
                    "--sidebar-width": "calc(var(--spacing) * 72)",
                    "--header-height": "calc(var(--spacing) * 12)",
                } as React.CSSProperties
            }
        >
            {/* 侧边栏，保留原有 Sidebar 逻辑 */}
            <AppSidebar variant="inset" />
            <SidebarInset>
                {/* 顶部 Header，可嵌入 pageTitle 或 SiteHeader */}
                <SiteHeader />
                <div className="flex flex-1 flex-col">
                    <div className="@container/main flex flex-1 flex-col gap-2">
                        <div className="flex flex-col gap-4 p-4">
                            {/* children 渲染在内容区最后 */}
                            {children}
                        </div>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
