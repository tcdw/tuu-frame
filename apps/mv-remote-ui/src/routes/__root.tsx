import { useEffect } from "react";
import { Outlet, createRootRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { useAuthStore } from "../auth";
import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export const Route = createRootRoute({
    component: RootComponent,
});

function RootComponent() {
    const initializeAuth = useAuthStore(state => state.initializeAuth);
    const isLoadingInitial = useAuthStore(state => state.isLoadingInitial);
    const isAuthenticated = useAuthStore(state => state.isAuthenticated);
    const navigate = useNavigate();
    const router = useRouter();

    useEffect(() => {
        initializeAuth();
    }, [initializeAuth]);

    useEffect(() => {
        // 登录后自动跳转到 /app/dashboard
        if (!isLoadingInitial && isAuthenticated && router.state.location.pathname === "/login") {
            navigate({ to: "/app/dashboard", replace: true });
        }
    }, [isLoadingInitial, isAuthenticated, navigate, router.state.location.pathname]);

    if (isLoadingInitial) {
        // You might want to replace this with a more sophisticated loading spinner or app shell
        return (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
                Loading authentication...
            </div>
        );
    }

    return (
        <QueryClientProvider client={queryClient}>
            <Outlet />
            <Toaster />
            {/* You can add global layout components here if needed, e.g., a Navbar or Footer */}
        </QueryClientProvider>
    );
}
