import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: '/wykroczenie/', // ← DODAJ TO
  server: {
    port: 3000,
  },
  build: {
    outDir: "dist",
  },
});
