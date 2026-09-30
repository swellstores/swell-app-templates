import { defineConfig } from "vite";
import vinext from "vinext";
import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  server: {
    // Swell CLI tunnels reach the dev server through these hosts.
    allowedHosts: [".trycloudflare.com", ".swell.store", ".swell.test"],
  },
  plugins: [
    vinext(),
    cloudflare({
      viteEnvironment: {
        name: "rsc",
        childEnvironments: ["ssr"],
      },
    }),
  ],
});
