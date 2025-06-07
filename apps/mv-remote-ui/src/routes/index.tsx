import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
    beforeLoad: () => {
        throw redirect({
            to: "/dashboard",
        });
    },
    component: () => null, // Component will not be rendered due to redirect
});
