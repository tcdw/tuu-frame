import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import tailwindcssVite from "@tailwindcss/vite"; // Import the Tailwind CSS Vite plugin

// https://vite.dev/config/
export default defineConfig({
    resolve: {
        dedupe: ['react', 'react-dom'],
    },
    plugins: [
        react(),
        TanStackRouterVite(),
        tailwindcssVite(), // Add the plugin here
    ],
    server: {
        port: 5999,
    },
});
