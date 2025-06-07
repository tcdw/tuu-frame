import { Outlet, createRootRoute } from "@tanstack/react-router";
import { AuthProvider } from "../auth"; // Adjusted path for AuthProvider

export const Route = createRootRoute({
    component: RootComponent,
});

function RootComponent() {
    return (
        <AuthProvider>
            <Outlet />
        </AuthProvider>
    );
}
