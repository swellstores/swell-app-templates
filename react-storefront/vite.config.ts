import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const appRoot = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  plugins: [tailwindcss(), react(), cloudflare()],
  resolve: {
    alias: {
      "@": path.resolve(appRoot, "src"),
      react: path.resolve(appRoot, "node_modules/react"),
      "react-dom": path.resolve(appRoot, "node_modules/react-dom"),
      "react-router-dom": path.resolve(appRoot, "node_modules/react-router-dom"),
    },
    dedupe: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
      "react-router-dom",
    ],
  },
  optimizeDeps: {
    force: process.env.SWELL_FORCE_OPTIMIZE_DEPS === "1",
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "zustand",
      "swell-js",
      "clsx",
      "tailwind-merge",
      "class-variance-authority",
      "lucide-react",
      "radix-ui",
      "embla-carousel-react",
      "sonner",
      "vaul",
    ],
  },
  build: { sourcemap: false },
  css: {
    devSourcemap: true,
  },
  server: {
    fs: { allow: [".."] },
    allowedHosts: [".trycloudflare.com", ".swell.store", ".swell.test"],
    hmr: false,
    strictPort: true,
  },
});
