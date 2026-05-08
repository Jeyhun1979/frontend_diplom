import { copyFileSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const __dirname = dirname(fileURLToPath(import.meta.url));

const GH_PAGES_BASE = "/frontend_diplom/";

export default defineConfig(({ mode }) => ({
  base: mode === "production" ? GH_PAGES_BASE : "/",
  plugins: [
    react(),
    {
      name: "github-pages-spa-fallback",
      closeBundle() {
        if (mode !== "production") return;
        const index = resolve(__dirname, "dist/index.html");
        const fallback = resolve(__dirname, "dist/404.html");
        copyFileSync(index, fallback);
      },
    },
  ],
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: "dist",
    sourcemap: true,
  },
  resolve: {
    alias: {
      "@": "/src",
    },
  },
}));
