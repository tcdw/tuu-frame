import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";

// https://vite.dev/config/
export default defineConfig({
    resolve: {
        dedupe: ['react', 'react-dom'],
    },
    plugins: [react(), TanStackRouterVite()],
    server: {
        port: 5999,
    },
});
