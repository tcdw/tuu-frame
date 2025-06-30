import * as React from "react";
import { useTranslation } from "react-i18next";
import { IconDashboard, IconListDetails, IconKey } from "@tabler/icons-react";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import { useAuthStore } from "@/auth";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { t } = useTranslation();
    const username = useAuthStore(state => state.username);

    const NAV_ITEMS = [
        { label: t("nav.dashboard"), icon: IconDashboard, to: "/app/dashboard", group: t("nav.group_navigation") },
        { label: t("nav.monitor"), icon: IconListDetails, to: "/app/monitor", group: t("nav.group_navigation") },
        /*{
            label: t("nav.change_password"),
            icon: IconKey,
            to: "/app/settings/change-password",
            group: t("nav.group_settings"),
        },*/
    ];

    // 按 group 分类
    const navMain = NAV_ITEMS.filter(i => i.group === t("nav.group_navigation")).map(i => ({
        title: i.label,
        url: i.to,
        icon: i.icon,
    }));
    const navSettings = NAV_ITEMS.filter(i => i.group === t("nav.group_settings")).map(i => ({
        title: i.label,
        url: i.to,
        icon: i.icon,
    }));

    const user = {
        name: username || "用户",
        email: "", // 暂时为空，按用户要求
        avatar: "", // 暂时为空，按用户要求
    };

    return (
        <Sidebar collapsible="offcanvas" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
                            <a href="#">
                                {/* 可自定义 LOGO */}
                                <span className="text-base font-semibold">Tuu Gallery</span>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={navMain} />
                <NavSecondary items={[...navSettings]} className="mt-auto" />
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={user} />
            </SidebarFooter>
        </Sidebar>
    );
}
