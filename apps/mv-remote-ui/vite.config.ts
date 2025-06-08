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
        dedupe: ['react', 'react-dom'],
    },
    server: {
        port: 5999,
        host: '0.0.0.0', // Expose server to the LAN
        proxy: {
            // Proxy /api requests to the mv-player backend dev server
            '/api': {
                target: 'http://localhost:15678', // Your mv-player dev server
                changeOrigin: true, // Recommended for virtual hosted sites
                // No rewrite needed as '/api' is part of the path on both servers
            },
        },
    },
});
