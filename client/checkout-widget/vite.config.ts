import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "tailwindcss";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    postcss: {
      plugins: [tailwindcss()],
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000", // your backend port
        changeOrigin: true,
        secure: false,
        rewrite: (path: any) => path.replace(/^\/api/, "/api"), // keep the /api prefix
      },
    },
  },
});
