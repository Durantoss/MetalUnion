import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL('./src', import.meta.url)),
      "@shared": fileURLToPath(new URL('../shared', import.meta.url)),
      "@assets": fileURLToPath(new URL('../attached_assets', import.meta.url)),
    },
  },
  build: {
    outDir: path.resolve(fileURLToPath(new URL('.', import.meta.url)), "..", "dist", "public"),
    emptyOutDir: true,
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
