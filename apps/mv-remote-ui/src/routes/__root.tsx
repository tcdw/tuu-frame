import { useEffect } from "react";
import { Outlet, createRootRoute } from "@tanstack/react-router";
import { useAuthStore } from "../auth";

export const Route = createRootRoute({
    component: RootComponent,
});

function RootComponent() {
    const initializeAuth = useAuthStore(state => state.initializeAuth);
    const isLoadingInitial = useAuthStore(state => state.isLoadingInitial);

    useEffect(() => {
        initializeAuth();
    }, [initializeAuth]);

    if (isLoadingInitial) {
        // You might want to replace this with a more sophisticated loading spinner or app shell
        return (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
                Loading authentication...
            </div>
        );
    }

    return (
        <>
            <Outlet />
            {/* You can add global layout components here if needed, e.g., a Navbar or Footer */}
        </>
    );
}
