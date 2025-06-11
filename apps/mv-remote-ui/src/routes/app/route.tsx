import { Outlet, createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/DashboardLayout";

export const Route = createFileRoute("/app")({
    component: () => (
        <DashboardLayout>
            <Outlet />
        </DashboardLayout>
    ),
});
