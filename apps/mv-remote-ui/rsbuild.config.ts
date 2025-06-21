import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { tanstackRouter } from "@tanstack/router-plugin/rspack";

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
                tanstackRouter({
                    target: "react",
                    autoCodeSplitting: true,
                }),
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
