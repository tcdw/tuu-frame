import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import tailwindcssVite from "@tailwindcss/vite";
import path from "path"; // Import the 'path' module

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react(),
        TanStackRouterVite(),
        tailwindcssVite(),
    ],
    resolve: { // Add resolve configuration
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    server: {
        port: 5999,
    },
});
