import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { tanstackRouter } from "@tanstack/router-plugin/rspack";
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

export default defineConfig({
  plugins: [pluginReact()],
  server: {
    host: "127.0.0.1",
    port: 3000,
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
    },
    proxy: {
      "/api/user": "http://localhost:5002",
      "/api/questions": "http://localhost:5001",
      "/api/ai": "http://localhost:5006",
    },
  },
  tools: {
    rspack: {
      plugins: [
        tanstackRouter({
          target: "react",
          autoCodeSplitting: true,
        }),
        new MonacoWebpackPlugin({
          languages: ['python']
        }),
      ],
    },
  },
  html: {
    tags: [
      {
        tag: "link",
        attrs: {
          href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&display=swap",
          rel: "stylesheet",
        },
      },
      {
        tag: "script",
        attrs: {
          src: "https://cdn.jsdelivr.net/pyodide/v0.28.3/full/pyodide.js",
        },
      },
    ]
  },
  performance: {
    preconnect: [
      { href: "https://fonts.googleapis.com" },
      { href: "https://fonts.gstatic.com", crossorigin: true },
    ],
  }
});
