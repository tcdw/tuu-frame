import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { tanstackRouter, TanStackRouterGeneratorRspack } from "@tanstack/router-plugin/rspack";

export default defineConfig({
    plugins: [pluginReact()],
    output: {
        distPath: {
            root: "./dist",
        },
    },
    tools: {
        rspack: {
            plugins: [
                {
                    ...(process.env.NODE_ENV === "production"
                        ? tanstackRouter({
                              routesDirectory: "./src/routes",
                              enableRouteGeneration: true,
                          })
                        : TanStackRouterGeneratorRspack({
                              routesDirectory: "./src/routes",
                              enableRouteGeneration: true,
                          })),
                },
            ],
        },
    },
    html: {
        title: "TuuFrame Remote Control",
        template: "./index.html",
        templateParameters: {
            public: "/",
        },
    },
    server: {
        proxy: {
            "/api": "http://localhost:15678",
        },
        host: "0.0.0.0",
    },
});
